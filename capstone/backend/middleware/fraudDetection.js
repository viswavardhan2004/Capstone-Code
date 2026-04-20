const mongoose = require('mongoose');
const config = require('../config/fraudRules');
const User = require('../models/User');

// Safe imports to prevent crashing if user provided wrong model names (e.g. Gig vs Job)
let Rating, Transaction, Job, Message, FraudAlert;
try { Rating = require('../models/Rating'); } catch (e) { Rating = mongoose.models.Rating || mongoose.model('Rating', new mongoose.Schema({}, { strict: false })); }
try { Transaction = require('../models/Transaction'); } catch (e) { Transaction = mongoose.models.Transaction || mongoose.model('Transaction', new mongoose.Schema({}, { strict: false })); }
try { Job = require('../models/Job'); } catch (e) { Job = mongoose.models.Job || mongoose.model('Job', new mongoose.Schema({}, { strict: false })); }
try { Message = require('../models/Message'); } catch (e) { Message = mongoose.models.Message || mongoose.model('Message', new mongoose.Schema({}, { strict: false })); }
try { FraudAlert = require('../models/FraudAlert'); } catch (e) { FraudAlert = mongoose.models.FraudAlert || mongoose.model('FraudAlert', new mongoose.Schema({}, { strict: false })); }

const checkSelfCycling = async (clientId, freelancerId, clientIP, freelancerIP) => {
  const client = await User.findById(clientId).select('lastKnownIPs');
  const freelancer = await User.findById(freelancerId).select('lastKnownIPs');
  
  const currentMatch = clientIP && freelancerIP && (clientIP === freelancerIP);
  const clientIPs = (client && client.lastKnownIPs) ? [...client.lastKnownIPs] : [];
  if (clientIP) clientIPs.push(clientIP);
  
  const freelancerIPs = (freelancer && freelancer.lastKnownIPs) ? [...freelancer.lastKnownIPs] : [];
  if (freelancerIP) freelancerIPs.push(freelancerIP);
  
  const histMatch = clientIPs.some(ip => freelancerIPs.includes(ip));
  
  const triggered = currentMatch || histMatch || false;
  
  return {
    triggered,
    severity: 'CRITICAL',
    evidence: { clientIP, freelancerIP, historicalMatch: histMatch }
  };
};

const checkRatingVelocity = async (freelancerId) => {
  const since = new Date(Date.now() - config.RATING_VELOCITY_WINDOW_HOURS * 3600000);
  const count = await Rating.countDocuments({ target: freelancerId, score: 5, createdAt: { $gte: since } });
  
  return {
    triggered: count >= config.RATING_VELOCITY_THRESHOLD,
    severity: 'HIGH',
    evidence: { ratingsInWindow: count, threshold: config.RATING_VELOCITY_THRESHOLD }
  };
};

const checkRefundHistory = async (clientId) => {
  const count = await Transaction.countDocuments({ client: clientId, status: 'refunded' });
  
  return {
    triggered: count >= config.REFUND_THRESHOLD,
    severity: 'HIGH',
    evidence: { lifetimeRefunds: count, threshold: config.REFUND_THRESHOLD }
  };
};

const checkAccountRush = async (userId) => {
  const user = await User.findById(userId).select('createdAt completedJobs activeJobs');
  if (!user) return { triggered: false, severity: 'HIGH', evidence: {} };
  
  const ageDays = (Date.now() - new Date(user.createdAt)) / 86400000;
  const jobCount = (user.completedJobs || 0) + (user.activeJobs || 0);
  
  const triggered = (ageDays < config.NEW_ACCOUNT_AGE_DAYS) && (jobCount >= config.NEW_ACCOUNT_JOB_THRESHOLD);
  
  return {
    triggered,
    severity: 'HIGH',
    evidence: { accountAgeDays: parseFloat(ageDays.toFixed(1)), jobCount }
  };
};

const checkBilateralCollusion = async (clientId, freelancerId) => {
  const [aToB, bToA] = await Promise.all([
    Rating.countDocuments({ author: clientId, target: freelancerId, score: 5 }),
    Rating.countDocuments({ author: freelancerId, target: clientId, score: 5 })
  ]);
  
  const triggered = (aToB >= config.COLLUSION_RATING_THRESHOLD) && (bToA >= config.COLLUSION_RATING_THRESHOLD);
  
  return {
    triggered,
    severity: 'MODERATE',
    evidence: { clientToFreelancer: aToB, freelancerToClient: bToA }
  };
};

const checkZeroChat = async (jobId) => {
  const [msgCount, job] = await Promise.all([
    Message.countDocuments({ jobId }),
    Job.findById(jobId).select('status')
  ]);
  
  const triggered = (msgCount === 0) && job && (job.status === 'completed');
  
  return {
    triggered: Boolean(triggered),
    severity: 'HIGH',
    evidence: { messageCount: msgCount }
  };
};

const checkFastCompletion = async (jobId) => {
  const job = await Job.findById(jobId).select('hiredAt completedAt category');
  if (!job || !job.completedAt || !job.hiredAt) return { triggered: false, severity: 'HIGH', evidence: {} };
  
  const mins = (new Date(job.completedAt) - new Date(job.hiredAt)) / 60000;
  const isTech = config.TECHNICAL_CATEGORIES.includes((job.category || '').toLowerCase());
  const triggered = (mins < config.FAST_COMPLETION_MINUTES) && isTech;
  
  return {
    triggered,
    severity: 'HIGH',
    evidence: { minutesTaken: parseFloat(mins.toFixed(1)), category: job.category }
  };
};

const checkSuspiciousPrice = async (jobId) => {
  const job = await Job.findById(jobId).select('price category');
  if (!job) return { triggered: false, severity: 'MEDIUM', evidence: {} };
  
  const [avgResult] = await Job.aggregate([
    { $match: { category: job.category, status: 'completed' } },
    { $group: { _id: null, avg: { $avg: '$price' } } }
  ]);
  
  const avg = avgResult?.avg || 0;
  const triggered = (avg > 0) && (job.price < (avg * config.SUSPICIOUS_PRICE_PERCENT));
  
  return {
    triggered,
    severity: 'MEDIUM',
    evidence: { jobPrice: job.price, categoryAverage: parseFloat(avg.toFixed(0)) }
  };
};

const checkSameWeekAccounts = async (clientId, freelancerId) => {
  const [c, f] = await Promise.all([
    User.findById(clientId).select('createdAt'),
    User.findById(freelancerId).select('createdAt')
  ]);
  if (!c || !f || !c.createdAt || !f.createdAt) return { triggered: false, severity: 'MEDIUM', evidence: {} };
  
  const diffDays = Math.abs(new Date(c.createdAt) - new Date(f.createdAt)) / 86400000;
  const triggered = diffDays < config.SAME_WEEK_DAYS;
  
  return {
    triggered,
    severity: 'MEDIUM',
    evidence: { daysBetweenRegistrations: parseFloat(diffDays.toFixed(1)) }
  };
};

const checkInstantEscrow = async (jobId) => {
  const job = await Job.findById(jobId).select('submittedAt escrowReleasedAt revisionCount');
  if (!job || !job.submittedAt || !job.escrowReleasedAt) return { triggered: false, severity: 'MEDIUM', evidence: {} };
  
  const mins = (new Date(job.escrowReleasedAt) - new Date(job.submittedAt)) / 60000;
  const triggered = (mins < config.INSTANT_ESCROW_MINUTES) && ((job.revisionCount || 0) === 0);
  
  return {
    triggered,
    severity: 'MEDIUM',
    evidence: { minutesToRelease: parseFloat(mins.toFixed(1)), revisions: job.revisionCount || 0 }
  };
};

const checkDeviceFingerprint = async (clientId, freelancerId) => {
  const [c, f] = await Promise.all([
    User.findById(clientId).select('deviceFingerprint'),
    User.findById(freelancerId).select('deviceFingerprint')
  ]);
  
  const match = c && f && c.deviceFingerprint && (c.deviceFingerprint === f.deviceFingerprint);
  const triggered = Boolean(match);
  
  return {
    triggered,
    severity: 'CRITICAL',
    evidence: { fingerprintMatch: match }
  };
};

const checkSkillMismatch = async (freelancerId, jobId) => {
  const [user, job] = await Promise.all([
    User.findById(freelancerId).select('skills'),
    Job.findById(jobId).select('requiredSkills')
  ]);
  if (!user || !job) return { triggered: false, severity: 'MEDIUM', evidence: {} };
  
  const userSkills = (user.skills || []).map(s => s.toLowerCase());
  const jobSkills = (job.requiredSkills || []).map(s => s.toLowerCase());
  const overlap = userSkills.filter(s => jobSkills.includes(s));
  
  const triggered = (jobSkills.length > 0) && (overlap.length === 0);
  
  return {
    triggered,
    severity: 'MEDIUM',
    evidence: { userSkillCount: userSkills.length, overlap }
  };
};

const checkBurstPosting = async (clientId) => {
  const since = new Date(Date.now() - 3600000); // 1 hour ago
  const count = await Job.countDocuments({ client: clientId, createdAt: { $gte: since } });
  
  return {
    triggered: count >= config.BURST_JOBS_PER_HOUR,
    severity: 'MEDIUM',
    evidence: { jobsPostedLastHour: count, threshold: config.BURST_JOBS_PER_HOUR }
  };
};

const calculateFraudScore = (results) => {
  let score = 0;
  const triggered = [];
  
  for (const key in results) {
    if (results[key].triggered) {
      score += (config.WEIGHTS[key] || 0);
      triggered.push({
        rule: key,
        severity: results[key].severity,
        evidence: results[key].evidence
      });
    }
  }
  
  const verdict = score >= config.BLOCK_THRESHOLD ? 'BLOCK'
                : score >= config.REVIEW_THRESHOLD ? 'REVIEW'
                : 'ALLOW';
                
  return { score: parseFloat(score.toFixed(2)), verdict, triggered };
};

const runFraudCheck = async (clientId, freelancerId, jobId, clientIP) => {
  try {
    const [r1, r2, r3, r4c, r4f, r5, r6, r7, r8, r9, r10, r11, r12, r13] = await Promise.all([
      checkSelfCycling(clientId, freelancerId, clientIP, null),
      checkRatingVelocity(freelancerId),
      checkRefundHistory(clientId),
      checkAccountRush(clientId),
      checkAccountRush(freelancerId),
      checkBilateralCollusion(clientId, freelancerId),
      checkZeroChat(jobId),
      checkFastCompletion(jobId),
      checkSuspiciousPrice(jobId),
      checkSameWeekAccounts(clientId, freelancerId),
      checkInstantEscrow(jobId),
      checkDeviceFingerprint(clientId, freelancerId),
      checkSkillMismatch(freelancerId, jobId),
      checkBurstPosting(clientId)
    ]);
    
    const r4 = r4c.triggered || r4f.triggered ? (r4c.triggered ? r4c : r4f) : r4f;
    const results = { r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13 };
    
    const { score, verdict, triggered } = calculateFraudScore(results);
    
    let alert = null;
    if (verdict !== 'ALLOW') {
      alert = await FraudAlert.create({
        clientId,
        freelancerId,
        jobId,
        fraudScore: score,
        verdict,
        triggeredRules: triggered
      });
    }
    
    return { verdict, score, triggered, alert };
  } catch (err) {
    console.error('Fraud Check Error:', err);
    return { verdict: 'ALLOW', score: 0, triggered: [] };
  }
};

module.exports = {
  runFraudCheck
};

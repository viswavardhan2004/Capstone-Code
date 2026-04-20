const mongoose = require('mongoose');
const { runFraudCheck } = require('../middleware/fraudDetection');
const User = require('../models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/microjob';

async function verifyTests() {
  try {
    await mongoose.connect(MONGO_URI);
    
    const client = new User({ _id: new mongoose.Types.ObjectId(), name: "Client", role: "client", email: "c@c.com", password: "1", lastKnownIPs: ['127.0.0.1'] });
    const freelancer = new User({ _id: new mongoose.Types.ObjectId(), name: "Student", role: "student", email: "s@s.edu", password: "1", lastKnownIPs: ['192.168.1.100'] });
    
    await client.save();
    await freelancer.save();
    
    // Normal Check
    const normalData = await runFraudCheck(client._id, freelancer._id, new mongoose.Types.ObjectId(), '123.123.123.123');
    console.log('[TEST 1] Normal Hire: Verdict = ', normalData.verdict, normalData.triggered);
    
    // Self Dealing Check (Same IP)
    // To trigger R1, we give them the same IP historically or current
    const fraudDataExplicitIP = await runFraudCheck(client._id, freelancer._id, new mongoose.Types.ObjectId(), '192.168.1.100');
    console.log('[TEST 2] Self-Dealing runFraudCheck: Verdict = ', fraudDataExplicitIP.verdict, fraudDataExplicitIP.triggered);
    
    // end test    await User.deleteMany({ email: { $in: ['c@c.com', 's@s.edu'] } });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verifyTests();

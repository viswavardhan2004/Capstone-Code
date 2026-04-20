const mongoose = require('mongoose');

const fraudAlertSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  fraudScore: { type: Number, required: true },
  verdict: { type: String, enum: ['BLOCK', 'REVIEW', 'ALLOW'], required: true },
  triggeredRules: [{
    rule: String,
    severity: String,
    evidence: mongoose.Schema.Types.Mixed
  }],
  reviewStatus: { 
    type: String, 
    enum: ['pending', 'cleared', 'confirmed_fraud', 'escalated'], 
    default: 'pending' 
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  llmExplanation: { type: String, default: null },
  ragSimilarCases: { type: [mongoose.Schema.Types.Mixed], default: [] },
  embedding: { type: [Number], default: [] }
}, {
  timestamps: true
});

module.exports = mongoose.model('FraudAlert', fraudAlertSchema);

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  status: { type: String, default: 'open' },
  category: String,
  price: Number,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hiredAt: Date,
  completedAt: Date,
  submittedAt: Date,
  escrowReleasedAt: Date,
  revisionCount: { type: Number, default: 0 },
  requiredSkills: [String]
}, { timestamps: true });

module.exports = mongoose.models.Job || mongoose.model('Job', jobSchema);

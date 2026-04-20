const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  title: String,
  status: {
    type: String,
    enum: ['WAITING_ADMIN_APPROVAL', 'IN_ESCROW', 'WORK_SUBMITTED', 'COMPLETED', 'REVISION_REQUESTED', 'REJECTED'],
    default: 'WAITING_ADMIN_APPROVAL'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  qrScannedAt: Date,
  paymentVerifiedAt: Date,
  escrowLockedAt: Date,
  workSubmittedAt: Date,
  completedAt: Date,
  fundsReleasedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  rating: Number,
  review: String,
  ratedAt: Date,
  revisionMessage: String
});

module.exports = mongoose.model('Transaction', transactionSchema);

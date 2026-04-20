const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
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
  gigTitle: String,
  studentName: String,
  clientName: String,
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['deposit_pending', 'in_escrow', 'in_progress', 'submitted_for_review', 'completed', 'disputed', 'revision_requested'],
    default: 'deposit_pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  startedAt: Date,
  dueDate: Date,
  submittedAt: Date,
  completedAt: Date,
  deliverables: String,
  submissionNotes: String,
  revisionRequest: String,
  rating: {
    type: Number,
    default: 0
  },
  review: String,
  messages: [{
    userId: String,
    senderType: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
});

module.exports = mongoose.model('Order', orderSchema);

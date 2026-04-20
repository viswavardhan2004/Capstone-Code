const Transaction = require('../models/Transaction');
const User = require('../models/User');

// ===== PAYMENT FLOW =====
// 1. Client clicks "Hire Me" -> QR Modal shows with Amount
// 2. Client scans QR, pays via UPI, clicks "I Have Paid"  
// 3. Transaction created: status = WAITING_ADMIN_APPROVAL
// 4. Admin checks bank, clicks "Confirm Payment"
// 5. Status = IN_ESCROW (funds locked)
// 6. Student sees "Escrow Funded" and works

// Step 1: Client initiates payment (after scanning QR and paying)
exports.createEscrow = async (req, res) => {
  try {
    const { title, amount, studentId, clientId } = req.body;
    
    // Lookup users by email if emails are provided
    let studentObjectId = studentId;
    let clientObjectId = clientId;
    
    // If studentId looks like an email, find the user
    if (studentId && studentId.includes('@')) {
      const student = await User.findOne({ email: studentId });
      if (student) {
        studentObjectId = student._id;
      } else {
        return res.status(404).json({ error: 'Student not found with that email' });
      }
    }
    
    // If clientId looks like an email, find the user
    if (clientId && clientId.includes('@')) {
      const client = await User.findOne({ email: clientId });
      if (client) {
        clientObjectId = client._id;
      } else {
        return res.status(404).json({ error: 'Client not found with that email' });
      }
    }
    
    // Use ObjectIds or fallback to default IDs
    
    // ── SELF-DEALING GUARD: user cannot hire themselves ──────────────────
    if (studentObjectId && clientObjectId &&
        studentObjectId.toString() === clientObjectId.toString()) {
      return res.status(403).json({
        error: 'Self-dealing detected: You cannot hire yourself.',
        code: 'SELF_HIRE_BLOCKED'
      });
    }

    const { runFraudCheck } = require('../middleware/fraudDetection');
    const { generateFraudExplanation } = require('../services/llmExplainer');
    const { verdict, score, triggered, alert } = await runFraudCheck(clientObjectId, studentObjectId, null, req.ip);
    if (alert) generateFraudExplanation(triggered, [], alert._id).catch(err => console.error('LLM error:', err.message));
    if (verdict === 'BLOCK') return res.status(403).json({ error: 'Transaction blocked by fraud engine.', score });

    const transaction = new Transaction({
      studentId: studentObjectId || '000000000000000000000001',
      clientId: clientObjectId || '000000000000000000000999',
      amount,
      title,
      status: 'WAITING_ADMIN_APPROVAL',
      qrScannedAt: new Date()
    });
    
    await transaction.save();
    
    res.status(201).json({ 
      message: "Payment proof submitted to admin",
      transaction,
      nextStep: "Admin will verify the payment within 5 minutes"
    });
  } catch (error) {
    console.error('Create escrow error:', error);
    res.status(500).json({ error: 'Failed to create escrow', details: error.message });
  }
};

// Step 2: Admin verifies payment (after checking bank account)
exports.adminConfirmPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (transaction.status !== 'WAITING_ADMIN_APPROVAL') {
      return res.status(400).json({ error: "Transaction not awaiting approval" });
    }

    transaction.status = 'IN_ESCROW';
    transaction.paymentVerifiedAt = new Date();
    transaction.escrowLockedAt = new Date();

    await transaction.save();

    res.json({ 
      success: true,
      message: "Payment verified! Funds locked in escrow.",
      transaction,
      studentNotification: "Your escrow is funded! You can now start working."
    });
  } catch (error) {
    console.error('Admin confirm error:', error);
    res.status(500).json({ error: 'Failed to confirm payment', details: error.message });
  }
};

// Step 3: Student submits work (after escrow is funded)
exports.submitWork = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Allow initial submission when funded, and re-submission after revisions
    const canSubmit = transaction.status === 'IN_ESCROW' || transaction.status === 'REVISION_REQUESTED';
    if (!canSubmit) {
      return res.status(400).json({ error: "Cannot submit work in current status" });
    }

    transaction.status = 'WORK_SUBMITTED';
    transaction.workSubmittedAt = new Date();
    // Clear any previous revision message once work is resubmitted
    transaction.revisionMessage = '';

    await transaction.save();

    res.json({ 
      success: true,
      message: "Work submitted! Client reviewing...",
      transaction,
      escrowStatus: "Funds locked until client approves"
    });
  } catch (error) {
    console.error('Submit work error:', error);
    res.status(500).json({ error: 'Failed to submit work', details: error.message });
  }
};

// Step 4: Client approves work (releases funds from escrow)
exports.approveWork = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { rating, review } = req.body;
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (transaction.status !== 'WORK_SUBMITTED') {
      return res.status(400).json({ error: "No work submitted to approve" });
    }

    // ── SELF-APPROVAL GUARD: client cannot approve their own work ────────
    const approverId = req.body.approverId || req.headers['x-user-id'];
    if (approverId && transaction.studentId.toString() === approverId.toString()) {
      return res.status(403).json({
        error: 'Self-approval detected: You cannot approve work you submitted yourself.',
        code: 'SELF_APPROVAL_BLOCKED'
      });
    }

    transaction.status = 'COMPLETED';
    transaction.completedAt = new Date();
    transaction.rating = rating || 5;
    transaction.review = review || '';
    transaction.fundsReleasedAt = new Date();

    await transaction.save();

    res.json({ 
      success: true,
      message: "Work approved! Funds released to student",
      transaction,
      studentEarnings: {
        amount: transaction.amount,
        netAfterFee: transaction.amount * 0.9,
        status: "Transferred to student wallet"
      }
    });
  } catch (error) {
    console.error('Approve work error:', error);
    res.status(500).json({ error: 'Failed to approve work', details: error.message });
  }
};

// Alternative: Client requests revision
exports.requestRevision = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { reason, revisionMessage } = req.body;
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    transaction.status = 'REVISION_REQUESTED';
    transaction.revisionMessage = reason || revisionMessage || '';

    await transaction.save();

    res.json({ 
      success: true,
      message: "Revision requested. Funds remain locked.",
      transaction
    });
  } catch (error) {
    console.error('Request revision error:', error);
    res.status(500).json({ error: 'Failed to request revision', details: error.message });
  }
};

// Rate a completed transaction
exports.rateTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { rating, review, raterId } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    
    const transaction = await Transaction.findById(transactionId).populate('studentId');

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (transaction.status !== 'COMPLETED') {
      return res.status(400).json({ error: "Can only rate completed transactions" });
    }

    if (transaction.rating) {
      return res.status(400).json({ error: "Transaction already rated" });
    }

    // ── SELF-RATING GUARD: you cannot rate yourself ──────────────────────
    if (raterId && transaction.studentId._id.toString() === raterId.toString()) {
      return res.status(403).json({
        error: 'Self-rating detected: You cannot rate your own work.',
        code: 'SELF_RATING_BLOCKED'
      });
    }
    // Also block if client and student resolve to same account
    if (transaction.clientId.toString() === transaction.studentId._id.toString()) {
      return res.status(403).json({
        error: 'Self-rating detected: Client and freelancer are the same user.',
        code: 'SELF_RATING_BLOCKED'
      });
    }

    // Update transaction with rating
    transaction.rating = rating;
    transaction.review = review || '';
    transaction.ratedAt = new Date();
    await transaction.save();

    // Update student's average rating
    const studentId = transaction.studentId._id;
    const allRatings = await Transaction.find({ 
      studentId: studentId,
      status: 'COMPLETED',
      rating: { $exists: true, $ne: null }
    });

    const avgRating = allRatings.reduce((sum, t) => sum + t.rating, 0) / allRatings.length;
    
    await User.findByIdAndUpdate(studentId, {
      'profile.rating': Math.round(avgRating * 10) / 10, // Round to 1 decimal
      'profile.completedOrders': allRatings.length
    });

    res.json({ 
      success: true,
      message: "Rating submitted successfully",
      transaction,
      averageRating: Math.round(avgRating * 10) / 10
    });
  } catch (error) {
    console.error('Rate transaction error:', error);
    res.status(500).json({ error: 'Failed to rate transaction', details: error.message });
  }
};

// Get all transactions
exports.getStatus = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: 'Failed to get transactions', details: error.message });
  }
};

// Get pending payments for admin dashboard
exports.getPendingPayments = async (req, res) => {
  try {
    const pending = await Transaction.find({ status: 'WAITING_ADMIN_APPROVAL' }).sort({ createdAt: -1 });
    res.json(pending);
  } catch (error) {
    console.error('Get pending error:', error);
    res.status(500).json({ error: 'Failed to get pending payments', details: error.message });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format (must be 24 hex characters)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid transaction ID format" });
    }
    
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to get transaction', details: error.message });
  }
};

// Get transactions for a student
exports.getStudentTransactions = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // If studentId is an email, find the user first
    let studentObjectId = studentId;
    if (studentId && studentId.includes('@')) {
      const User = require('../models/User');
      const student = await User.findOne({ email: studentId });
      if (student) {
        studentObjectId = student._id;
      } else {
        return res.json([]); // Return empty if student not found
      }
    }
    
    const transactions = await Transaction.find({ studentId: studentObjectId }).sort({ createdAt: -1 }).populate('studentId', 'name email').populate('clientId', 'name email');
    res.json(transactions);
  } catch (error) {
    console.error('Get student transactions error:', error);
    res.status(500).json({ error: 'Failed to get student transactions', details: error.message });
  }
};

// Get transactions for a client (their purchases/orders)
exports.getClientTransactions = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // If clientId is an email, find the user first
    let clientObjectId = clientId;
    if (clientId && clientId.includes('@')) {
      const User = require('../models/User');
      const client = await User.findOne({ email: clientId });
      if (client) {
        clientObjectId = client._id;
      } else {
        return res.json([]); // Return empty if client not found
      }
    }
    
    const transactions = await Transaction.find({ clientId: clientObjectId }).sort({ createdAt: -1 }).populate('studentId', 'name email').populate('clientId', 'name email');
    res.json(transactions);
  } catch (error) {
    console.error('Get client transactions error:', error);
    res.status(500).json({ error: 'Failed to get client transactions', details: error.message });
  }
};

// Admin rejects payment (invalid/fraudulent payment)
exports.adminRejectPayment = async (req, res) => {
  try {
    const { transactionId, reason } = req.body;
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (transaction.status !== 'WAITING_ADMIN_APPROVAL') {
      return res.status(400).json({ error: "Transaction not awaiting approval" });
    }

    transaction.status = 'REJECTED';
    transaction.rejectedAt = new Date();
    transaction.rejectionReason = reason || 'Payment verification failed';

    await transaction.save();

    res.json({ 
      success: true,
      message: "Payment rejected successfully.",
      transaction,
      clientNotification: `Payment rejected: ${transaction.rejectionReason}. Please try again or contact support.`
    });
  } catch (error) {
    console.error('Admin reject error:', error);
    res.status(500).json({ error: 'Failed to reject payment', details: error.message });
  }
};

// Get ratings for a student
exports.getStudentRatings = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // If studentId is an email, find the user first
    let studentObjectId = studentId;
    if (studentId && studentId.includes('@')) {
      const student = await User.findOne({ email: studentId });
      if (student) {
        studentObjectId = student._id;
      } else {
        return res.json({ ratings: [], averageRating: 0, totalRatings: 0 });
      }
    }
    
    const ratings = await Transaction.find({ 
      studentId: studentObjectId,
      status: 'COMPLETED',
      rating: { $exists: true, $ne: null }
    })
    .populate('clientId', 'name email')
    .sort({ completedAt: -1 })
    .select('rating review clientId completedAt title');

    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, t) => sum + t.rating, 0) / ratings.length 
      : 0;

    res.json({
      ratings: ratings.map(r => ({
        rating: r.rating,
        review: r.review,
        clientName: r.clientId?.name || 'Anonymous',
        date: r.completedAt,
        title: r.title
      })),
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: ratings.length
    });
  } catch (error) {
    console.error('Get student ratings error:', error);
    res.status(500).json({ error: 'Failed to get ratings', details: error.message });
  }
};

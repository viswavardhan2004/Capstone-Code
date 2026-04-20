const express = require('express');
const escrowController = require('../controllers/escrowController');

const router = express.Router();

// NEW QR PAYMENT FLOW ROUTES
// 1. Client clicks "Hire Me" -> shows QR Modal
// 2. Client scans QR, pays via UPI, clicks "I Have Paid"
router.post('/create', escrowController.createEscrow);

// 3. Admin verifies payment (checks bank account)
router.post('/admin-confirm', escrowController.adminConfirmPayment);

// Admin rejects payment (invalid/fraudulent)
router.post('/admin-reject', escrowController.adminRejectPayment);

// 4. Student submits work (after escrow funded)
router.post('/submit-work', escrowController.submitWork);

// 5. Client approves work (funds released)
router.post('/approve/:id', escrowController.approveWork);

// Alternative: Client requests revision
router.post('/request-revision/:id', escrowController.requestRevision);

// Rate a transaction
router.post('/rate/:id', escrowController.rateTransaction);

// Get all transactions (MUST be before /:id)
router.get('/status', escrowController.getStatus);

// Get pending payments for admin (MUST be before /:id)
router.get('/pending', escrowController.getPendingPayments);

// Get transactions for a student (MUST be before /:id)
router.get('/student/:studentId', escrowController.getStudentTransactions);

// Get transactions for a client (MUST be before /:id)
router.get('/client/:clientId', escrowController.getClientTransactions);

// Get ratings for a student (MUST be before /:id)
router.get('/ratings/:studentId', escrowController.getStudentRatings);

// Get single transaction (MUST be LAST to avoid catching other routes)
router.get('/:id', escrowController.getTransactionById);

module.exports = router;
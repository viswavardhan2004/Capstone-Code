const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');

const router = express.Router();

// Get all users for admin dashboard
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    const formattedUsers = users.map(user => ({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: 'active', // All users are active unless we add a status field
      verified: user.verified,
      completedOrders: user.profile?.completedOrders || 0,
      joinedDate: new Date(user.createdAt).toLocaleDateString(),
      earnings: user.profile?.earnings || 0
    }));
    res.json(formattedUsers);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to get users', details: error.message });
  }
});

// Get all transactions for admin dashboard
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('studentId', 'name email')
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });
    
    const formattedTransactions = transactions.map(trans => ({
      _id: trans._id,
      studentName: trans.studentId?.name || 'Unknown Student',
      clientName: trans.clientId?.name || 'Unknown Client',
      studentEmail: trans.studentId?.email,
      clientEmail: trans.clientId?.email,
      title: trans.title,
      amount: trans.amount,
      status: trans.status,
      createdAt: new Date(trans.createdAt),
      rejectionReason: trans.rejectionReason || null
    }));
    res.json(formattedTransactions);
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions', details: error.message });
  }
});

// Get all orders for admin dashboard
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to get orders', details: error.message });
  }
});

// Get dashboard stats with comprehensive analytics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalTransactions = await Transaction.countDocuments();
    const pendingTransactions = await Transaction.countDocuments({ status: 'WAITING_ADMIN_APPROVAL' });
    const rejectedTransactions = await Transaction.countDocuments({ status: 'REJECTED' });
    const completedTransactions = await Transaction.countDocuments({ status: 'COMPLETED' });
    const inEscrowTransactions = await Transaction.countDocuments({ status: 'IN_ESCROW' });
    
    const totalRevenue = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const completedRevenue = await Transaction.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingRevenue = await Transaction.aggregate([
      { $match: { status: { $in: ['WAITING_ADMIN_APPROVAL', 'IN_ESCROW', 'WORK_SUBMITTED'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Calculate success rate
    const successRate = totalTransactions > 0 ? ((completedTransactions / totalTransactions) * 100).toFixed(2) : 0;

    // Get average transaction value
    const avgTransaction = totalTransactions > 0 ? (totalRevenue[0]?.total / totalTransactions).toFixed(2) : 0;

    // Get platform commission (10% of total)
    const platformCommission = ((totalRevenue[0]?.total || 0) * 0.1).toFixed(2);

    // Transaction trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTransactions = await Transaction.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Top performing students (by completed transactions)
    const topStudentsRaw = await Transaction.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: {
        _id: '$studentId',
        totalEarnings: { $sum: '$amount' },
        completedCount: { $sum: 1 }
      }},
      { $sort: { totalEarnings: -1 } },
      { $limit: 5 }
    ]);

    // Populate student names
    const topStudents = await Promise.all(
      topStudentsRaw.map(async (student) => {
        const user = await User.findById(student._id);
        return {
          ...student,
          studentName: user?.name || 'Unknown Student',
          studentEmail: user?.email
        };
      })
    );

    // Status breakdown
    const statusBreakdown = await Transaction.aggregate([
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    res.json({
      users: {
        total: totalUsers,
        students: totalStudents,
        clients: totalClients
      },
      transactions: {
        total: totalTransactions,
        completed: completedTransactions,
        pending: pendingTransactions,
        inEscrow: inEscrowTransactions,
        rejected: rejectedTransactions,
        recentTrend: recentTransactions
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        completed: completedRevenue[0]?.total || 0,
        pending: pendingRevenue[0]?.total || 0,
        commission: platformCommission,
        avgValue: avgTransaction
      },
      metrics: {
        successRate: parseFloat(successRate),
        avgTransactionValue: parseFloat(avgTransaction)
      },
      topStudents,
      statusBreakdown
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats', details: error.message });
  }
});

module.exports = router;

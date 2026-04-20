const express = require('express');
const FraudAlert = require('../models/FraudAlert');
const jwt = require('jsonwebtoken');

const router = express.Router();

const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Auth required' });
  // Allow local dev admin token
  if (token.startsWith('admin-token-')) {
    req.user = { userId: 'admin', role: 'admin' };
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'patent_secret_key');
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/fraud-alerts', adminAuth, async (req, res) => {
  try {
    const alerts = await FraudAlert.find({ reviewStatus: 'pending' })
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(alerts || []);
  } catch (err) {
    console.error('Fraud alerts GE error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/fraud-alerts/:id', adminAuth, async (req, res) => {
  try {
    const { reviewStatus } = req.body;
    const alert = await FraudAlert.findByIdAndUpdate(
      req.params.id,
      { reviewStatus, reviewedBy: req.user.userId || req.user.id, reviewedAt: new Date() },
      { new: true }
    );
    res.json(alert);
  } catch (err) {
    console.error('Fraud alerts PATCH error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

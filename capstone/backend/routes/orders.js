const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

// Create order
router.post('/create', async (req, res) => {
  try {
    const { gigId, studentId, clientId, amount, gigTitle, studentName, clientName } = req.body;

    if (!gigId || !studentId || !clientId || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const order = new Order({
      gigId,
      studentId,
      clientId,
      gigTitle,
      studentName,
      clientName,
      amount,
      status: 'deposit_pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      messages: []
    });

    await order.save();
    res.status(201).json({ message: "Order created. Proceed to payment.", order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Get orders for student
router.get('/student/:studentId', async (req, res) => {
  try {
    let studentObjectId = req.params.studentId;
    
    // If studentId looks like an email, find the user
    if (studentObjectId && studentObjectId.includes('@')) {
      const student = await User.findOne({ email: studentObjectId });
      if (student) {
        studentObjectId = student._id;
      } else {
        // Return empty array if student not found
        return res.json([]);
      }
    }
    
    const studentOrders = await Order.find({ studentId: studentObjectId })
      .populate('clientId', 'name email')
      .populate('studentId', 'name email profile')
      .sort({ createdAt: -1 });
    res.json(studentOrders);
  } catch (error) {
    console.error('Get student orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
});

// Get orders for client
router.get('/client/:clientId', async (req, res) => {
  try {
    let clientObjectId = req.params.clientId;
    
    // If clientId looks like an email, find the user
    if (clientObjectId && clientObjectId.includes('@')) {
      const client = await User.findOne({ email: clientObjectId });
      if (client) {
        clientObjectId = client._id;
      } else {
        // Return empty array if client not found
        return res.json([]);
      }
    }
    
    const clientOrders = await Order.find({ clientId: clientObjectId })
      .populate('studentId', 'name email profile')
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });
    res.json(clientOrders);
  } catch (error) {
    console.error('Get client orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
});

// Get single order
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order', details: error.message });
  }
});

// Update order status
router.put('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const validStatuses = ['deposit_pending', 'in_escrow', 'in_progress', 'submitted_for_review', 'completed', 'disputed', 'revision_requested'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    order.status = status;
    await order.save();
    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order', details: error.message });
  }
});

// Student starts work
router.post('/:orderId/start-work', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = 'in_progress';
    order.startedAt = new Date();

    await order.save();
    res.json({ message: "Work started", order });
  } catch (error) {
    console.error('Start work error:', error);
    res.status(500).json({ error: 'Failed to start work', details: error.message });
  }
});

// Student submits work
router.post('/:orderId/submit-work', async (req, res) => {
  try {
    const { deliverables, notes } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== 'in_progress' && order.status !== 'revision_requested') {
      return res.status(400).json({ error: "Order not in correct status" });
    }

    order.status = 'submitted_for_review';
    order.deliverables = deliverables;
    order.submittedAt = new Date();
    order.submissionNotes = notes;

    await order.save();
    res.json({ message: "Work submitted for review", order });
  } catch (error) {
    console.error('Submit work error:', error);
    res.status(500).json({ error: 'Failed to submit work', details: error.message });
  }
});

// Client approves work
router.post('/:orderId/approve', async (req, res) => {
  try {
    const { rating, review } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== 'submitted_for_review') {
      return res.status(400).json({ error: "Work not pending review" });
    }

    order.status = 'completed';
    order.completedAt = new Date();
    order.rating = rating || 5;
    order.review = review || '';

    await order.save();

    res.json({ 
      message: "Work approved! Payment released to student", 
      order,
      platformFee: (order.amount * 0.1).toFixed(2),
      studentEarnings: (order.amount * 0.9).toFixed(2)
    });
  } catch (error) {
    console.error('Approve work error:', error);
    res.status(500).json({ error: 'Failed to approve work', details: error.message });
  }
});

// Client requests revision
router.post('/:orderId/request-revision', async (req, res) => {
  try {
    const { revisionRequest } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = 'revision_requested';
    order.revisionRequest = revisionRequest;

    await order.save();
    res.json({ message: "Revision requested. Funds remain locked.", order });
  } catch (error) {
    console.error('Request revision error:', error);
    res.status(500).json({ error: 'Failed to request revision', details: error.message });
  }
});

// Add message to order
router.post('/:orderId/message', async (req, res) => {
  try {
    const { userId, message, senderType } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.messages.push({
      userId,
      senderType,
      message,
      timestamp: new Date()
    });

    await order.save();
    res.json({ message: "Message added", order });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message', details: error.message });
  }
});

// Get messages for order
router.get('/:orderId/messages', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order.messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
});

module.exports = router;

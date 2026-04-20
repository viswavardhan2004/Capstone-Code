const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

// Get conversation ID (deterministic and order-independent)
const getConversationId = (a, b) => [a, b].sort().join('_');

// Get user info from User model
const getUserInfo = async (userId) => {
  try {
    const user = await User.findOne({ email: userId });
    if (user) {
      return { name: user.name, email: user.email, role: user.role };
    }
  } catch (err) {
    console.error('Error fetching user info:', err);
  }
  return { name: userId.split('@')[0], email: userId, role: 'user' };
};

// List conversations for a user
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ timestamp: -1 });

    // Group by conversation
    const convMap = {};
    for (const msg of messages) {
      const other = msg.sender === userId ? msg.receiver : msg.sender;
      const convId = getConversationId(userId, other);
      
      if (!convMap[convId]) {
        convMap[convId] = {
          conversationId: convId,
          otherUserId: other,
          otherUserName: null,
          otherUserRole: null,
          lastMessage: msg,
          unreadCount: 0,
          messageCount: 0
        };
      }
      
      convMap[convId].messageCount++;
      
      if (!msg.read && msg.receiver === userId) {
        convMap[convId].unreadCount++;
      }
      
      // Keep the most recent message
      if (new Date(msg.timestamp) > new Date(convMap[convId].lastMessage.timestamp)) {
        convMap[convId].lastMessage = msg;
      }
    }

    // Get user info for each conversation
    const conversations = await Promise.all(
      Object.values(convMap).map(async (conv) => {
        const userInfo = await getUserInfo(conv.otherUserId);
        conv.otherUserName = userInfo.name;
        conv.otherUserRole = userInfo.role;
        return conv;
      })
    );

    // Sort by last message timestamp
    conversations.sort((a, b) => 
      new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
    );

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations', details: error.message });
  }
});

// Get messages for a conversation
router.get('/conversation/:userId/:otherUserId', async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
});

// Send a message
router.post('/send', async (req, res) => {
  try {
    const { sender, receiver, text } = req.body || {};
    
    if (!sender || !receiver || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const message = new Message({
      sender,
      receiver,
      text,
      read: false
    });

    await message.save();
    res.status(201).json({ message: 'Message sent', data: message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
});

// Mark conversation messages as read for a user
router.post('/mark-read', async (req, res) => {
  try {
    const { userId, otherUserId } = req.body || {};
    
    if (!userId || !otherUserId) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    await Message.updateMany(
      { sender: otherUserId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark as read', details: error.message });
  }
});

// Get user info endpoint
router.get('/user-info/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const info = await getUserInfo(userId);
    res.json(info);
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ error: 'Failed to fetch user info', details: error.message });
  }
});

module.exports = router;
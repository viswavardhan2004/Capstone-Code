const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');

const MONGO_URI = 'mongodb+srv://karan:1234@cluster123.cqcrvyj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster123';

async function fixEmails() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Fix Messages - change admin@gmail.com to client@lpu.in
    const msgSender = await Message.updateMany(
      { sender: 'admin@gmail.com' },
      { $set: { sender: 'client@lpu.in' } }
    );
    console.log(`📧 Updated ${msgSender.modifiedCount} message senders`);

    const msgReceiver = await Message.updateMany(
      { receiver: 'admin@gmail.com' },
      { $set: { receiver: 'client@lpu.in' } }
    );
    console.log(`📧 Updated ${msgReceiver.modifiedCount} message receivers`);

    // Fix Users - check both old and new emails
    const oldUser = await User.findOne({ email: 'admin@gmail.com' });
    if (oldUser) {
      // Delete old user
      await User.deleteOne({ email: 'admin@gmail.com' });
      console.log(`🗑️ Deleted old user: admin@gmail.com`);
    }
    
    // Create or update client@lpu.in user
    let newUser = await User.findOne({ email: 'client@lpu.in' });
    if (!newUser) {
      newUser = new User({
        email: 'client@lpu.in',
        password: oldUser ? oldUser.password : '$2a$10$fixedHashHere',
        name: oldUser ? oldUser.name : 'Priya Sharma',
        role: 'client',
        verified: false
      });
      await newUser.save();
      console.log(`👤 Created new client user: client@lpu.in`);
    } else {
      console.log(`👤 User client@lpu.in already exists`);
    }

    // Fix Transactions
    const txClient = await Transaction.updateMany(
      { clientEmail: 'admin@gmail.com' },
      { $set: { clientEmail: 'client@lpu.in' } }
    );
    console.log(`💰 Updated ${txClient.modifiedCount} transaction clientEmails`);

    // Fix Orders
    const orderClient = await Order.updateMany(
      { clientEmail: 'admin@gmail.com' },
      { $set: { clientEmail: 'client@lpu.in' } }
    );
    console.log(`📦 Updated ${orderClient.modifiedCount} order clientEmails`);

    console.log('\n✅ All email fixes completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixEmails();

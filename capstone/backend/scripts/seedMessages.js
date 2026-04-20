const mongoose = require('mongoose');
require('dotenv').config();

const Message = require('../models/Message');

const seedMessages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://karan:1234@cluster123.cqcrvyj.mongodb.net/capstone?retryWrites=true&w=majority');
    
    // Clear existing messages
    await Message.deleteMany({});
    console.log('✅ Cleared existing messages');

    // Create sample conversations between students and clients
    const messages = [
      {
        sender: 'client@gmail.com',
        receiver: 'student@college.edu',
        text: 'Hi! Can you help me with my assignment?',
        read: false,
        timestamp: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      },
      {
        sender: 'student@college.edu',
        receiver: 'client@gmail.com',
        text: 'Sure! What do you need help with?',
        read: true,
        timestamp: new Date(Date.now() - 8 * 60 * 1000)
      },
      {
        sender: 'client@gmail.com',
        receiver: 'student@college.edu',
        text: 'I need help with JavaScript. Can you write a function that...',
        read: false,
        timestamp: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        sender: 'student@college.edu',
        receiver: 'client@gmail.com',
        text: 'Yes, I can definitely help with that. When do you need it?',
        read: true,
        timestamp: new Date(Date.now() - 2 * 60 * 1000)
      },
      {
        sender: 'another.client@gmail.com',
        receiver: 'student@college.edu',
        text: 'Are you available for work today?',
        read: false,
        timestamp: new Date(Date.now() - 3 * 60 * 1000)
      },
      {
        sender: 'student@college.edu',
        receiver: 'another.client@gmail.com',
        text: 'Yes, I am! What do you need?',
        read: true,
        timestamp: new Date(Date.now() - 1 * 60 * 1000)
      }
    ];

    await Message.insertMany(messages);
    console.log('✅ Seeded', messages.length, 'messages');
    
    console.log('\n📧 Test Conversations:');
    console.log('1. Student: student@college.edu');
    console.log('   Clients: client@gmail.com, another.client@gmail.com');
    console.log('\n2. You can log in and check Messages to see conversations');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedMessages();

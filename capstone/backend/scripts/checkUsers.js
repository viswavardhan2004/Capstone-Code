const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = 'mongodb+srv://karan:1234@cluster123.cqcrvyj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster123';

async function checkUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const allUsers = await User.find({});
    console.log(`\n📊 Total users: ${allUsers.length}\n`);

    console.log('👥 All users:');
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) ${user.verified ? '✅' : '❌'}`);
    });

    console.log('\n🎓 Students only:');
    const students = await User.find({ role: 'student' });
    students.forEach(student => {
      console.log(`  - ${student.email} - ${student.name}`);
    });

    console.log('\n👤 Clients only:');
    const clients = await User.find({ role: 'client' });
    clients.forEach(client => {
      console.log(`  - ${client.email} - ${client.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();

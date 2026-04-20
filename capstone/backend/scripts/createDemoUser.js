const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://karan:1234@cluster123.cqcrvyj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster123';

async function createMissingUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Create student@college.edu if it doesn't exist
    const studentExists = await User.findOne({ email: 'student@college.edu' });
    
    if (!studentExists) {
      const hashedPassword = await bcrypt.hash('1234', 10);
      const newStudent = new User({
        email: 'student@college.edu',
        password: hashedPassword,
        name: 'Demo Student',
        role: 'student',
        verified: true,
        profile: {
          bio: 'Student at college',
          skills: ['Programming', 'Design'],
          rating: 4.5,
          earnings: 0,
          inEscrow: 0,
          university: 'Demo College',
          major: 'Computer Science',
          phone: '',
          location: 'India'
        }
      });
      await newStudent.save();
      console.log('✅ Created student@college.edu');
    } else {
      console.log('⏭️ student@college.edu already exists');
    }

    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createMissingUsers();

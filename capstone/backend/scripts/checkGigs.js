const mongoose = require('mongoose');
const Gig = require('../models/Gig');

const MONGO_URI = 'mongodb+srv://karan:1234@cluster123.cqcrvyj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster123';

async function checkGigs() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const allGigs = await Gig.find({});
    console.log(`📊 Total gigs: ${allGigs.length}\n`);

    if (allGigs.length === 0) {
      console.log('⚠️ No gigs found in database\n');
    } else {
      console.log('🎯 All gigs:');
      allGigs.forEach(gig => {
        console.log(`  - "${gig.title}" by ${gig.sellerEmail || 'NO EMAIL!'}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkGigs();

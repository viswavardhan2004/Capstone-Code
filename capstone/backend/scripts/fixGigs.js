const mongoose = require('mongoose');
const Gig = require('../models/Gig');

const MONGO_URI = 'mongodb+srv://karan:1234@cluster123.cqcrvyj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster123';

async function fixGigs() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all gigs
    const allGigs = await Gig.find({});
    console.log(`📊 Found ${allGigs.length} gigs\n`);

    // Update each gig
    for (const gig of allGigs) {
      let updated = false;
      
      // If seller.id exists, get the user's email
      if (gig.seller?.id) {
        const user = await require('../models/User').findById(gig.seller.id);
        if (user) {
          gig.seller.email = user.email;
          gig.sellerEmail = user.email;
          updated = true;
          console.log(`✅ Updated "${gig.title}" with seller email: ${user.email}`);
        }
      }
      
      // If no seller.id but no sellerEmail, default to admin@lpu.in
      if (!gig.seller?.id && !gig.sellerEmail) {
        const defaultUser = await require('../models/User').findOne({ email: 'admin@lpu.in' });
        if (defaultUser) {
          gig.seller = {
            id: defaultUser._id,
            email: defaultUser.email,
            name: defaultUser.name,
            verified: defaultUser.verified
          };
          gig.sellerEmail = defaultUser.email;
          updated = true;
          console.log(`✅ Updated "${gig.title}" with default seller: admin@lpu.in`);
        }
      }
      
      if (updated) {
        await gig.save();
      }
    }

    console.log('\n✅ All gigs fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixGigs();

const mongoose = require('mongoose');
const Gig = require('../models/Gig');
const User = require('../models/User');

const MONGO_URI = 'mongodb+srv://karan:1234@cluster123.cqcrvyj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster123';

async function fixAllGigs() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const allGigs = await Gig.find({});
    console.log(`📊 Found ${allGigs.length} gigs\n`);

    for (const gig of allGigs) {
      console.log(`\n📝 Checking gig: "${gig.title}"`);
      console.log(`   Current seller:`, gig.seller);
      console.log(`   Current sellerEmail:`, gig.sellerEmail);
      
      let needsUpdate = false;
      
      // If seller.id exists, get user info
      if (gig.seller?.id) {
        const user = await User.findById(gig.seller.id);
        if (user) {
          gig.seller.email = user.email;
          gig.sellerEmail = user.email;
          needsUpdate = true;
          console.log(`   ✅ Updated with email: ${user.email}`);
        }
      }
      // If no seller.id but has seller.name, try to find user by name
      else if (gig.seller?.name && !gig.seller?.email) {
        const user = await User.findOne({ name: gig.seller.name });
        if (user) {
          gig.seller.id = user._id;
          gig.seller.email = user.email;
          gig.seller.verified = user.verified;
          gig.sellerEmail = user.email;
          needsUpdate = true;
          console.log(`   ✅ Found user by name, updated with: ${user.email}`);
        } else {
          // Default to admin@lpu.in
          const defaultUser = await User.findOne({ email: 'admin@lpu.in' });
          if (defaultUser) {
            gig.seller = {
              id: defaultUser._id,
              email: defaultUser.email,
              name: defaultUser.name,
              verified: defaultUser.verified
            };
            gig.sellerEmail = defaultUser.email;
            needsUpdate = true;
            console.log(`   ✅ Set default seller: admin@lpu.in`);
          }
        }
      }
      // If completely missing seller info
      else if (!gig.seller || !gig.seller.email) {
        const defaultUser = await User.findOne({ email: 'admin@lpu.in' });
        if (defaultUser) {
          gig.seller = {
            id: defaultUser._id,
            email: defaultUser.email,
            name: defaultUser.name,
            verified: defaultUser.verified
          };
          gig.sellerEmail = defaultUser.email;
          needsUpdate = true;
          console.log(`   ✅ Set default seller: admin@lpu.in`);
        }
      }
      
      if (needsUpdate) {
        await gig.save();
        console.log(`   💾 Saved changes`);
      } else {
        console.log(`   ⏭️  No changes needed`);
      }
    }

    console.log('\n\n✅ All gigs processed!');
    console.log('\n📋 Final gig list:');
    const finalGigs = await Gig.find({});
    finalGigs.forEach(g => {
      console.log(`  - "${g.title}" by ${g.seller?.email || 'NO EMAIL'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAllGigs();

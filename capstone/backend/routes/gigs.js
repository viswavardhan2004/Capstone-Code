const express = require('express');
const router = express.Router();
const Gig = require('../models/Gig');
const User = require('../models/User');

// Get all gigs (for clients to browse)
router.get('/all', async (req, res) => {
  try {
    const gigs = await Gig.find().sort({ createdAt: -1 });
    
    // Populate seller info - check both sellerEmail and seller.id
    const gigsWithSellerInfo = await Promise.all(gigs.map(async (gig) => {
      const gigObj = gig.toObject();
      let user = null;
      
      // First try to get user from sellerEmail
      if (gigObj.sellerEmail) {
        user = await User.findOne({ email: gigObj.sellerEmail });
      }
      
      // If not found, try to get user from seller.id
      if (!user && gigObj.seller?.id) {
        user = await User.findById(gigObj.seller.id);
      }
      
      // If we found a user, populate full seller info
      if (user) {
        gigObj.seller = {
          id: user._id,
          email: user.email,
          name: user.name,
          verified: user.verified
        };
        gigObj.sellerEmail = user.email;
      }
      
      return gigObj;
    }));
    
    res.json(gigsWithSellerInfo);
  } catch (error) {
    console.error('Get gigs error:', error);
    res.status(500).json({ error: 'Failed to fetch gigs', details: error.message });
  }
});

// Get gigs for a specific student
router.get('/student/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Find user to get their ObjectId
    const user = await User.findOne({ email });
    if (!user) {
      return res.json([]); // Return empty array if user not found
    }
    
    // Find gigs where seller.id matches or seller email matches (for backward compatibility)
    const gigs = await Gig.find({
      $or: [
        { 'seller.id': user._id },
        { 'seller.email': email }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(gigs);
  } catch (error) {
    console.error('Get student gigs error:', error);
    res.status(500).json({ error: 'Failed to fetch student gigs', details: error.message });
  }
});

// Create gig
router.post('/create', async (req, res) => {
  try {
    const { title, description, price, category, deliveryDays, sellerEmail } = req.body;
    
    if (!title || !description || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!sellerEmail) {
      return res.status(400).json({ error: "Seller email is required" });
    }

    // Get seller info from User model
    const user = await User.findOne({ email: sellerEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const seller = {
      id: user._id,
      email: user.email,
      name: user.name,
      verified: user.verified
    };

    const gig = new Gig({
      title,
      description,
      price: parseInt(price),
      category: category || "other",
      deliveryDays: parseInt(deliveryDays) || 1,
      seller,
      sellerEmail: user.email,
      rating: 0,
      orders: 0
    });

    await gig.save();
    console.log('✅ Gig created for student:', sellerEmail);
    res.status(201).json(gig);
  } catch (error) {
    console.error('Create gig error:', error);
    res.status(500).json({ error: 'Failed to create gig', details: error.message });
  }
});

// Get gig by ID
router.get('/:id', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ error: "Gig not found" });
    }
    res.json(gig);
  } catch (error) {
    console.error('Get gig error:', error);
    res.status(500).json({ error: 'Failed to fetch gig', details: error.message });
  }
});

// Update gig
router.put('/:id', async (req, res) => {
  try {
    const { title, description, price, category, deliveryDays, userEmail } = req.body;
    
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ error: "Gig not found" });
    }

    // Verify ownership - only the gig creator can update
    if (userEmail && gig.seller.email !== userEmail) {
      return res.status(403).json({ error: "You can only update your own gigs" });
    }

    if (title) gig.title = title;
    if (description) gig.description = description;
    if (price) gig.price = price;
    if (category) gig.category = category;
    if (deliveryDays) gig.deliveryDays = deliveryDays;

    await gig.save();
    res.json(gig);
  } catch (error) {
    console.error('Update gig error:', error);
    res.status(500).json({ error: 'Failed to update gig', details: error.message });
  }
});

// Delete gig
router.delete('/:id', async (req, res) => {
  try {
    const { userEmail } = req.query;
    
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ error: "Gig not found" });
    }

    // Verify ownership - only the gig creator can delete
    if (userEmail && gig.seller.email !== userEmail) {
      return res.status(403).json({ error: "You can only delete your own gigs" });
    }

    await Gig.findByIdAndDelete(req.params.id);
    res.json({ message: "Gig deleted" });
  } catch (error) {
    console.error('Delete gig error:', error);
    res.status(500).json({ error: 'Failed to delete gig', details: error.message });
  }
});

module.exports = router;

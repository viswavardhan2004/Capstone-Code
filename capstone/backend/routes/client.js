const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');

const router = express.Router();

// Get client transactions
router.get('/transactions', async (req, res) => {
  try {
    // TODO: Implement proper JWT authentication
    // Return empty array for now
    res.json([]);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions', details: error.message });
  }
});

// Search gigs (handled in gigs.js)
router.get('/search', (req, res) => {
  res.json([]);
});

// Initiate transaction
router.post('/hire', async (req, res) => {
  const { runFraudCheck } = require('../middleware/fraudDetection');
  const { generateFraudExplanation } = require('../services/llmExplainer');
  const ragCases = []; // Place holder for Sub-Task 9
  const { verdict, score, triggered, alert } = await runFraudCheck(req.body.clientId, req.body.freelancerId, req.body.gigId || req.body.jobId, req.ip);
  if (alert) generateFraudExplanation(triggered, ragCases, alert._id).catch(err => console.error('LLM error:', err.message));
  if (verdict === 'BLOCK') return res.status(403).json({ error: 'Transaction blocked.', score });
  try {
    const { gigId, amount } = req.body;

    if (!gigId || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const transaction = {
      gigId,
      amount,
      status: 'pending_payment',
      createdAt: new Date()
    };

    // This should use the Order model instead
    res.status(201).json({ 
      message: "Transaction initiated. Please deposit funds.",
      transaction 
    });
  } catch (error) {
    console.error('Hire error:', error);
    res.status(500).json({ error: 'Failed to initiate transaction', details: error.message });
  }
});

// Save/update client profile by email
router.post('/profile', async (req, res) => {
  try {
    const { email, name, phone, bio, location, company, industry, skills, hourlyRate, portfolio } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        email,
        password: 'temp123', // Will be replaced on first login
        name: name || '',
        role: 'client',
        verified: false,
        profile: {
          phone: phone || '',
          bio: bio || '',
          location: location || '',
          company: company || '',
          industry: industry || '',
          skills: skills || [],
          hourlyRate: hourlyRate || '',
          portfolio: portfolio || []
        }
      });
    } else {
      // Update existing profile
      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.profile.phone = phone;
      if (bio !== undefined) user.profile.bio = bio;
      if (location !== undefined) user.profile.location = location;
      if (company !== undefined) user.profile.company = company;
      if (industry !== undefined) user.profile.industry = industry;
      if (skills !== undefined) user.profile.skills = skills;
      if (hourlyRate !== undefined) user.profile.hourlyRate = hourlyRate;
      if (portfolio !== undefined) user.profile.portfolio = portfolio;
    }
    
    await user.save();
    console.log('✅ Client profile saved:', email);
    
    res.status(201).json({ 
      message: 'Profile saved successfully', 
      profile: {
        email: user.email,
        name: user.name,
        phone: user.profile.phone,
        bio: user.profile.bio,
        location: user.profile.location,
        company: user.profile.company,
        industry: user.profile.industry,
        skills: user.profile.skills,
        hourlyRate: user.profile.hourlyRate,
        portfolio: user.profile.portfolio
      }
    });
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({ error: 'Failed to save profile', details: error.message });
  }
});

// Get client profile by email
router.get('/profile/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const profile = await User.findOne({ email, role: 'client' });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({
      email: profile.email,
      name: profile.name,
      phone: profile.profile.phone,
      bio: profile.profile.bio,
      location: profile.profile.location,
      company: profile.profile.company,
      industry: profile.profile.industry,
      skills: profile.profile.skills,
      hourlyRate: profile.profile.hourlyRate,
      portfolio: profile.profile.portfolio,
      completedOrders: profile.profile.completedOrders,
      responseTime: profile.profile.responseTime,
      memberSince: profile.profile.memberSince || new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });
  } catch (error) {
    console.error('Get client profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
});

module.exports = router;

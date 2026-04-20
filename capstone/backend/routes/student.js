const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Get student profile (authenticated)
router.get('/profile', async (req, res) => {
  try {
    // Get email from query params or headers
    const email = req.query.email || req.headers['x-user-email'];
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const profile = await User.findOne({ email, role: 'student' });

    if (!profile) {
      // Return empty profile structure if not found
      return res.status(200).json({
        email,
        name: email.split('@')[0],
        phone: '',
        bio: '',
        location: '',
        university: '',
        major: '',
        graduationYear: '',
        skills: [],
        hourlyRate: '',
        portfolio: [],
        rating: 0,
        verified: email.includes('edu') || email.includes('.ac') || email.includes('lpu.in'),
        earnings: 0,
        inEscrow: 0
      });
    }

    res.json({
      email: profile.email,
      name: profile.name,
      phone: profile.profile?.phone || '',
      bio: profile.profile?.bio || '',
      location: profile.profile?.location || '',
      university: profile.profile?.university || '',
      major: profile.profile?.major || '',
      graduationYear: profile.profile?.graduationYear || '',
      skills: profile.profile?.skills || [],
      hourlyRate: profile.profile?.hourlyRate || '',
      portfolio: profile.profile?.portfolio || [],
      rating: profile.profile?.rating || 0,
      verified: profile.verified,
      earnings: profile.earnings || 0,
      inEscrow: profile.inEscrow || 0
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
});

// Get student profile by email (public lookup)
router.get('/profile/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const profile = await User.findOne({ email, role: 'student' });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      email: profile.email,
      name: profile.name,
      phone: profile.profile.phone,
      bio: profile.profile.bio,
      location: profile.profile.location,
      university: profile.profile.university,
      major: profile.profile.major,
      graduationYear: profile.profile.graduationYear,
      skills: profile.profile.skills,
      hourlyRate: profile.profile.hourlyRate,
      portfolio: profile.profile.portfolio,
      rating: profile.profile.rating,
      verified: profile.verified,
      completedOrders: profile.profile.completedOrders,
      responseTime: profile.profile.responseTime,
      memberSince: profile.profile.memberSince || new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
});

// Update student profile (authenticated)
router.put('/profile', async (req, res) => {
  try {
    // TODO: Implement proper JWT authentication
    res.json({ message: "Profile updated" });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// Get earnings
router.get('/earnings', async (req, res) => {
  try {
    // TODO: Implement proper JWT authentication
    // Return placeholder data for now
    const earnings = {
      totalEarned: 0,
      inEscrow: 0,
      available: 0,
      transactions: []
    };
    
    res.json(earnings);
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ error: 'Failed to fetch earnings', details: error.message });
  }
});

// Update earnings (when work is approved)
router.post('/earnings/update', async (req, res) => {
  try {
    // TODO: Implement proper JWT authentication
    const earnings = {
      totalEarned: 0,
      inEscrow: 0,
      available: 0
    };
    
    res.json({ message: "Earnings updated", earnings });
  } catch (error) {
    console.error('Update earnings error:', error);
    res.status(500).json({ error: 'Failed to update earnings', details: error.message });
  }
});

// Get my gigs
router.get('/gigs', async (req, res) => {
  try {
    // TODO: Implement when gigs have seller reference
    res.json([]);
  } catch (error) {
    console.error('Get gigs error:', error);
    res.status(500).json({ error: 'Failed to fetch gigs', details: error.message });
  }
});

// Save/update profile by email (POST for frontend compatibility)
router.post('/profile', async (req, res) => {
  try {
    const { email, name, phone, bio, location, university, major, graduationYear, skills, hourlyRate, portfolio } = req.body;
    
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
        role: 'student',
        verified: true,
        profile: {
          phone: phone || '',
          bio: bio || '',
          location: location || '',
          university: university || '',
          major: major || '',
          graduationYear: graduationYear || '',
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
      if (university !== undefined) user.profile.university = university;
      if (major !== undefined) user.profile.major = major;
      if (graduationYear !== undefined) user.profile.graduationYear = graduationYear;
      if (skills !== undefined) user.profile.skills = skills;
      if (hourlyRate !== undefined) user.profile.hourlyRate = hourlyRate;
      if (portfolio !== undefined) user.profile.portfolio = portfolio;
    }
    
    await user.save();
    console.log('✅ Student profile saved:', email);
    
    res.status(201).json({ 
      message: 'Profile saved successfully', 
      profile: {
        email: user.email,
        name: user.name,
        phone: user.profile.phone,
        bio: user.profile.bio,
        location: user.profile.location,
        university: user.profile.university,
        major: user.profile.major,
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

module.exports = router;

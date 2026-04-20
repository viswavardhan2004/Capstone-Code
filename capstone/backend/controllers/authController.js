const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function buildFingerprint(req) {
  const s = (req.headers['user-agent'] || '') +
            (req.headers['accept-language'] || '') +
            (req.body.screenInfo || '');
  return crypto.createHash('sha256').update(s).digest('hex');
}
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTP = require('../models/OTP');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Approved university domains for student verification
const APPROVED_DOMAINS = ['lpu.in', '.edu', '.ac.in', 'university.com', 'college.com'];

const isUniversityEmail = (email) => {
  const domain = email.split('@')[1];
  return APPROVED_DOMAINS.some(d => domain && domain.toLowerCase().endsWith(d.toLowerCase()));
};

const JWT_SECRET = process.env.JWT_SECRET || 'patent_secret_key';

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.toLowerCase().endsWith('@lpu.in')) {
      return res.status(400).json({ error: "Only @lpu.in emails are eligible for OTP verification" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save or update OTP
    await OTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'LPU Student Verification OTP',
      text: `Your OTP for SkillBridge sign-up is: ${otp}. It will expire in 10 minutes.`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP', details: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, name, role, otp } = req.body;
    
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "All fields required" });
    }

    if (!['student', 'client', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Student must use university email
    if (role === 'student' && !isUniversityEmail(email)) {
      return res.status(403).json({ 
        error: "Verification Failed", 
        message: "Students must use a valid university email (@edu, @ac.in, @lpu.in, etc.)" 
      });
    }

    // LPU Student OTP Verification
    if (email.toLowerCase().endsWith('@lpu.in')) {
      if (!otp) {
        return res.status(400).json({ error: "OTP is required for @lpu.in emails" });
      }
      const otpRecord = await OTP.findOne({ email: email.toLowerCase(), otp });
      if (!otpRecord) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }
      // OTP verified, delete it
      await OTP.deleteOne({ _id: otpRecord._id });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create user (password will be hashed by the pre-save hook)
    const user = new User({
      email,
      password,
      name,
      role,
      verified: role === 'student',
      deviceFingerprint: buildFingerprint(req),
      profile: {
        bio: '',
        skills: [],
        rating: 0,
        earnings: 0,
        inEscrow: 0
      }
    });

    await user.save();

    const token = jwt.sign({ 
      userId: user._id,
      email: user.email, 
      role: user.role, 
      name: user.name,
      verified: user.verified
    }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ 
      message: "Registration successful!", 
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ 
      userId: user._id,
      email: user.email, 
      role: user.role,
      name: user.name,
      verified: user.verified
    }, JWT_SECRET, { expiresIn: '7d' });

    await User.findByIdAndUpdate(user._id, { 
      $set: { deviceFingerprint: buildFingerprint(req) } 
    });

    res.json({ 
      message: "Login successful", 
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'client', 'admin'],
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  profile: {
    bio: { type: String, default: '' },
    skills: [String],
    rating: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    inEscrow: { type: Number, default: 0 },
    portfolio: [String],
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    // Student-specific fields
    university: { type: String, default: '' },
    major: { type: String, default: '' },
    graduationYear: { type: String, default: '' },
    hourlyRate: { type: String, default: '' },
    // Client-specific fields
    company: { type: String, default: '' },
    industry: { type: String, default: '' },
    // Common fields
    completedOrders: { type: Number, default: 0 },
    responseTime: { type: String, default: '' },
    memberSince: { type: String, default: '' }
  },
  lastKnownIPs: { type: [String], default: [] },
  deviceFingerprint: { type: String, default: null },
  completedJobs: { type: Number, default: 0 },
  activeJobs: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving (promise-based hook; no next callback)
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

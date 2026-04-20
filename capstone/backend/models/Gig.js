const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    default: 'other'
  },
  deliveryDays: {
    type: Number,
    default: 1
  },
  seller: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String,
    name: String,
    verified: Boolean
  },
  sellerEmail: String,
  rating: {
    type: Number,
    default: 0
  },
  orders: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Gig', gigSchema);

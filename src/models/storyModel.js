// models/Publication.js (unchanged)
const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  content: [{
    url: String,
    type: { type: String, enum: ['image', 'video'] }
  }],
  likes: [{
    userId: String,
    date: { type: Date, default: Date.now }
  }],
  comments: [{
    userId: String,
    text: String,
    date: { type: Date, default: Date.now }
  }],
  views: [{
    userId: String,
    date: { type: Date, default: Date.now }
  }],
  description: String,
  shares: [{
    userId: String,
    date: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('styory', storySchema);
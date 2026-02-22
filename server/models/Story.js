const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  lines: [
    {
      text: String,
      contributorUsername: String,
      isAnonymous: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdByUsername: String,
  createdByUserId: mongoose.Schema.Types.ObjectId,
  totalContributions: {
    type: Number,
    default: 0,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Story', storySchema);

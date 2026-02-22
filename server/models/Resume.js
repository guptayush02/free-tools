const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  rawText: {
    type: String,
    required: true,
  },
  atsScore: {
    type: Number,
    default: 0,
  },
  missingKeywords: [{
    type: String,
  }],
  suggestions: [{
    type: String,
  }],
  optimizedResume: {
    type: String,
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

module.exports = mongoose.model('Resume', resumeSchema);

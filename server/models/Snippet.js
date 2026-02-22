const mongoose = require('mongoose');

const SnippetSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled Code Snippet' },
  code: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  description: { type: String, default: '' },
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Snippet', SnippetSchema);

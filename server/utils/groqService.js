const fs = require('fs');
const path = require('path');

// Mock Groq API service for AI optimization
class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || 'mock-key';
    this.enabled = !!process.env.GROQ_API_KEY;
  }

  async generateOptimization(resumeText) {
    if (!this.enabled) {
      return this.generateLocalOptimization(resumeText);
    }

    try {
      // In production, integrate with actual Groq API
      // For now, return enhanced local version
      return this.generateLocalOptimization(resumeText);
    } catch (error) {
      console.error('Groq API error:', error);
      return this.generateLocalOptimization(resumeText);
    }
  }

  generateLocalOptimization(text) {
    let optimized = text;
    
    // Strong action verbs mapping
    const verbMap = {
      'helped': 'spearheaded',
      'worked on': 'engineered',
      'did': 'executed',
      'made': 'architected',
      'was responsible': 'led',
      'handled': 'orchestrated',
      'managed': 'directed',
      'created': 'innovated',
      'built': 'developed',
      'fixed': 'resolved',
      'improved': 'enhanced',
      'implemented': 'deployed'
    };

    // Replace weak verbs with strong ones
    Object.entries(verbMap).forEach(([weak, strong]) => {
      const regex = new RegExp(`\\b${weak}\\b`, 'gi');
      optimized = optimized.replace(regex, strong);
    });

    // Add quantifiable metrics suggestions
    if (!optimized.match(/\d+%/)) {
      optimized += '\n\n[Consider adding percentages to your achievements, e.g., "Improved performance by 40%"]';
    }

    return optimized;
  }

  analyzeForMissingSkills(text) {
    const commonSkills = [
      'JavaScript', 'Python', 'React', 'Node.js', 'MongoDB',
      'REST APIs', 'Docker', 'Git', 'AWS', 'Linux',
      'Problem-solving', 'Leadership', 'Communication',
      'Agile', 'CI/CD', 'Microservices'
    ];

    const lowerText = text.toLowerCase();
    return commonSkills.filter(skill => 
      !lowerText.includes(skill.toLowerCase())
    ).slice(0, 7);
  }
}

module.exports = new GroqService();

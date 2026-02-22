// Server configuration and constants

const CONFIG = {
  UPLOAD: {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_TYPES: ['text/plain', 'application/pdf'],
    ALLOWED_EXTENSIONS: ['.txt', '.pdf']
  },
  ATS: {
    WEIGHTS: {
      keywords: 30,
      formatting: 20,
      length: 15,
      experience: 20,
      education: 15
    },
    MIN_SCORE: 0,
    MAX_SCORE: 100
  },
  KEYWORDS: {
    TECHNICAL: [
      'JavaScript', 'Python', 'React', 'Node.js', 'Express',
      'MongoDB', 'SQL', 'REST API', 'GraphQL', 'TypeScript',
      'Vue', 'Angular', 'Docker', 'Kubernetes', 'AWS',
      'Azure', 'Git', 'CI/CD', 'Microservices', 'Agile',
      'SOLID', 'Design Patterns', 'Testing', 'DevOps'
    ],
    SOFT_SKILLS: [
      'Leadership', 'Communication', 'Problem-solving',
      'Teamwork', 'Collaboration', 'Project Management',
      'Time Management', 'Adaptability', 'Critical Thinking'
    ]
  }
};

module.exports = CONFIG;

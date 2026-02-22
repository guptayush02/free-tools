// Utility functions for resume processing

const parseResume = (fileData, mimeType) => {
  // Simple text extraction
  if (mimeType === 'text/plain') {
    return fileData.toString('utf8');
  }
  // For PDF, would need pdf-parse library
  return fileData.toString('utf8');
};

const calculateATSScore = (text) => {
  if (!text) return 0;
  let score = 50;
  const keywords = [
    'experience', 'skills', 'education', 'projects',
    'javascript', 'python', 'react', 'nodejs', 'mongodb',
    'apis', 'databases', 'frameworks', 'tools'
  ];

  keywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword)) score += 2;
  });

  if (text.includes('\n')) score += 5;
  if (text.split('\n').length > 5) score += 5;

  return Math.min(score, 100);
};

const optimizeResume = (originalText) => {
  let optimized = originalText;
  
  // Replace weak verbs with strong action verbs
  const weakVerbs = {
    'helped': 'spearheaded',
    'worked on': 'developed',
    'did': 'executed',
    'made': 'created',
    'was responsible for': 'led',
    'helped develop': 'architected',
    'helped build': 'built',
    'worked with': 'collaborated with'
  };

  Object.entries(weakVerbs).forEach(([weak, strong]) => {
    const regex = new RegExp(`\\b${weak}\\b`, 'gi');
    optimized = optimized.replace(regex, strong);
  });

  // Normalize bullet points to use •
  optimized = optimized.replace(/^\s*[-*]\s*/gm, '• ');
  
  // Identify section headers and format them properly
  // Common section headers
  const sections = ['PROFESSIONAL SUMMARY', 'EXPERIENCE', 'SKILLS', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS', 'CONTACT', 'SUMMARY'];
  sections.forEach(section => {
    const regex = new RegExp(`^\\s*${section}\\s*$`, 'gmi');
    optimized = optimized.replace(regex, `## ${section}`);
  });
  
  // Clean up multiple consecutive empty lines
  optimized = optimized.replace(/\n{3,}/g, '\n\n');
  
  // Remove standalone dashes or bullets
  // Remove common page-number/footer lines (e.g., "Page 1", "1/2", "1 of 3", "pg. 1", roman numerals)
  const pageNumberPatterns = [
    /^page\s*\d+(\s*of\s*\d+)?$/i,
    /^pg\.?\s*\d+$/i,
    /^\d+\s*\/\s*\d+$/,
    /^\d+\s+of\s+\d+$/i,
    /^\(?[ivxlcdm]+\)?$/i, // roman numerals on their own
  ];

  optimized = optimized.split('\n').filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    // If the line is just a number with optional trailing dot/parenthesis (e.g. "1" or "1.")
    if (/^\d{1,2}[.)]?$/.test(trimmed)) {
      return false;
    }
    for (const p of pageNumberPatterns) {
      if (p.test(trimmed)) return false;
    }
    return true;
  }).join('\n');

  // Remove isolated numeric-only lines that are likely page numbers (e.g. "1" on its own line)
  const rawLines = optimized.split('\n');
  const cleanedLines = [];
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();
    // Skip isolated numeric-only lines with adjacency heuristics
    if (/^[0-9]{1,2}[.)]?$/.test(trimmed)) {
      const prev = (rawLines[i-1] || '').trim();
      const next = (rawLines[i+1] || '').trim();
      const prevShort = prev === '' || prev.length < 30;
      const nextShort = next === '' || next.length < 30;
      if (prevShort && nextShort) continue;
    }
    // Also skip "1 of 3" or "1/3" isolated formats
    if (/^\d+\s*(\/|of)\s*\d+$/.test(trimmed)) {
      const prev = (rawLines[i-1] || '').trim();
      const next = (rawLines[i+1] || '').trim();
      if ((prev === '' || prev.length < 30) && (next === '' || next.length < 30)) continue;
    }
    // Skip roman numerals alone
    if (/^[ivxlcdm]+$/i.test(trimmed) && trimmed.length <= 4) {
      const prev = (rawLines[i-1] || '').trim();
      const next = (rawLines[i+1] || '').trim();
      if ((prev === '' || prev.length < 30) && (next === '' || next.length < 30)) continue;
    }
    cleanedLines.push(line);
  }
  optimized = cleanedLines.join('\n');
  
  // Ensure proper spacing around sections
  optimized = optimized.replace(/\n(##\s+)/g, '\n\n$1');

  return optimized.trim();
};

module.exports = {
  parseResume,
  calculateATSScore,
  optimizeResume
};

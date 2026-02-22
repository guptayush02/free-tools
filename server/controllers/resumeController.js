const Resume = require('../models/Resume');
const { parseResume, calculateATSScore, optimizeResume } = require('../utils/resumeUtils');
const pdfParse = require('pdf-parse');

exports.uploadResume = async (req, res) => {
  try {
    if (!req.files || !req.files.resume) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.resume;
    const fileName = file.name;
    
    // Parse resume content
    let rawText = '';
    
    if (file.mimetype === 'text/plain') {
      rawText = file.data.toString('utf8');
    } else if (fileName.endsWith('.pdf')) {
      try {
        const pdfData = await pdfParse(file.data);
        rawText = pdfData.text || '';
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return res.status(400).json({ error: 'Failed to parse PDF file' });
      }
    } else {
      return res.status(400).json({ error: 'Only PDF and TXT files supported' });
    }
    
    // Clean up whitespace and remove extra line breaks
    rawText = rawText.trim().replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n');

    // Calculate ATS score
    const atsScore = calculateATSScore(rawText);
    
    // Generate suggestions
    const suggestions = generateSuggestions(rawText);

    // Extract job title and job description heuristically from the raw text
    const jobTitle = extractJobTitle(rawText);
    const jobDescription = extractJobDescription(rawText);
    console.log('Extracted Job Title:', jobTitle);
    console.log('Extracted Job Description:', jobDescription);

    // Find missing keywords based on job title and description
    const missingKeywords = findMissingKeywords(rawText, jobTitle, jobDescription);

    // Create resume document
    const resume = new Resume({
      fileName,
      rawText,
      atsScore,
      suggestions,
      missingKeywords,
    });

    await resume.save();

    res.json({
      id: resume._id,
      fileName,
      atsScore,
      suggestions,
      missingKeywords,
      message: 'Resume analyzed successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
};

exports.optimizeResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Generate optimized version
    const optimizedResume = optimizeResume(resume.rawText);
    resume.optimizedResume = optimizedResume;
    await resume.save();

    res.json({
      id: resume._id,
      optimizedResume,
      originalScore: resume.atsScore,
    });
  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({ error: 'Failed to optimize resume' });
  }
};

exports.getResumeScore = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({
      id: resume._id,
      fileName: resume.fileName,
      atsScore: resume.atsScore,
      suggestions: resume.suggestions,
      missingKeywords: resume.missingKeywords,
      optimizedResume: resume.optimizedResume,
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
};

// Helper functions
function generateSuggestions(text) {
  const suggestions = [];
  const lowerText = text.toLowerCase();

  if (!lowerText.includes('quantifiable')) {
    suggestions.push('Add quantifiable metrics to your achievements');
  }
  if (!lowerText.includes('action')) {
    suggestions.push('Start bullet points with action verbs');
  }
  if (text.split('\n').length < 10) {
    suggestions.push('Expand your resume with more details');
  }
  if (!lowerText.includes('projects')) {
    suggestions.push('Include a projects section');
  }
  if (text.length < 500) {
    suggestions.push('Your resume might be too brief');
  }

  return suggestions;
}

// Heuristic: extract probable job title from the top of the resume
function extractJobTitle(text) {
  const lines = (text || '').split('\n').map(l => l.trim()).filter(Boolean)
  const firstLines = lines.slice(0, 12)

  const titleKeywordRegex = /(Engineer|Developer|Manager|Analyst|Designer|Consultant|Specialist|Coordinator|Marketing|Sales|Teacher|Nurse|Accountant|Researcher|Director|Officer|Architect|Operations|HR|Recruiter)/i

  const stripLeadingAdj = s => s.replace(/^(results-driven|results driven|experienced|seasoned|skilled|senior|sr\.?|jr\.?|junior|lead(?:er)?|chief|principal|head|talented)\b[:\s\-\,]*/i, '').trim()

  for (const raw of firstLines) {
    const l = raw.replace(/\s{2,}/g, ' ').replace(/[|–—―]/g, '-').trim()
    if (titleKeywordRegex.test(l)) {
      // Try to return a short role phrase around the matched keyword
      const words = l.split(/\s+/)
      const idx = words.findIndex(w => titleKeywordRegex.test(w))
      if (idx !== -1) {
        const start = Math.max(0, idx - 2)
        const end = Math.min(words.length, idx + 3)
        let candidate = words.slice(start, end).join(' ')
        candidate = candidate.split(/,| with | for | - |\(|\/|–|—/i)[0].trim()
        candidate = stripLeadingAdj(candidate)
        // remove trailing 'experience' clauses
        candidate = candidate.replace(/\b\d+\+?\s*years?.*$/i, '').trim()
        if (candidate) return candidate
      }
      // fallback: take up to first clause
      let short = l.split(/,| with | for | - |\(|\/|–|—/i)[0].trim()
      short = stripLeadingAdj(short)
      short = short.replace(/\b\d+\+?\s*years?.*$/i, '').trim()
      if (short) return short
    }
  }

  // short all-caps line (e.g., 'SOFTWARE ENGINEER') — trim descriptors
  for (const raw of firstLines) {
    const l = raw.trim()
    if (l === l.toUpperCase() && /[A-Z]/.test(l) && l.length > 3 && l.length <= 120) {
      return l.split(/,| with | for | - |\(|\/|–|—/i)[0].trim()
    }
  }

  // title-case line with reasonable length
  for (const raw of firstLines) {
    const l = raw.trim()
    const words = l.split(/\s+/)
    const titleCaseCount = words.filter(w => /^[A-Z][a-z]/.test(w)).length
    if (words.length <= 8 && titleCaseCount >= Math.max(1, Math.floor(words.length / 2))) {
      const short = l.split(/,| with | for | - |\(|\/|–|—/i)[0].trim()
      return short
    }
  }

  return 'General'
}

// Heuristic: extract a short job description or summary from a 'Summary' section or near title
function extractJobDescription(text) {
  const lines = (text || '').split('\n')
  const cleaned = lines.map(l => l.trim())

  const summaryIdx = cleaned.findIndex(l => /^(summary|professional summary|profile|objective|about me|about)[:\s]*$/i.test(l) || /^summary[:\s]/i.test(l))
  if (summaryIdx !== -1) {
    const out = []
    for (let i = summaryIdx + 1; i < cleaned.length && out.length < 6; i++) {
      if (!cleaned[i]) break
      if (/^[A-Z\s]{2,80}$/.test(cleaned[i]) && cleaned[i].length < 80) break
      out.push(cleaned[i])
    }
    return out.join(' ')
  }

  // fallback: take a few lines after the detected title (if present)
  const title = extractJobTitle(text)
  if (title && title !== 'General') {
    const idx = cleaned.findIndex(l => l && l.toLowerCase().includes(title.toLowerCase()))
    if (idx !== -1) {
      const out = []
      for (let i = idx + 1; i < cleaned.length && out.length < 6; i++) {
        if (!cleaned[i]) break
        out.push(cleaned[i])
      }
      return out.join(' ')
    }
  }

  // ultimate fallback: first non-contact paragraph
  const nonContact = cleaned.filter(l => l && !/@|www\.|http|\+?\d{2,}|fax|phone/i.test(l))
  return nonContact.slice(0, 6).join(' ')
}

// function findMissingKeywords(text) {
//   const commonKeywords = [
//     'Leadership', 'Communication', 'Problem-solving',
//     'Teamwork', 'Project Management', 'Data Analysis',
//     'API Development', 'Database Design', 'Cloud Services'
//   ];

//   const lowerText = text.toLowerCase();
//   return commonKeywords.filter(keyword => 
//     !lowerText.includes(keyword.toLowerCase())
//   ).slice(0, 5);
// }
function findMissingKeywords(text, jobTitle = 'General', jobDescription = '') {
  // ✅ Generic keyword database by job profile/industry
  const keywordDatabase = {
    // Tech/Engineering (your original)
    'Software Engineer': [
      'JavaScript', 'React', 'Node.js', 'Python', 'API Development', 
      'Database', 'AWS', 'Docker', 'Git', 'Agile'
    ],
    'Data Analyst': [
      'SQL', 'Excel', 'Python', 'Tableau', 'Power BI', 'Data Visualization',
      'ETL', 'Statistics', 'Pandas', 'Machine Learning'
    ],
    
    // Business/Management
    'Project Manager': [
      'Agile', 'Scrum', 'PMP', 'Stakeholder Management', 'Budgeting',
      'Risk Management', 'JIRA', 'Resource Allocation', 'Timeline'
    ],
    'Marketing': [
      'SEO', 'Content Marketing', 'Google Analytics', 'Social Media',
      'Campaign Management', 'Lead Generation', 'CRM', 'Conversion Rate'
    ],
    
    // Sales/Business Development
    'Sales': [
      'Lead Generation', 'CRM', 'Pipeline Management', 'Closing Deals',
      'Negotiation', 'B2B Sales', 'Quota Achievement', 'Account Management'
    ],
    
    // HR/Administrative
    'HR': [
      'Recruitment', 'Talent Acquisition', 'Employee Relations',
      'Performance Management', 'Onboarding', 'Payroll', 'Compliance'
    ],
    'Administrative': [
      'Scheduling', 'Office Management', 'Customer Service',
      'Data Entry', 'Calendar Management', 'Travel Arrangements'
    ],
    
    // Healthcare
    'Healthcare': [
      'Patient Care', 'EMR', 'HIPAA', 'Clinical', 'Nursing',
      'Medical Terminology', 'Vital Signs', 'Diagnosis'
    ],
    
    // Finance
    'Finance': [
      'Financial Analysis', 'Excel', 'Budgeting', 'Forecasting',
      'GAAP', 'Audit', 'Risk Assessment', 'QuickBooks'
    ],
    
    // Education
    'Teacher': [
      'Curriculum Development', 'Classroom Management',
      'Lesson Planning', 'Assessment', 'Parent Communication'
    ],
    
    // Generic - Universal skills (all jobs)
    'General': [
      'Leadership', 'Communication', 'Teamwork', 'Problem Solving',
      'Time Management', 'Customer Service', 'Adaptability',
      'Critical Thinking', 'Organization', 'Attention to Detail'
    ]
  };

  const lowerText = text.toLowerCase();
  
  // Normalize long/descriptive jobTitle strings to a canonical key
  function getCanonicalJobKey(title) {
    if (!title) return 'General'
    const t = title.toString().toLowerCase()
    const short = t.split(/,| with | - |—|–|\(|\)/i)[0].trim()

    if (/software|developer|engineer|full ?stack|frontend|backend|react|node/.test(short)) return 'Software Engineer'
    if (/data\s*analyst|tableau|power bi|pandas|etl|statistics|data visualization/.test(short)) return 'Data Analyst'
    if (/project\s*manager|pmp|scrum|agile|stakeholder/.test(short)) return 'Project Manager'
    if (/marketing|seo|content marketing|google analytics|campaign/.test(short)) return 'Marketing'
    if (/sales|b2b|pipeline|quota|closing deals|crm/.test(short)) return 'Sales'
    if (/human\s*resources|\bhr\b|hr\s*operations|talent|recruit|recruiter|people ops/.test(short)) return 'HR'
    if (/administrative|office management|administrator|assistant/.test(short)) return 'Administrative'
    if (/nurse|clinical|patient care|healthcare|emr|hipaa/.test(short)) return 'Healthcare'
    if (/finance|accountant|financial|gaap|forecast/.test(short)) return 'Finance'
    if (/teacher|education|curriculum/.test(short)) return 'Teacher'
    if (/design(er|ing)|ux|ui|graphic/.test(short)) return 'Design'
    return 'General'
  }

  const canonicalKey = getCanonicalJobKey(jobTitle)
  let keywords = keywordDatabase[canonicalKey] || keywordDatabase['General'];
  
  // ✅ 2. Extract from job description (most important!)
  if (jobDescription) {
    const jdWords = jobDescription.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)?\b/g) || [];
    const jdKeywords = [...new Set(jdWords)].slice(0, 20); // Top 20 unique
    keywords = [...keywords, ...jdKeywords].slice(0, 25);
  }
  
  // ✅ 3. Filter missing ones, prioritize high-value
  const missing = keywords.filter(keyword => 
    !lowerText.includes(keyword.toLowerCase())
  ).slice(0, 8); // Limit to top 8
  
  return missing.length > 0 ? missing : ['communication', 'teamwork', 'leadership'];
}

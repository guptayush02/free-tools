import { useState } from 'react'
import html2pdf from 'html2pdf.js'
import './ResultsDisplay.css'

export default function ResultsDisplay({ data, onOptimize, loading, error }) {
  const [activeTab, setActiveTab] = useState('analysis')

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50'
    if (score >= 60) return '#ff9800'
    return '#f44336'
  }

  const handleShare = () => {
    const text = `I just optimized my resume using ATS Resume Optimizer! My ATS score: ${data.atsScore}/100. Try it: ${window.location.origin}`
    navigator.share?.({
      title: 'ATS Resume Optimizer',
      text,
      url: window.location.href
    }) || navigator.clipboard.writeText(text)
  }

  const downloadOptimized = () => {
    if (!data.optimizedResume) return
    // Compress the resume text to fit ~2 pages
    const rawLines = data.optimizedResume.split('\n')
    const compressedLines = []

    rawLines.forEach(line => {
      if (!line) return compressedLines.push('')
      if (line.length > 100) {
        let current = ''
        const words = line.split(' ')
        for (let word of words) {
          if ((current + ' ' + word).length > 85) {
            if (current) compressedLines.push(current)
            current = word
          } else {
            current += (current ? ' ' : '') + word
          }
        }
        if (current) compressedLines.push(current)
      } else {
        compressedLines.push(line)
      }
    })

    const resumeText = compressedLines.slice(0, 80).join('\n')

    // Parse using the same heuristics as the UI so PDF matches the display
    const lines = resumeText.split('\n')
    const items = lines.reduce((acc, rawLine, idx) => {
      const trimmed = (rawLine || '').trim()

      if (!trimmed) {
        if (acc.length > 0 && acc[acc.length - 1]?.type !== 'spacer') {
          acc.push({ type: 'spacer' })
        }
        return acc
      }

      if (trimmed.match(/^[•\-*]+$/) || trimmed.match(/^#+$/)) return acc

      const pageNumPatterns = [
        /^page\s*\d+(\s*of\s*\d+)?$/i,
        /^pg\.?\s*\d+$/i,
        /^\d+\s*\/\s*\d+$/,
        /^\d+\s+of\s+\d+$/i,
        /^\d{1,2}[.)]?$/
      ]
      if (pageNumPatterns.some(p => p.test(trimmed))) return acc

      if (trimmed.startsWith('##')) {
        const title = trimmed.replace(/##\s*/, '').trim().toUpperCase()
        if (acc.length > 0 && acc[acc.length - 1]?.type !== 'spacer') acc.push({ type: 'spacer' })
        acc.push({ type: 'section-title', content: title })
        return acc
      }

      const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed) && trimmed.length > 3 && trimmed.length <= 60
      const headerKeywords = /^(summary|professional summary|work experience|experience|skills|education|projects|certifications|contact|profile|achievements|objective|technical skills)$/i
      const yearRegex = /^\d{4}(\s*[-–—]\s*\d{4})?$/
      if ((isAllCaps || headerKeywords.test(trimmed)) && !yearRegex.test(trimmed)) {
        const title = trimmed.toUpperCase()
        if (acc.length > 0 && acc[acc.length - 1]?.type !== 'spacer') acc.push({ type: 'spacer' })
        acc.push({ type: 'section-title', content: title })
        return acc
      }

      if (trimmed.match(/^[•\-*]\s+/)) {
        const content = trimmed.replace(/^[•\-*]\s+/, '').trim()
        if (content) acc.push({ type: 'bullet', content })
        return acc
      }

      if (trimmed.includes('**')) {
        const content = trimmed.replace(/\*\*/g, '').trim()
        if (content) acc.push({ type: 'bold', content })
        return acc
      }

      acc.push({ type: 'text', content: trimmed })
      return acc
    }, [])

    // Render HTML string that mirrors on-screen UI with page-break logic
    let body = ''
    let inList = false
    let inSection = false
    
    items.forEach((it, idx) => {
      if (it.type === 'spacer') { 
        if (inList) { body += '</ul>'; inList = false } 
        if (inSection) { body += '</div>'; inSection = false }
        body += '<div class="spacer"></div>'
        return 
      }
      
      if (it.type === 'section-title') {
        if (inList) { body += '</ul>'; inList = false } 
        if (inSection) { body += '</div>'; inSection = false }
        body += `<div class="section-wrapper"><h3 class="section-title">${it.content}</h3>`
        inSection = true
        return 
      }
      
      if (it.type === 'bullet') { 
        if (!inList) { body += '<ul>'; inList = true } 
        body += `<li class="bullet-point">${it.content}</li>`
        return 
      }
      
      if (it.type === 'bold') { 
        if (inList) { body += '</ul>'; inList = false } 
        body += `<p class="bold-text">${it.content}</p>`
        return 
      }
      
      if (it.type === 'text') { 
        if (inList) { body += '</ul>'; inList = false } 
        body += `<p class="resume-line">${it.content}</p>`
        return 
      }
    })
    
    if (inList) body += '</ul>'
    if (inSection) body += '</div>'

    // const css = `
    //   html, body { height: 100%; }
    //   @page { size: A4; margin: 8mm; }
    //   body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background: #fff; padding: 8mm; }
    //   .optimized-header { text-align: center; margin-bottom: 10px; page-break-after: avoid; }
    //   .optimized-header h2 { color: #667eea; font-size: 20px; margin: 0 0 6px 0; }
    //   .optimization-note { color: #888; font-size: 12px; margin: 0; font-style: italic; }
    //   .score { text-align: center; font-size: 12px; margin-bottom: 8px; color: #444; }
    //   .optimized-body { line-height: 1.5; margin: 12px 0; }
    //   .section-wrapper { page-break-inside: avoid; margin-bottom: 12px; }
    //   .section-title { color: #1a5f7a; font-size: 18px; font-weight: 700; margin-top: 0px; margin-bottom: 10px; border-bottom: 3px solid #1a5f7a; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; page-break-after: avoid; }
    //   .resume-line { margin: 6px 0; font-size: 12px; color: #555; page-break-inside: avoid; }
    //   .bullet-point { margin: 6px 0 6px 20px; font-size: 12px; color: #444; }
    //   ul { page-break-inside: avoid; margin: 8px 0; }
    //   li { page-break-inside: avoid; }
    //   .bold-text { font-weight: 700; color: #222; margin: 8px 0; page-break-inside: avoid; page-break-after: avoid; }
    //   pre { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; white-space: pre-wrap; word-wrap: break-word; font-size: 12px; }
    //   .spacer { height: 8px; page-break-after: avoid; }
    // `
    const css = `
      html, body { height: 100%; }
      @page { size: A4; margin: 0; }
      * { box-sizing: border-box; }
      body { 
        font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
        color: #2c3e50; 
        background: white; 
        padding: 25mm 20mm 20mm 20mm !important;
        margin: 0;
        line-height: 1.45;
        font-size: 11px;
        orphans: 3;
        widows: 3;
    }
      .optimized-header,
  .section-wrapper,
  .section-title,
  p, ul, li,
  .resume-line, .bold-text, .bullet-point {
    page-break-inside: avoid !important;
  }
      .optimized-header h2 { color: #667eea; font-size: 20px; margin: 0 0 6px 0; }
      .optimized-header { 
    text-align: center; 
    margin-bottom: 20px; 
    page-break-after: avoid;
  }
      .optimization-note { color: #888; font-size: 12px; margin: 0; font-style: italic; }
      .score { text-align: center; font-size: 12px; margin-bottom: 8px; color: #444; }
      .optimized-body { line-height: 1.5; margin: 12px 0; }
      .section-wrapper { page-break-after: auto; }
      h3.section-title { page-break-after: avoid; }
      .section-title { color: #1a5f7a; font-size: 18px; font-weight: 700; margin-top: 0px; margin-bottom: 10px; border-bottom: 3px solid #1a5f7a; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; page-break-after: avoid; }
      .resume-line { margin: 6px 0; font-size: 12px; color: #555; page-break-inside: avoid; }
      .bullet-point { margin: 6px 0 6px 20px; font-size: 12px; color: #444; }
      ul { page-break-inside: avoid; margin: 8px 0; }
      li { page-break-inside: avoid; }
      .bold-text { font-weight: 700; color: #222; margin: 8px 0; page-break-inside: avoid; page-break-after: avoid; }
      pre { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; white-space: pre-wrap; word-wrap: break-word; font-size: 12px; }
      .spacer { height: 8px; page-break-after: avoid; }
    `

    // const htmlContent = `<!doctype html><html><head><meta charset="utf-8"><title>Optimized Resume</title><style>${css}</style></head><body><div class="optimized-header"><h2>✨ Optimized Resume</h2><div class="score">ATS Score: ${data.atsScore}/100</div><div class="optimization-note">Generated by ATS Resume Optimizer</div></div><div class="optimized-body">${body}</div></body></html>`
    const htmlContent = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="optimized-body">${body}</div></body></html>`

    // const options = {
    //   margin: [8, 8, 8, 8],
    //   filename: 'optimized-resume.pdf',
    //   image: { type: 'jpeg', quality: 0.92 },
    //   html2canvas: { scale: 1 },
    //   jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4', compress: true }
    // }
    const options = {
        margin: [10, 15, 10, 15],  // ✅ Top/Right/Bottom/Left - more balanced
        filename: 'optimized-resume.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
            scale: 1.5,           // ✅ Better quality, respects breaks better
            useCORS: true,
            letterRendering: true // ✅ Prevents text breaking mid-word
        },
        pagebreak: { 
            mode: ['avoid-all', 'css', 'legacy']  // ✅ MAGIC - prevents breaking INSIDE elements
        },
        jsPDF: { 
            orientation: 'portrait', 
            unit: 'mm', 
            format: 'a4', 
            compress: true 
        }
    }


    html2pdf().set(options).from(htmlContent).save()
  }


  return (
    <div className="results-container">
      <div className="score-card">
        <div className="score-circle">
          <svg className="score-svg" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={getScoreColor(data.atsScore)}
              strokeWidth="8"
              strokeDasharray={`${(data.atsScore / 100) * 283} 283`}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
            />
          </svg>
          <div className="score-text">
            <span className="score-number">{data.atsScore}</span>
            <span className="score-label">ATS Score</span>
          </div>
        </div>
        <p className="score-interpretation">
          {data.atsScore >= 80 && 'Excellent! Your resume is ATS-friendly.'}
          {data.atsScore >= 60 && data.atsScore < 80 && 'Good! Your resume has good ATS compatibility.'}
          {data.atsScore < 60 && 'Needs improvement. Follow suggestions below.'}
        </p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          Analysis
        </button>
        <button
          className={`tab ${activeTab === 'optimized' ? 'active' : ''}`}
          onClick={() => setActiveTab('optimized')}
        >
          Optimized Version
        </button>
      </div>

      <div className="content-card">
        {activeTab === 'analysis' && (
          <div className="analysis-content">
            {data.suggestions && data.suggestions.length > 0 && (
              <div className="suggestions-section">
                <h3>Improvement Suggestions</h3>
                <ul className="suggestions-list">
                  {data.suggestions.map((suggestion, idx) => (
                    <li key={idx}>
                      <span className="suggestion-icon">💡</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.missingKeywords && data.missingKeywords.length > 0 && (
              <div className="keywords-section">
                <h3>Missing Keywords</h3>
                <p className="keywords-intro">Add these keywords to improve your ATS score:</p>
                <div className="keywords-grid">
                  {data.missingKeywords.map((keyword, idx) => (
                    <span key={idx} className="keyword-tag">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'optimized' && (
          <div className="optimized-content">
            {!data.optimizedResume ? (
              <div className="no-optimized">
                <p>Click the button below to generate an AI-optimized version of your resume</p>
                <button
                  className="btn btn-primary"
                  onClick={onOptimize}
                  disabled={loading}
                >
                  {loading ? 'Optimizing...' : 'Optimize Resume'}
                </button>
              </div>
            ) : (
              <div>
                <div className="optimized-display">
                  <div className="optimized-header">
                    <h2>✨ Optimized Resume</h2>
                    <p className="optimization-note">Your resume has been enhanced with stronger action verbs and better formatting</p>
                  </div>
                  <div className="optimized-body">
                    {(() => {
                      const items = data.optimizedResume.split('\n').reduce((acc, line, idx) => {
                        const trimmed = line.trim();

                        if (!trimmed) {
                          if (acc.length > 0 && acc[acc.length - 1]?.type !== 'spacer') {
                            acc.push({ type: 'spacer', key: `spacer-${idx}` });
                          }
                          return acc;
                        }

                        if (trimmed.match(/^[•\-*]+$/) || trimmed.match(/^#+$/)) {
                          return acc;
                        }

                        const pageNumPatterns = [
                          /^page\s*\d+(\s*of\s*\d+)?$/i,
                          /^pg\.?\s*\d+$/i,
                          /^\d+\s*\/\s*\d+$/,
                          /^\d+\s+of\s+\d+$/i,
                          /^\d{1,2}[.)]?$/
                        ];
                        if (pageNumPatterns.some(p => p.test(trimmed))) return acc;

                        if (trimmed.startsWith('##')) {
                          const title = trimmed.replace(/##\s*/, '').trim().toUpperCase();
                          if (acc.length > 0 && acc[acc.length - 1]?.type !== 'spacer') {
                            acc.push({ type: 'spacer', key: `spacer-before-${idx}` });
                          }
                          acc.push({ type: 'section-title', content: title, key: `section-${idx}` });
                          return acc;
                        }

                        const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed) && trimmed.length > 3 && trimmed.length <= 60;
                        const headerKeywords = /^(summary|professional summary|work experience|experience|skills|education|projects|certifications|contact|profile|achievements|objective|technical skills)$/i;
                        const yearRegex = /^\d{4}(\s*[-–—]\s*\d{4})?$/;
                        if ((isAllCaps || headerKeywords.test(trimmed)) && !yearRegex.test(trimmed)) {
                          const title = trimmed.toUpperCase();
                          if (acc.length > 0 && acc[acc.length - 1]?.type !== 'spacer') {
                            acc.push({ type: 'spacer', key: `spacer-before-${idx}` });
                          }
                          acc.push({ type: 'section-title', content: title, key: `section-auto-${idx}` });
                          return acc;
                        }

                        if (trimmed.match(/^[•\-*]\s+/)) {
                          const content = trimmed.replace(/^[•\-*]\s+/, '').trim();
                          if (content && content.length > 0) {
                            acc.push({ type: 'bullet', content, key: `bullet-${idx}` });
                          }
                          return acc;
                        }

                        if (trimmed.includes('**')) {
                          const content = trimmed.replace(/\*\*/g, '').trim();
                          if (content) {
                            acc.push({ type: 'bold', content, key: `bold-${idx}` });
                          }
                          return acc;
                        }

                        if (trimmed) {
                          acc.push({ type: 'text', content: trimmed, key: `text-${idx}` });
                        }

                        return acc;
                      }, []);

                      const renderedNodes = (() => {
                        const nodes = [];
                        let inList = false;
                        let currentList = [];

                        items.forEach((item, i) => {
                          if (item.type === 'spacer') {
                              if (inList && currentList.length) { nodes.push(<ul key={`ul-${i}`}>{currentList}</ul>); currentList = []; inList = false; }
                              nodes.push(<div key={item.key} className="spacer"></div>);
                              return;
                            }

                          if (item.type === 'section-title') {
                            if (inList && currentList.length) { nodes.push(<ul key={`ul-${i}`}>{currentList}</ul>); currentList = []; inList = false; }
                            nodes.push(<h3 key={item.key} className="section-title">{item.content}</h3>);
                            return;
                          }

                          if (item.type === 'bullet') {
                            const content = (item.content || '').toString().trim();
                            if (content) {
                              currentList.push(<li key={item.key} className="bullet-point">{content}</li>);
                              inList = true;
                            }
                            return;
                          }

                          if (item.type === 'bold') {
                            if (inList) { nodes.push(<ul key={`ul-${i}`}>{currentList}</ul>); currentList = []; inList = false; }
                            nodes.push(<p key={item.key} className="bold-text">{item.content}</p>);
                            return;
                          }

                          if (item.type === 'text') {
                            if (inList) { nodes.push(<ul key={`ul-${i}`}>{currentList}</ul>); currentList = []; inList = false; }
                            nodes.push(<p key={item.key} className="resume-line">{item.content}</p>);
                            return;
                          }
                        });

                        if (inList && currentList.length) nodes.push(<ul key={`ul-end`}>{currentList}</ul>);
                        return nodes;
                      })();

                      return renderedNodes;
                    })()}
                  </div>
                </div>
                <div className="download-section">
                  <button
                    className="btn btn-primary"
                    onClick={downloadOptimized}
                  >
                    📥 Download as PDF
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      const text = data.optimizedResume
                      const element = document.createElement('a')
                      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
                      element.setAttribute('download', 'optimized-resume.txt')
                      element.style.display = 'none'
                      document.body.appendChild(element)
                      element.click()
                      document.body.removeChild(element)
                    }}
                  >
                    📄 Download as Text
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button className="btn btn-primary" onClick={handleShare}>
          📤 Share Results
        </button>
        <button className="btn btn-secondary" onClick={() => window.location.reload()}>
          📄 Upload Another Resume
        </button>
      </div>

      {/* Ad placeholder */}
      <div className="ad-container">
        <p style={{ color: '#999', fontSize: '0.9rem' }}>
          Advertisement space - AdSense banners go here
        </p>
      </div>
    </div>
  )
}

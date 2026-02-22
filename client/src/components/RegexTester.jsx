import { useState, useMemo } from 'react'
import './RegexTester.css'

const EXAMPLE_PATTERNS = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', testStr: 'Contact us at hello@example.com or support@company.org for help.' },
  { name: 'URL', pattern: 'https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[\\/\\w\\-.,@?^=%&:~+#]*', testStr: 'Visit https://www.example.com or http://docs.site.org/path?q=1 for more info.' },
  { name: 'Phone', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', testStr: 'Call us at (555) 123-4567 or 555.987.6543 anytime.' },
  { name: 'IP Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', testStr: 'Server IPs: 192.168.1.1, 10.0.0.255, and 172.16.254.3 are whitelisted.' },
]

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [testString, setTestString] = useState('')
  const [flagG, setFlagG] = useState(true)
  const [flagI, setFlagI] = useState(false)
  const [flagM, setFlagM] = useState(false)

  const flags = useMemo(() => {
    let f = ''
    if (flagG) f += 'g'
    if (flagI) f += 'i'
    if (flagM) f += 'm'
    return f
  }, [flagG, flagI, flagM])

  const results = useMemo(() => {
    if (!pattern || !testString) {
      return { error: null, matches: [], isMatch: false, highlightedHtml: escapeHtml(testString) }
    }

    let regex
    try {
      regex = new RegExp(pattern, flags)
    } catch (e) {
      return { error: e.message, matches: [], isMatch: false, highlightedHtml: escapeHtml(testString) }
    }

    const matches = []
    if (flags.includes('g')) {
      let match
      while ((match = regex.exec(testString)) !== null) {
        matches.push({ value: match[0], index: match.index })
        if (match[0].length === 0) {
          regex.lastIndex++
        }
      }
    } else {
      const match = regex.exec(testString)
      if (match) {
        matches.push({ value: match[0], index: match.index })
      }
    }

    const isMatch = matches.length > 0

    // Build highlighted HTML
    let highlightedHtml = ''
    let lastIndex = 0
    for (const m of matches) {
      if (m.index > lastIndex) {
        highlightedHtml += escapeHtml(testString.slice(lastIndex, m.index))
      }
      highlightedHtml += '<mark class="regex-highlight">' + escapeHtml(m.value) + '</mark>'
      lastIndex = m.index + m.value.length
    }
    if (lastIndex < testString.length) {
      highlightedHtml += escapeHtml(testString.slice(lastIndex))
    }

    return { error: null, matches, isMatch, highlightedHtml }
  }, [pattern, testString, flags])

  const loadExample = (example) => {
    setPattern(example.pattern)
    setTestString(example.testStr)
  }

  const clearAll = () => {
    setPattern('')
    setTestString('')
    setFlagG(true)
    setFlagI(false)
    setFlagM(false)
  }

  return (
    <div className="regex-container">
      <div className="regex-header">
        <h2>Regex Tester</h2>
        <p>Test and debug regular expressions in real time</p>
      </div>

      <div className="regex-examples">
        <h3>Quick Examples</h3>
        <div className="regex-examples-grid">
          {EXAMPLE_PATTERNS.map((ex) => (
            <div className="regex-example-card" key={ex.name}>
              <button onClick={() => loadExample(ex)}>{ex.name}</button>
            </div>
          ))}
        </div>
      </div>

      <div className="regex-main-grid">
        <div className="regex-input-panel">
          <div className="regex-panel-header">
            <h3>Pattern</h3>
            <button className="regex-action-btn" onClick={clearAll} title="Clear all">Clear</button>
          </div>
          <div className="regex-pattern-row">
            <span className="regex-delimiter">/</span>
            <input
              type="text"
              className="regex-pattern-input"
              placeholder="Enter regex pattern..."
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              spellCheck={false}
            />
            <span className="regex-delimiter">/{flags}</span>
          </div>

          <div className="regex-flags">
            <label className="regex-flag-label">
              <input
                type="checkbox"
                checked={flagG}
                onChange={(e) => setFlagG(e.target.checked)}
              />
              <span className="regex-flag-name">g</span>
              <span className="regex-flag-desc">Global</span>
            </label>
            <label className="regex-flag-label">
              <input
                type="checkbox"
                checked={flagI}
                onChange={(e) => setFlagI(e.target.checked)}
              />
              <span className="regex-flag-name">i</span>
              <span className="regex-flag-desc">Case Insensitive</span>
            </label>
            <label className="regex-flag-label">
              <input
                type="checkbox"
                checked={flagM}
                onChange={(e) => setFlagM(e.target.checked)}
              />
              <span className="regex-flag-name">m</span>
              <span className="regex-flag-desc">Multiline</span>
            </label>
          </div>

          {results.error && (
            <div className="regex-error">
              <strong>Invalid Pattern:</strong> {results.error}
            </div>
          )}

          <div className="regex-panel-header" style={{ marginTop: 20 }}>
            <h3>Test String</h3>
          </div>
          <textarea
            className="regex-textarea"
            placeholder="Enter text to test against..."
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
          />
        </div>

        <div className="regex-results-panel">
          <div className="regex-panel-header">
            <h3>Results</h3>
          </div>

          <div className="regex-summary-row">
            <div className={`regex-status ${pattern && testString ? (results.isMatch ? 'match' : 'no-match') : 'idle'}`}>
              {!pattern || !testString
                ? 'Enter a pattern and test string'
                : results.error
                  ? 'Invalid pattern'
                  : results.isMatch
                    ? 'Pattern matches!'
                    : 'No match found'}
            </div>
            {pattern && testString && !results.error && (
              <div className="regex-match-count">
                <span className="regex-count-number">{results.matches.length}</span>
                <span className="regex-count-label">match{results.matches.length !== 1 ? 'es' : ''}</span>
              </div>
            )}
          </div>

          {pattern && testString && !results.error && results.matches.length > 0 && (
            <>
              <div className="regex-highlighted-section">
                <h4>Highlighted Matches</h4>
                <div
                  className="regex-highlighted-text"
                  dangerouslySetInnerHTML={{ __html: results.highlightedHtml }}
                />
              </div>

              <div className="regex-match-list-section">
                <h4>All Matches ({results.matches.length})</h4>
                <div className="regex-match-list">
                  {results.matches.map((m, i) => (
                    <div className="regex-match-item" key={i}>
                      <span className="regex-match-index">#{i + 1}</span>
                      <span className="regex-match-value">"{m.value}"</span>
                      <span className="regex-match-position">index {m.index}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {pattern && testString && !results.error && results.matches.length === 0 && (
            <div className="regex-no-matches">
              The pattern did not match any part of the test string. Try adjusting your regex or flags.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

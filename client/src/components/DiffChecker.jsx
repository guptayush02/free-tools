import { useState, useMemo } from 'react'
import './DiffChecker.css'

function computeLCS(a, b) {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const result = []
  let i = m
  let j = n
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift({ type: 'same', oldIndex: i - 1, newIndex: j - 1, value: a[i - 1] })
      i--
      j--
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  return result
}

function buildDiffLines(originalLines, modifiedLines) {
  const lcs = computeLCS(originalLines, modifiedLines)
  const diff = []

  let oi = 0
  let mi = 0
  let li = 0

  while (li < lcs.length) {
    const match = lcs[li]

    while (oi < match.oldIndex) {
      diff.push({ type: 'removed', value: originalLines[oi], oldLineNum: oi + 1, newLineNum: null })
      oi++
    }

    while (mi < match.newIndex) {
      diff.push({ type: 'added', value: modifiedLines[mi], oldLineNum: null, newLineNum: mi + 1 })
      mi++
    }

    diff.push({ type: 'same', value: match.value, oldLineNum: oi + 1, newLineNum: mi + 1 })
    oi++
    mi++
    li++
  }

  while (oi < originalLines.length) {
    diff.push({ type: 'removed', value: originalLines[oi], oldLineNum: oi + 1, newLineNum: null })
    oi++
  }

  while (mi < modifiedLines.length) {
    diff.push({ type: 'added', value: modifiedLines[mi], oldLineNum: null, newLineNum: mi + 1 })
    mi++
  }

  return diff
}

export default function DiffChecker() {
  const [originalText, setOriginalText] = useState('')
  const [modifiedText, setModifiedText] = useState('')
  const [diffResult, setDiffResult] = useState(null)

  const stats = useMemo(() => {
    if (!diffResult) return null
    const added = diffResult.filter(d => d.type === 'added').length
    const removed = diffResult.filter(d => d.type === 'removed').length
    const unchanged = diffResult.filter(d => d.type === 'same').length
    return { added, removed, unchanged }
  }, [diffResult])

  const handleCompare = () => {
    const origLines = originalText.split('\n')
    const modLines = modifiedText.split('\n')
    const diff = buildDiffLines(origLines, modLines)
    setDiffResult(diff)
  }

  const handleClear = () => {
    setOriginalText('')
    setModifiedText('')
    setDiffResult(null)
  }

  const handleSwap = () => {
    const temp = originalText
    setOriginalText(modifiedText)
    setModifiedText(temp)
    setDiffResult(null)
  }

  return (
    <div className="diff-container">
      <div className="diff-header">
        <h2>Diff Checker</h2>
        <p>Compare two texts and see the differences line by line</p>
      </div>

      {stats && (
        <div className="diff-stats">
          <div className="diff-stat-card diff-stat-added">
            <span className="diff-stat-number">{stats.added}</span>
            <span className="diff-stat-label">Added</span>
          </div>
          <div className="diff-stat-card diff-stat-removed">
            <span className="diff-stat-number">{stats.removed}</span>
            <span className="diff-stat-label">Removed</span>
          </div>
          <div className="diff-stat-card diff-stat-unchanged">
            <span className="diff-stat-number">{stats.unchanged}</span>
            <span className="diff-stat-label">Unchanged</span>
          </div>
        </div>
      )}

      <div className="diff-input-grid">
        <div className="diff-input-panel">
          <div className="diff-panel-header">
            <h3>Original Text</h3>
          </div>
          <textarea
            className="diff-textarea"
            placeholder="Paste original text here..."
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
          />
        </div>

        <div className="diff-input-panel">
          <div className="diff-panel-header">
            <h3>Modified Text</h3>
          </div>
          <textarea
            className="diff-textarea"
            placeholder="Paste modified text here..."
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
          />
        </div>
      </div>

      <div className="diff-controls">
        <button className="diff-btn diff-btn-compare" onClick={handleCompare}>
          Compare
        </button>
        <button className="diff-btn diff-btn-swap" onClick={handleSwap}>
          Swap Texts
        </button>
        <button className="diff-btn diff-btn-clear" onClick={handleClear}>
          Clear Both
        </button>
      </div>

      {diffResult && (
        <div className="diff-output-panel">
          <div className="diff-panel-header">
            <h3>Diff Output</h3>
            <span className="diff-output-summary">
              {diffResult.length} line{diffResult.length !== 1 ? 's' : ''} compared
            </span>
          </div>
          <div className="diff-output-body">
            {diffResult.length === 0 ? (
              <div className="diff-empty">Both texts are empty.</div>
            ) : (
              diffResult.map((line, index) => (
                <div key={index} className={`diff-line diff-line-${line.type}`}>
                  <span className="diff-line-num diff-line-num-old">
                    {line.oldLineNum !== null ? line.oldLineNum : ''}
                  </span>
                  <span className="diff-line-num diff-line-num-new">
                    {line.newLineNum !== null ? line.newLineNum : ''}
                  </span>
                  <span className="diff-line-prefix">
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                  </span>
                  <span className="diff-line-content">{line.value}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useMemo } from 'react'
import './WordCounter.css'

export default function WordCounter() {
  const [text, setText] = useState('')
  const [searchWord, setSearchWord] = useState('')

  const stats = useMemo(() => {
    const trimmed = text.trim()
    if (!trimmed) return { words: 0, chars: text.length, charsNoSpaces: 0, sentences: 0, paragraphs: 0, lines: 0 }

    const words = trimmed.split(/\s+/).length
    const chars = text.length
    const charsNoSpaces = text.replace(/\s/g, '').length
    const sentences = (trimmed.match(/[.!?]+/g) || []).length || (trimmed.length > 0 ? 1 : 0)
    const paragraphs = trimmed.split(/\n\s*\n/).filter(p => p.trim()).length
    const lines = trimmed.split('\n').length

    return { words, chars, charsNoSpaces, sentences, paragraphs, lines }
  }, [text])

  const wordOccurrence = useMemo(() => {
    if (!searchWord.trim() || !text.trim()) return null
    const regex = new RegExp(`\\b${searchWord.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    const matches = text.match(regex)
    return matches ? matches.length : 0
  }, [text, searchWord])

  const topWords = useMemo(() => {
    const trimmed = text.trim()
    if (!trimmed) return []
    const wordList = trimmed.toLowerCase().split(/\s+/)
    const freq = {}
    wordList.forEach(w => {
      const clean = w.replace(/[^a-zA-Z0-9'-]/g, '')
      if (clean.length > 0) freq[clean] = (freq[clean] || 0) + 1
    })
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  }, [text])

  const clearAll = () => {
    setText('')
    setSearchWord('')
  }

  const copyText = () => {
    if (text) {
      navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    }
  }

  return (
    <div className="word-counter-container">
      <div className="word-counter-header">
        <h2>Word Counter</h2>
        <p>Count words, characters, and find word occurrences</p>
      </div>

      <div className="word-counter-stats">
        <div className="stat-card stat-primary">
          <span className="stat-number">{stats.words}</span>
          <span className="stat-label">Words</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.chars}</span>
          <span className="stat-label">Characters</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.charsNoSpaces}</span>
          <span className="stat-label">No Spaces</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.sentences}</span>
          <span className="stat-label">Sentences</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.paragraphs}</span>
          <span className="stat-label">Paragraphs</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.lines}</span>
          <span className="stat-label">Lines</span>
        </div>
      </div>

      <div className="word-counter-grid">
        <div className="word-counter-input-panel">
          <div className="wc-panel-header">
            <h3>Your Text</h3>
            <div className="wc-panel-actions">
              <button className="wc-action-btn" onClick={copyText} title="Copy text">📋</button>
              <button className="wc-action-btn" onClick={clearAll} title="Clear all">🗑️</button>
            </div>
          </div>
          <textarea
            className="wc-textarea"
            placeholder="Type or paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="word-counter-sidebar">
          <div className="search-section">
            <h3>Find Word</h3>
            <div className="search-input-row">
              <input
                type="text"
                className="search-input"
                placeholder="Enter a word..."
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
              />
            </div>
            {searchWord.trim() && (
              <div className={`search-result ${wordOccurrence > 0 ? 'found' : 'not-found'}`}>
                {wordOccurrence > 0 ? (
                  <><span className="search-count">{wordOccurrence}</span> occurrence{wordOccurrence !== 1 ? 's' : ''} of "<strong>{searchWord.trim()}</strong>"</>
                ) : (
                  <>No occurrences of "<strong>{searchWord.trim()}</strong>" found</>
                )}
              </div>
            )}
          </div>

          {topWords.length > 0 && (
            <div className="top-words-section">
              <h3>Top Words</h3>
              <div className="top-words-list">
                {topWords.map(([word, count], i) => (
                  <div key={word} className="top-word-item" onClick={() => setSearchWord(word)}>
                    <span className="top-word-rank">#{i + 1}</span>
                    <span className="top-word-text">{word}</span>
                    <span className="top-word-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

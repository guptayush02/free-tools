import { useState } from 'react'
import './UrlEncoder.css'

export default function UrlEncoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [activeAction, setActiveAction] = useState('')

  const encodeURL = () => {
    try {
      setError('')
      const encoded = encodeURI(input)
      setOutput(encoded)
      setActiveAction('Encode URL')
    } catch (e) {
      setError(`Encoding failed: ${e.message}`)
      setOutput('')
    }
  }

  const decodeURL = () => {
    try {
      setError('')
      const decoded = decodeURI(input)
      setOutput(decoded)
      setActiveAction('Decode URL')
    } catch (e) {
      setError(`Decoding failed: ${e.message}`)
      setOutput('')
    }
  }

  const encodeComponent = () => {
    try {
      setError('')
      const encoded = encodeURIComponent(input)
      setOutput(encoded)
      setActiveAction('Encode Component')
    } catch (e) {
      setError(`Encoding failed: ${e.message}`)
      setOutput('')
    }
  }

  const decodeComponent = () => {
    try {
      setError('')
      const decoded = decodeURIComponent(input)
      setOutput(decoded)
      setActiveAction('Decode Component')
    } catch (e) {
      setError(`Decoding failed: ${e.message}`)
      setOutput('')
    }
  }

  const copyInput = () => {
    if (input) {
      navigator.clipboard.writeText(input)
      alert('Copied to clipboard!')
    }
  }

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output)
      alert('Copied to clipboard!')
    }
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
    setActiveAction('')
  }

  const swapValues = () => {
    setInput(output)
    setOutput('')
    setError('')
    setActiveAction('')
  }

  const loadExample = (url) => {
    setInput(url)
    setOutput('')
    setError('')
    setActiveAction('')
  }

  return (
    <div className="url-encoder-container">
      <div className="url-encoder-header">
        <h2>URL Encoder / Decoder</h2>
        <p>Encode and decode URLs and URI components instantly</p>
      </div>

      <div className="url-encoder-grid">
        <div className="url-input-panel">
          <div className="url-panel-header">
            <h3>Input</h3>
            <div className="url-panel-actions">
              <button className="url-action-btn" onClick={copyInput} title="Copy input">📋</button>
              <button className="url-action-btn" onClick={clearAll} title="Clear all">🗑️</button>
            </div>
          </div>
          <textarea
            className="url-textarea"
            placeholder="Paste your URL or text here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="url-controls">
          <button className="url-btn url-btn-encode" onClick={encodeURL}>
            🔒 Encode URL
          </button>
          <button className="url-btn url-btn-decode" onClick={decodeURL}>
            🔓 Decode URL
          </button>
          <button className="url-btn url-btn-encode-comp" onClick={encodeComponent}>
            🔐 Encode Component
          </button>
          <button className="url-btn url-btn-decode-comp" onClick={decodeComponent}>
            🔑 Decode Component
          </button>
          <button className="url-btn url-btn-swap" onClick={swapValues} title="Use output as input">
            🔄 Swap
          </button>
        </div>

        <div className="url-output-panel">
          <div className="url-panel-header">
            <h3>Output {activeAction && <span className="url-active-label">({activeAction})</span>}</h3>
            <div className="url-panel-actions">
              <button className="url-action-btn" onClick={copyOutput} title="Copy output">📋</button>
            </div>
          </div>
          {error && <div className="url-error">{error}</div>}
          <textarea
            className="url-textarea url-output-textarea"
            placeholder="Encoded or decoded output will appear here..."
            value={output}
            readOnly
          />
        </div>
      </div>

      {input && output && (
        <div className="url-comparison">
          <h3>Side by Side Comparison</h3>
          <div className="url-comparison-grid">
            <div className="url-comparison-col">
              <span className="url-comparison-label">Original</span>
              <div className="url-comparison-value">{input}</div>
            </div>
            <div className="url-comparison-arrow">→</div>
            <div className="url-comparison-col">
              <span className="url-comparison-label">Result</span>
              <div className="url-comparison-value">{output}</div>
            </div>
          </div>
          {input !== output && (
            <div className="url-diff-info">
              <span className="url-diff-badge">Input length: {input.length}</span>
              <span className="url-diff-badge">Output length: {output.length}</span>
              <span className="url-diff-badge">
                Difference: {output.length - input.length > 0 ? '+' : ''}{output.length - input.length} chars
              </span>
            </div>
          )}
        </div>
      )}

      <div className="url-examples">
        <h3>Quick Examples</h3>
        <div className="url-examples-grid">
          <div className="url-example-card">
            <button onClick={() => loadExample('https://example.com/search?q=hello world&lang=en&page=1')}>
              URL with Query Params
            </button>
          </div>
          <div className="url-example-card">
            <button onClick={() => loadExample('https://example.com/path/to/page?name=John Doe&city=New York&tag=c++')}>
              Spaces & Special Chars
            </button>
          </div>
          <div className="url-example-card">
            <button onClick={() => loadExample('https://example.com/api?data={"key":"value","arr":[1,2,3]}')}>
              JSON in URL
            </button>
          </div>
          <div className="url-example-card">
            <button onClick={() => loadExample('https://example.com/search?q=%E4%BD%A0%E5%A5%BD&lang=zh')}>
              Encoded Unicode
            </button>
          </div>
          <div className="url-example-card">
            <button onClick={() => loadExample('https://example.com/redirect?url=https%3A%2F%2Fother.com%2Fpath%3Ffoo%3Dbar')}>
              Encoded Nested URL
            </button>
          </div>
          <div className="url-example-card">
            <button onClick={() => loadExample('user@example.com?subject=Hello World!&body=Line 1\nLine 2')}>
              Email Mailto Params
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

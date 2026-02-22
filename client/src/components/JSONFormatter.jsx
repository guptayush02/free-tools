import React, { useState } from 'react'
import './JSONFormatter.css'

export default function JSONFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const formatJSON = () => {
    try {
      setError('')
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)
      setOutput(formatted)
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`)
      setOutput('')
    }
  }

  const minifyJSON = () => {
    try {
      setError('')
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`)
      setOutput('')
    }
  }

  const validateJSON = () => {
    try {
      setError('')
      JSON.parse(input)
      setOutput('✓ Valid JSON')
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`)
      setOutput('')
    }
  }

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output)
      alert('Copied to clipboard!')
    }
  }

  const copyInput = () => {
    if (input) {
      navigator.clipboard.writeText(input)
      alert('Copied to clipboard!')
    }
  }

  const downloadJSON = () => {
    if (output) {
      const element = document.createElement('a')
      const file = new Blob([output], { type: 'application/json' })
      element.href = URL.createObjectURL(file)
      element.download = 'formatted.json'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }

  return (
    <div className="json-formatter-container">
      <div className="json-formatter-header">
        <h2>JSON Formatter & Validator</h2>
        <p>Format, minify, and validate JSON</p>
      </div>

      <div className="json-formatter-grid">
        <div className="json-input-panel">
          <div className="json-panel-header">
            <h3>Input JSON</h3>
            <button className="copy-btn" onClick={copyInput} title="Copy input">📋</button>
          </div>
          <textarea
            className="json-textarea"
            placeholder="Paste your JSON here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="json-controls">
          <button className="json-btn json-btn-format" onClick={formatJSON}>
            🎯 Format
          </button>
          <button className="json-btn json-btn-minify" onClick={minifyJSON}>
            📦 Minify
          </button>
          <button className="json-btn json-btn-validate" onClick={validateJSON}>
            ✓ Validate
          </button>
        </div>

        <div className="json-output-panel">
          <div className="json-panel-header">
            <h3>Output</h3>
            <div className="json-output-buttons">
              <button className="copy-btn" onClick={copyOutput} title="Copy output">📋</button>
              <button className="copy-btn" onClick={downloadJSON} title="Download JSON">⬇️</button>
            </div>
          </div>
          {error && <div className="json-error">{error}</div>}
          <textarea
            className="json-textarea json-output-textarea"
            placeholder="Formatted output will appear here..."
            value={output}
            readOnly
          />
        </div>
      </div>

      <div className="json-examples">
        <h3>Quick Examples</h3>
        <div className="examples-grid">
          <div className="example-card">
            <button
              onClick={() => {
                setInput('{"name":"John","age":30,"city":"New York"}')
                setError('')
              }}
            >
              Sample 1: Person Object
            </button>
          </div>
          <div className="example-card">
            <button
              onClick={() => {
                setInput('[{"id":1,"task":"Learn JSON"},{"id":2,"task":"Build App"}]')
                setError('')
              }}
            >
              Sample 2: Array of Objects
            </button>
          </div>
          <div className="example-card">
            <button
              onClick={() => {
                setInput('{"config":{"host":"localhost","port":3000,"debug":true}}')
                setError('')
              }}
            >
              Sample 3: Nested Config
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

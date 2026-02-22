import { useState } from 'react'
import './Base64Tool.css'

export default function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const encodeBase64 = () => {
    try {
      setError('')
      if (!input.trim()) {
        setError('Please enter some text to encode.')
        setOutput('')
        return
      }
      const encoded = btoa(unescape(encodeURIComponent(input)))
      setOutput(encoded)
    } catch (e) {
      setError(`Encoding error: ${e.message}`)
      setOutput('')
    }
  }

  const decodeBase64 = () => {
    try {
      setError('')
      if (!input.trim()) {
        setError('Please enter a Base64 string to decode.')
        setOutput('')
        return
      }
      const decoded = decodeURIComponent(escape(atob(input.trim())))
      setOutput(decoded)
    } catch (e) {
      setError('Invalid Base64 string. Please check your input and try again.')
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

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  const handleFileRead = (file) => {
    setError('')
    const reader = new FileReader()
    reader.onload = () => {
      const base64String = reader.result.split(',')[1]
      const prefix = reader.result.split(',')[0] + ','
      setInput(`[File: ${file.name}]`)
      setOutput(prefix + base64String)
    }
    reader.onerror = () => {
      setError('Failed to read file. Please try again.')
    }
    reader.readAsDataURL(file)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileRead(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileRead(file)
    }
  }

  return (
    <div className="base64-container">
      <div className="base64-header">
        <h2>Base64 Encoder / Decoder</h2>
        <p>Encode text or files to Base64 and decode Base64 strings</p>
      </div>

      <div className="base64-grid">
        <div className="base64-input-panel">
          <div className="base64-panel-header">
            <h3>Input</h3>
            <div className="base64-input-buttons">
              <button className="b64-copy-btn" onClick={copyInput} title="Copy input">📋</button>
              <button className="b64-copy-btn" onClick={clearAll} title="Clear all">🗑️</button>
            </div>
          </div>
          <textarea
            className="base64-textarea"
            placeholder="Enter text to encode, or paste Base64 to decode..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="base64-controls">
          <button className="base64-btn base64-btn-encode" onClick={encodeBase64}>
            🔒 Encode
          </button>
          <button className="base64-btn base64-btn-decode" onClick={decodeBase64}>
            🔓 Decode
          </button>
          <button className="base64-btn base64-btn-clear" onClick={clearAll}>
            ✕ Clear
          </button>
        </div>

        <div className="base64-output-panel">
          <div className="base64-panel-header">
            <h3>Output</h3>
            <div className="base64-output-buttons">
              <button className="b64-copy-btn" onClick={copyOutput} title="Copy output">📋</button>
            </div>
          </div>
          {error && <div className="base64-error">{error}</div>}
          <textarea
            className="base64-textarea base64-output-textarea"
            placeholder="Encoded or decoded output will appear here..."
            value={output}
            readOnly
          />
        </div>
      </div>

      <div
        className={`base64-file-upload ${dragActive ? 'base64-drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <h3>File to Base64</h3>
        <p>Drag & drop a file here, or click to select one</p>
        <label className="base64-file-label">
          <input
            type="file"
            className="base64-file-input"
            onChange={handleFileSelect}
          />
          Choose File
        </label>
      </div>
    </div>
  )
}

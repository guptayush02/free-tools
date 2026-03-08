import { useState, useRef, useEffect } from 'react'
import './QRCodeGenerator.css'

/* ── Preset templates ── */

const PRESETS = [
  {
    name: 'URL',
    icon: '🔗',
    template: 'https://example.com',
    description: 'Website link',
  },
  {
    name: 'Email',
    icon: '📧',
    template: 'mailto:user@example.com?subject=Hello&body=Hi there!',
    description: 'Email address',
  },
  {
    name: 'Phone',
    icon: '📞',
    template: 'tel:+1234567890',
    description: 'Phone number',
  },
  {
    name: 'WiFi',
    icon: '📶',
    template: 'WIFI:T:WPA;S:NetworkName;P:Password123;;',
    description: 'WiFi credentials',
  },
  {
    name: 'SMS',
    icon: '💬',
    template: 'sms:+1234567890?body=Hello!',
    description: 'Text message',
  },
]

const SIZE_OPTIONS = [
  { label: '100 x 100', value: 100 },
  { label: '200 x 200', value: 200 },
  { label: '300 x 300', value: 300 },
  { label: '400 x 400', value: 400 },
]

/* ── Component ── */

export default function QRCodeGenerator() {
  const [text, setText] = useState('')
  const [size, setSize] = useState(200)
  const [generated, setGenerated] = useState(false)
  const [qrUrl, setQrUrl] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [activePreset, setActivePreset] = useState(null)
  const canvasRef = useRef(null)
  const imgRef = useRef(null)

  /* Build the Google Charts QR URL */
  const buildQrUrl = (inputText, inputSize) => {
    // return `https://chart.googleapis.com/chart?cht=qr&chs=${inputSize}x${inputSize}&chl=${encodeURIComponent(inputText)}&choe=UTF-8`
    return `https://api.qrserver.com/v1/create-qr-code/?size=${inputSize}x${inputSize}&data=${encodeURIComponent(inputText)}`
  }

  /* Generate QR code */
  const handleGenerate = () => {
    try {
      setError('')
      if (!text.trim()) {
        setError('Please enter text or a URL to generate a QR code.')
        setGenerated(false)
        setQrUrl('')
        return
      }
      const url = buildQrUrl(text.trim(), size)
      setQrUrl(url)
      setGenerated(true)
    } catch (e) {
      console.error('QR generation error:', e)
      setError('Failed to generate QR code. Please try again.')
      setGenerated(false)
      setQrUrl('')
    }
  }

  /* Re-generate when size changes (if already generated) */
  useEffect(() => {
    if (generated && text.trim()) {
      const url = buildQrUrl(text.trim(), size)
      setQrUrl(url)
    }
  }, [size])

  /* Download QR as PNG via canvas */
  const handleDownload = () => {
    if (!qrUrl || !imgRef.current) return

    const img = imgRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, size, size)

    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `qrcode-${size}x${size}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /* Apply a preset template */
  const handlePreset = (preset) => {
    setText(preset.template)
    setActivePreset(preset.name)
    setError('')
  }

  /* Copy QR image URL to clipboard */
  const handleCopyUrl = () => {
    if (!qrUrl) return
    navigator.clipboard.writeText(qrUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  /* Clear everything */
  const handleClear = () => {
    setText('')
    setGenerated(false)
    setQrUrl('')
    setError('')
    setActivePreset(null)
    setCopied(false)
  }

  /* Character count */
  const charCount = text.length
  const maxChars = 2048

  return (
    <div className="qr-container">
      <div className="qr-header">
        <h2>QR Code Generator</h2>
        <p>Generate QR codes for URLs, text, emails, phone numbers, WiFi, and more</p>
      </div>

      {/* ── Quick Presets ── */}
      <div className="qr-presets-section">
        <h3>Quick Presets</h3>
        <div className="qr-presets-grid">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              className={`qr-preset-btn ${activePreset === preset.name ? 'qr-preset-btn-active' : ''}`}
              onClick={() => handlePreset(preset)}
              title={preset.description}
            >
              <span className="qr-preset-icon">{preset.icon}</span>
              <span className="qr-preset-name">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="qr-main-grid">
        {/* ── Left: Input Panel ── */}
        <div className="qr-input-panel">
          <div className="qr-panel-header">
            <h3>Input</h3>
            <span className="qr-char-count">
              {charCount} / {maxChars}
            </span>
          </div>

          <textarea
            className="qr-textarea"
            placeholder="Enter text, URL, or use a preset above..."
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setActivePreset(null)
            }}
            maxLength={maxChars}
          />

          <div className="qr-size-row">
            <label className="qr-size-label" htmlFor="qr-size-select">
              Size
            </label>
            <select
              id="qr-size-select"
              className="qr-size-select"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            >
              {SIZE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="qr-error">{error}</div>}

          <div className="qr-actions">
            <button className="qr-btn qr-btn-generate" onClick={handleGenerate}>
              Generate QR Code
            </button>
            <button className="qr-btn qr-btn-clear" onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>

        {/* ── Right: Preview Panel ── */}
        <div className="qr-preview-panel">
          <div className="qr-panel-header">
            <h3>Preview</h3>
            {generated && (
              <span className="qr-size-badge">{size} x {size}</span>
            )}
          </div>

          <div className="qr-preview-area">
            {generated && qrUrl ? (
              <div className="qr-code-wrapper">
                <img
                  ref={imgRef}
                  src={qrUrl}
                  alt="Generated QR Code"
                  className="qr-code-image"
                  crossOrigin="anonymous"
                  width={size}
                  height={size}
                />
              </div>
            ) : (
              <div className="qr-placeholder">
                <span className="qr-placeholder-icon">QR</span>
                <p>Your QR code will appear here</p>
              </div>
            )}
          </div>

          {generated && qrUrl && (
            <div className="qr-download-actions">
              <button className="qr-btn qr-btn-download" onClick={handleDownload}>
                Download PNG
              </button>
              <button
                className={`qr-btn qr-btn-copy ${copied ? 'qr-btn-copied' : ''}`}
                onClick={handleCopyUrl}
              >
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for download */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ── Tips Section ── */}
      <div className="qr-tips-section">
        <h3>Tips</h3>
        <ul className="qr-tips-list">
          <li>Keep text short for better scan reliability</li>
          <li>Use larger sizes (300+) for printing</li>
          <li>WiFi format: <code>WIFI:T:WPA;S:NetworkName;P:Password;;</code></li>
          <li>Test your QR code with a phone scanner before sharing</li>
        </ul>
      </div>
    </div>
  )
}

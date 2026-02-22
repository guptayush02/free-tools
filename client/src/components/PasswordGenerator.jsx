import { useState, useCallback } from 'react'
import './PasswordGenerator.css'

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

function generateSecurePassword(length, options) {
  let charset = ''
  if (options.uppercase) charset += CHARSETS.uppercase
  if (options.lowercase) charset += CHARSETS.lowercase
  if (options.numbers) charset += CHARSETS.numbers
  if (options.symbols) charset += CHARSETS.symbols

  if (charset.length === 0) return ''

  const array = new Uint32Array(length)
  crypto.getRandomValues(array)

  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length]
  }

  return password
}

function calculateStrength(password, options) {
  if (!password) return { score: 0, label: 'None', color: '#ccc' }

  let score = 0
  const len = password.length

  // Length scoring
  if (len >= 8) score += 1
  if (len >= 12) score += 1
  if (len >= 20) score += 1
  if (len >= 32) score += 1

  // Character variety scoring
  let varietyCount = 0
  if (options.uppercase) varietyCount++
  if (options.lowercase) varietyCount++
  if (options.numbers) varietyCount++
  if (options.symbols) varietyCount++

  score += varietyCount

  // Map score to labels
  if (score <= 2) return { score: 1, label: 'Weak', color: '#e74c3c' }
  if (score <= 4) return { score: 2, label: 'Fair', color: '#e67e22' }
  if (score <= 5) return { score: 3, label: 'Good', color: '#f1c40f' }
  if (score <= 6) return { score: 4, label: 'Strong', color: '#27ae60' }
  return { score: 5, label: 'Very Strong', color: '#1a9850' }
}

export default function PasswordGenerator() {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  })
  const [history, setHistory] = useState([])
  const [copiedIndex, setCopiedIndex] = useState(null)

  const handleGenerate = useCallback(() => {
    const newPassword = generateSecurePassword(length, options)
    if (newPassword) {
      setPassword(newPassword)
      setHistory((prev) => [newPassword, ...prev].slice(0, 5))
    }
  }, [length, options])

  // Generate on mount
  useState(() => {
    const initial = generateSecurePassword(16, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    })
    if (initial) {
      setPassword(initial)
      setHistory([initial])
    }
  })

  const handleOptionChange = (key) => {
    const newOptions = { ...options, [key]: !options[key] }
    // Prevent unchecking all options
    const anyChecked = Object.values(newOptions).some(Boolean)
    if (!anyChecked) return
    setOptions(newOptions)
  }

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  const strength = calculateStrength(password, options)
  const strengthPercent = (strength.score / 5) * 100

  return (
    <div className="pg-container">
      <div className="pg-header">
        <h2>Password Generator</h2>
        <p>Generate strong, secure passwords with customizable options</p>
      </div>

      {/* Password Display */}
      <div className="pg-display-panel">
        <div className="pg-password-display">
          <span className="pg-password-text">
            {password || 'Click Generate'}
          </span>
          <button
            className={`pg-copy-btn ${copiedIndex === 'main' ? 'pg-copied' : ''}`}
            onClick={() => copyToClipboard(password, 'main')}
            title="Copy password"
          >
            {copiedIndex === 'main' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Generate Button */}
      <div className="pg-generate-row">
        <button className="pg-generate-btn" onClick={handleGenerate}>
          Generate Password
        </button>
      </div>

      {/* Controls */}
      <div className="pg-controls-grid">
        {/* Length Slider */}
        <div className="pg-panel pg-length-panel">
          <h3>Password Length</h3>
          <div className="pg-length-row">
            <input
              type="range"
              className="pg-slider"
              min={4}
              max={128}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
            />
            <span className="pg-length-value">{length}</span>
          </div>
        </div>

        {/* Character Options */}
        <div className="pg-panel pg-options-panel">
          <h3>Character Types</h3>
          <div className="pg-options-grid">
            <label className="pg-checkbox-label">
              <input
                type="checkbox"
                checked={options.uppercase}
                onChange={() => handleOptionChange('uppercase')}
              />
              <span className="pg-checkmark" />
              <span className="pg-option-text">
                Uppercase <span className="pg-option-hint">(A-Z)</span>
              </span>
            </label>
            <label className="pg-checkbox-label">
              <input
                type="checkbox"
                checked={options.lowercase}
                onChange={() => handleOptionChange('lowercase')}
              />
              <span className="pg-checkmark" />
              <span className="pg-option-text">
                Lowercase <span className="pg-option-hint">(a-z)</span>
              </span>
            </label>
            <label className="pg-checkbox-label">
              <input
                type="checkbox"
                checked={options.numbers}
                onChange={() => handleOptionChange('numbers')}
              />
              <span className="pg-checkmark" />
              <span className="pg-option-text">
                Numbers <span className="pg-option-hint">(0-9)</span>
              </span>
            </label>
            <label className="pg-checkbox-label">
              <input
                type="checkbox"
                checked={options.symbols}
                onChange={() => handleOptionChange('symbols')}
              />
              <span className="pg-checkmark" />
              <span className="pg-option-text">
                Symbols <span className="pg-option-hint">(!@#$%...)</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Strength Meter */}
      <div className="pg-panel pg-strength-panel">
        <div className="pg-strength-header">
          <h3>Password Strength</h3>
          <span
            className="pg-strength-label"
            style={{ color: strength.color }}
          >
            {strength.label}
          </span>
        </div>
        <div className="pg-strength-track">
          <div
            className="pg-strength-bar"
            style={{
              width: `${strengthPercent}%`,
              backgroundColor: strength.color,
            }}
          />
        </div>
      </div>

      {/* Password History */}
      {history.length > 0 && (
        <div className="pg-panel pg-history-panel">
          <h3>Recent Passwords</h3>
          <ul className="pg-history-list">
            {history.map((pw, i) => (
              <li key={`${i}-${pw}`} className="pg-history-item">
                <span className="pg-history-password">{pw}</span>
                <button
                  className={`pg-copy-btn pg-copy-btn-sm ${copiedIndex === i ? 'pg-copied' : ''}`}
                  onClick={() => copyToClipboard(pw, i)}
                  title="Copy password"
                >
                  {copiedIndex === i ? 'Copied!' : 'Copy'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

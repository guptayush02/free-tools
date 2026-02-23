import { useState, useMemo } from 'react'
import './ColorPicker.css'

/* ── Conversion helpers (no libraries) ── */

function hex2rgb(hex) {
  const h = hex.replace('#', '')
  const full = h.length === 3
    ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    : h
  const num = parseInt(full, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function rgb2hex(r, g, b) {
  const toHex = (v) => {
    const clamped = Math.max(0, Math.min(255, Math.round(v)))
    return clamped.toString(16).padStart(2, '0')
  }
  return '#' + toHex(r) + toHex(g) + toHex(b)
}

function rgb2hsl(r, g, b) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max - min)
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
        break
      case gn:
        h = ((bn - rn) / d + 2) / 6
        break
      case bn:
        h = ((rn - gn) / d + 4) / 6
        break
      default:
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

function hsl2rgb(h, s, l) {
  const sn = s / 100
  const ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let r1 = 0, g1 = 0, b1 = 0

  if (hp >= 0 && hp < 1)      { r1 = c; g1 = x; b1 = 0 }
  else if (hp >= 1 && hp < 2) { r1 = x; g1 = c; b1 = 0 }
  else if (hp >= 2 && hp < 3) { r1 = 0; g1 = c; b1 = x }
  else if (hp >= 3 && hp < 4) { r1 = 0; g1 = x; b1 = c }
  else if (hp >= 4 && hp < 5) { r1 = x; g1 = 0; b1 = c }
  else if (hp >= 5 && hp < 6) { r1 = c; g1 = 0; b1 = x }

  const m = ln - c / 2
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  }
}

/* ── Palette generators ── */

function generateComplementary(h, s, l) {
  const offsets = [0, 180, 90, 270, 30]
  return offsets.map((offset) => {
    const nh = (h + offset) % 360
    const { r, g, b } = hsl2rgb(nh, s, l)
    return rgb2hex(r, g, b)
  })
}

function generateAnalogous(h, s, l) {
  const offsets = [-30, -15, 0, 15, 30]
  return offsets.map((offset) => {
    const nh = (h + offset + 360) % 360
    const { r, g, b } = hsl2rgb(nh, s, l)
    return rgb2hex(r, g, b)
  })
}

/* ── Preset palette ── */

const PRESETS = [
  { name: 'Red', hex: '#e74c3c' },
  { name: 'Tomato', hex: '#ff6347' },
  { name: 'Orange', hex: '#f39c12' },
  { name: 'Sunflower', hex: '#f1c40f' },
  { name: 'Green', hex: '#2ecc71' },
  { name: 'Teal', hex: '#1abc9c' },
  { name: 'Sky Blue', hex: '#3498db' },
  { name: 'Blue', hex: '#2980b9' },
  { name: 'Purple', hex: '#9b59b6' },
  { name: 'Pink', hex: '#e91e63' },
  { name: 'Navy', hex: '#2c3e50' },
  { name: 'Charcoal', hex: '#34495e' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#000000' },
]

/* ── Helpers ── */

function isValidHex(str) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(str)
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

function contrastText(hex) {
  const { r, g, b } = hex2rgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#333333' : '#ffffff'
}

/* ── Component ── */

export default function ColorPicker() {
  const [hex, setHex] = useState('#ff5733')
  const [paletteMode, setPaletteMode] = useState('complementary')
  const [copiedField, setCopiedField] = useState(null)

  const rgb = useMemo(() => hex2rgb(hex), [hex])
  const hsl = useMemo(() => rgb2hsl(rgb.r, rgb.g, rgb.b), [rgb])

  const palette = useMemo(() => {
    if (paletteMode === 'complementary') {
      return generateComplementary(hsl.h, hsl.s, hsl.l)
    }
    return generateAnalogous(hsl.h, hsl.s, hsl.l)
  }, [hsl, paletteMode])

  /* ── Update handlers ── */

  const handleHexChange = (value) => {
    const v = value.startsWith('#') ? value : '#' + value
    if (v.length <= 7) {
      if (isValidHex(v)) {
        setHex(v.toLowerCase())
      } else {
        setHex(v.toLowerCase())
      }
    }
  }

  const handleNativePickerChange = (e) => {
    setHex(e.target.value.toLowerCase())
  }

  const handleRGBChange = (channel, value) => {
    const num = value === '' ? 0 : parseInt(value, 10)
    if (isNaN(num)) return
    const clamped = clamp(num, 0, 255)
    const newR = channel === 'r' ? clamped : rgb.r
    const newG = channel === 'g' ? clamped : rgb.g
    const newB = channel === 'b' ? clamped : rgb.b
    setHex(rgb2hex(newR, newG, newB))
  }

  const handleHSLChange = (channel, value) => {
    const num = value === '' ? 0 : parseInt(value, 10)
    if (isNaN(num)) return
    let newH = channel === 'h' ? clamp(num, 0, 360) : hsl.h
    let newS = channel === 's' ? clamp(num, 0, 100) : hsl.s
    let newL = channel === 'l' ? clamp(num, 0, 100) : hsl.l
    const { r, g, b } = hsl2rgb(newH, newS, newL)
    setHex(rgb2hex(r, g, b))
  }

  const handlePresetClick = (presetHex) => {
    setHex(presetHex.toLowerCase())
  }

  /* ── Copy to clipboard ── */

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 1500)
  }

  const hexString = isValidHex(hex) ? hex : hex
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
  const displayHex = isValidHex(hex) ? hex : hex

  return (
    <div className="cp-container">
      <div className="cp-header">
        <h2>Color Picker & Converter</h2>
        <p>Pick a color, convert between formats, and generate palettes</p>
      </div>

      <div className="cp-main-grid">
        {/* ── Left: Preview + Native Picker ── */}
        <div className="cp-preview-panel">
          <div
            className="cp-color-swatch"
            style={{ backgroundColor: isValidHex(hex) ? hex : '#000000' }}
          >
            <span
              className="cp-swatch-label"
              style={{ color: contrastText(isValidHex(hex) ? hex : '#000000') }}
            >
              {displayHex.toUpperCase()}
            </span>
          </div>

          <div className="cp-native-picker-row">
            <label className="cp-native-label" htmlFor="cp-native">
              Pick a color
            </label>
            <input
              id="cp-native"
              type="color"
              className="cp-native-input"
              value={isValidHex(hex) ? hex : '#000000'}
              onChange={handleNativePickerChange}
            />
          </div>
        </div>

        {/* ── Right: Format fields ── */}
        <div className="cp-formats-panel">
          <h3>Color Values</h3>

          {/* HEX */}
          <div className="cp-format-group">
            <label className="cp-format-label">HEX</label>
            <div className="cp-format-input-row">
              <input
                type="text"
                className="cp-format-input cp-format-input-full"
                value={hex}
                onChange={(e) => handleHexChange(e.target.value)}
                maxLength={7}
                spellCheck={false}
              />
              <button
                className={`cp-copy-btn ${copiedField === 'hex' ? 'cp-copied' : ''}`}
                onClick={() => copyToClipboard(hexString, 'hex')}
                title="Copy HEX"
              >
                {copiedField === 'hex' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* RGB */}
          <div className="cp-format-group">
            <label className="cp-format-label">RGB</label>
            <div className="cp-format-input-row">
              <div className="cp-rgb-inputs">
                <div className="cp-channel">
                  <span className="cp-channel-label">R</span>
                  <input
                    type="number"
                    className="cp-format-input cp-format-input-sm"
                    value={rgb.r}
                    min={0}
                    max={255}
                    onChange={(e) => handleRGBChange('r', e.target.value)}
                  />
                </div>
                <div className="cp-channel">
                  <span className="cp-channel-label">G</span>
                  <input
                    type="number"
                    className="cp-format-input cp-format-input-sm"
                    value={rgb.g}
                    min={0}
                    max={255}
                    onChange={(e) => handleRGBChange('g', e.target.value)}
                  />
                </div>
                <div className="cp-channel">
                  <span className="cp-channel-label">B</span>
                  <input
                    type="number"
                    className="cp-format-input cp-format-input-sm"
                    value={rgb.b}
                    min={0}
                    max={255}
                    onChange={(e) => handleRGBChange('b', e.target.value)}
                  />
                </div>
              </div>
              <button
                className={`cp-copy-btn ${copiedField === 'rgb' ? 'cp-copied' : ''}`}
                onClick={() => copyToClipboard(rgbString, 'rgb')}
                title="Copy RGB"
              >
                {copiedField === 'rgb' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* HSL */}
          <div className="cp-format-group">
            <label className="cp-format-label">HSL</label>
            <div className="cp-format-input-row">
              <div className="cp-rgb-inputs">
                <div className="cp-channel">
                  <span className="cp-channel-label">H</span>
                  <input
                    type="number"
                    className="cp-format-input cp-format-input-sm"
                    value={hsl.h}
                    min={0}
                    max={360}
                    onChange={(e) => handleHSLChange('h', e.target.value)}
                  />
                </div>
                <div className="cp-channel">
                  <span className="cp-channel-label">S</span>
                  <input
                    type="number"
                    className="cp-format-input cp-format-input-sm"
                    value={hsl.s}
                    min={0}
                    max={100}
                    onChange={(e) => handleHSLChange('s', e.target.value)}
                  />
                </div>
                <div className="cp-channel">
                  <span className="cp-channel-label">L</span>
                  <input
                    type="number"
                    className="cp-format-input cp-format-input-sm"
                    value={hsl.l}
                    min={0}
                    max={100}
                    onChange={(e) => handleHSLChange('l', e.target.value)}
                  />
                </div>
              </div>
              <button
                className={`cp-copy-btn ${copiedField === 'hsl' ? 'cp-copied' : ''}`}
                onClick={() => copyToClipboard(hslString, 'hsl')}
                title="Copy HSL"
              >
                {copiedField === 'hsl' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Palette Generator ── */}
      <div className="cp-palette-section">
        <div className="cp-palette-header">
          <h3>Palette Generator</h3>
          <div className="cp-palette-toggle">
            <button
              className={`cp-palette-btn ${paletteMode === 'complementary' ? 'cp-palette-btn-active' : ''}`}
              onClick={() => setPaletteMode('complementary')}
            >
              Complementary
            </button>
            <button
              className={`cp-palette-btn ${paletteMode === 'analogous' ? 'cp-palette-btn-active' : ''}`}
              onClick={() => setPaletteMode('analogous')}
            >
              Analogous
            </button>
          </div>
        </div>
        <div className="cp-palette-colors">
          {palette.map((color, i) => (
            <div
              key={i}
              className="cp-palette-swatch"
              style={{ backgroundColor: color }}
              onClick={() => handlePresetClick(color)}
              title={`Click to select ${color}`}
            >
              <span
                className="cp-palette-swatch-label"
                style={{ color: contrastText(color) }}
              >
                {color.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Preset Colors ── */}
      <div className="cp-presets-section">
        <h3>Preset Colors</h3>
        <div className="cp-presets-grid">
          {PRESETS.map((preset) => (
            <button
              key={preset.hex}
              className="cp-preset-btn"
              style={{ backgroundColor: preset.hex }}
              onClick={() => handlePresetClick(preset.hex)}
              title={`${preset.name} (${preset.hex})`}
            >
              <span
                className="cp-preset-label"
                style={{ color: contrastText(preset.hex) }}
              >
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

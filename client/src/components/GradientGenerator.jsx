import { useState } from 'react'
import './GradientGenerator.css'

const PRESETS = [
  { name: 'Sunset Vibes', type: 'linear', direction: '135deg', stops: [{ color: '#f093fb', position: 0 }, { color: '#f5576c', position: 100 }] },
  { name: 'Ocean Blue', type: 'linear', direction: 'to right', stops: [{ color: '#4facfe', position: 0 }, { color: '#00f2fe', position: 100 }] },
  { name: 'Warm Flame', type: 'linear', direction: '45deg', stops: [{ color: '#ff9a9e', position: 0 }, { color: '#fad0c4', position: 99 }, { color: '#fad0c4', position: 100 }] },
  { name: 'Night Fade', type: 'linear', direction: 'to top', stops: [{ color: '#a18cd1', position: 0 }, { color: '#fbc2eb', position: 100 }] },
  { name: 'Spring Warmth', type: 'linear', direction: 'to right', stops: [{ color: '#fad0c4', position: 0 }, { color: '#ffd1ff', position: 100 }] },
  { name: 'Juicy Peach', type: 'radial', direction: 'circle', stops: [{ color: '#ffecd2', position: 0 }, { color: '#fcb69f', position: 100 }] },
  { name: 'Aqua Splash', type: 'linear', direction: '135deg', stops: [{ color: '#13547a', position: 0 }, { color: '#80d0c7', position: 100 }] },
  { name: 'Deep Space', type: 'linear', direction: 'to right', stops: [{ color: '#000428', position: 0 }, { color: '#004e92', position: 100 }] },
  { name: 'Ripe Mango', type: 'linear', direction: '180deg', stops: [{ color: '#f7971e', position: 0 }, { color: '#ffd200', position: 100 }] },
  { name: 'Berry Smoothie', type: 'linear', direction: '135deg', stops: [{ color: '#8360c3', position: 0 }, { color: '#2ebf91', position: 100 }] },
]

const DIRECTIONS = [
  { value: 'to right', label: 'To Right' },
  { value: 'to left', label: 'To Left' },
  { value: 'to bottom', label: 'To Bottom' },
  { value: 'to top', label: 'To Top' },
  { value: 'to bottom right', label: 'To Bottom Right' },
  { value: 'to bottom left', label: 'To Bottom Left' },
  { value: 'to top right', label: 'To Top Right' },
  { value: 'to top left', label: 'To Top Left' },
  { value: '45deg', label: '45deg' },
  { value: '90deg', label: '90deg' },
  { value: '135deg', label: '135deg' },
  { value: '180deg', label: '180deg' },
  { value: '225deg', label: '225deg' },
  { value: '270deg', label: '270deg' },
  { value: '315deg', label: '315deg' },
]

const RADIAL_SHAPES = [
  { value: 'circle', label: 'Circle' },
  { value: 'ellipse', label: 'Ellipse' },
  { value: 'circle at center', label: 'Circle at Center' },
  { value: 'circle at top', label: 'Circle at Top' },
  { value: 'circle at bottom', label: 'Circle at Bottom' },
  { value: 'circle at left', label: 'Circle at Left' },
  { value: 'circle at right', label: 'Circle at Right' },
  { value: 'ellipse at top left', label: 'Ellipse at Top Left' },
  { value: 'ellipse at bottom right', label: 'Ellipse at Bottom Right' },
]

export default function GradientGenerator() {
  const [gradientType, setGradientType] = useState('linear')
  const [direction, setDirection] = useState('135deg')
  const [radialShape, setRadialShape] = useState('circle')
  const [stops, setStops] = useState([
    { color: '#667eea', position: 0 },
    { color: '#764ba2', position: 100 },
  ])
  const [copied, setCopied] = useState(false)

  const buildGradientCSS = (type, dir, shape, colorStops) => {
    const stopsStr = colorStops.map(s => `${s.color} ${s.position}%`).join(', ')
    if (type === 'linear') {
      return `linear-gradient(${dir}, ${stopsStr})`
    }
    return `radial-gradient(${shape}, ${stopsStr})`
  }

  const gradientCSS = buildGradientCSS(gradientType, direction, radialShape, stops)
  const fullCSS = `background: ${gradientCSS};`

  const updateStopColor = (index, color) => {
    const updated = stops.map((s, i) => i === index ? { ...s, color } : s)
    setStops(updated)
  }

  const updateStopPosition = (index, position) => {
    const updated = stops.map((s, i) => i === index ? { ...s, position: Number(position) } : s)
    setStops(updated)
  }

  const addStop = () => {
    if (stops.length >= 5) return
    const lastPos = stops[stops.length - 1].position
    const secondLastPos = stops[stops.length - 2]?.position ?? 0
    const newPos = Math.min(100, Math.round((lastPos + secondLastPos) / 2))
    setStops([...stops, { color: '#ffffff', position: newPos }])
  }

  const removeStop = (index) => {
    if (stops.length <= 2) return
    setStops(stops.filter((_, i) => i !== index))
  }

  const loadPreset = (preset) => {
    setGradientType(preset.type)
    if (preset.type === 'linear') {
      setDirection(preset.direction)
    } else {
      setRadialShape(preset.direction)
    }
    setStops([...preset.stops])
  }

  const copyCSS = () => {
    navigator.clipboard.writeText(fullCSS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="gradient-gen-container">
      <div className="gradient-gen-header">
        <h2>CSS Gradient Generator</h2>
        <p>Create beautiful CSS gradients visually and copy the code</p>
      </div>

      <div className="gradient-gen-preview-wrapper">
        <div
          className="gradient-gen-preview"
          style={{ background: gradientCSS }}
        />
      </div>

      <div className="gradient-gen-grid">
        <div className="gradient-gen-controls-panel">
          <h3>Gradient Settings</h3>

          <div className="gradient-gen-control-group">
            <label className="gradient-gen-label">Gradient Type</label>
            <div className="gradient-gen-type-toggle">
              <button
                className={`gradient-gen-type-btn ${gradientType === 'linear' ? 'active' : ''}`}
                onClick={() => setGradientType('linear')}
              >
                Linear
              </button>
              <button
                className={`gradient-gen-type-btn ${gradientType === 'radial' ? 'active' : ''}`}
                onClick={() => setGradientType('radial')}
              >
                Radial
              </button>
            </div>
          </div>

          <div className="gradient-gen-control-group">
            <label className="gradient-gen-label">
              {gradientType === 'linear' ? 'Direction' : 'Shape & Position'}
            </label>
            {gradientType === 'linear' ? (
              <select
                className="gradient-gen-select"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
              >
                {DIRECTIONS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            ) : (
              <select
                className="gradient-gen-select"
                value={radialShape}
                onChange={(e) => setRadialShape(e.target.value)}
              >
                {RADIAL_SHAPES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            )}
          </div>

          <div className="gradient-gen-stops-section">
            <div className="gradient-gen-stops-header">
              <label className="gradient-gen-label">Color Stops</label>
              {stops.length < 5 && (
                <button className="gradient-gen-add-stop-btn" onClick={addStop}>
                  + Add Stop
                </button>
              )}
            </div>

            {stops.map((stop, index) => (
              <div key={index} className="gradient-gen-stop-row">
                <div className="gradient-gen-color-picker-wrapper">
                  <input
                    type="color"
                    className="gradient-gen-color-input"
                    value={stop.color}
                    onChange={(e) => updateStopColor(index, e.target.value)}
                  />
                  <span className="gradient-gen-color-hex">{stop.color}</span>
                </div>
                <div className="gradient-gen-slider-wrapper">
                  <input
                    type="range"
                    className="gradient-gen-slider"
                    min="0"
                    max="100"
                    value={stop.position}
                    onChange={(e) => updateStopPosition(index, e.target.value)}
                  />
                  <span className="gradient-gen-slider-value">{stop.position}%</span>
                </div>
                {stops.length > 2 && (
                  <button
                    className="gradient-gen-remove-stop-btn"
                    onClick={() => removeStop(index)}
                    title="Remove color stop"
                  >
                    x
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="gradient-gen-output-panel">
          <h3>Generated CSS</h3>
          <textarea
            className="gradient-gen-code-output"
            readOnly
            value={fullCSS}
          />
          <button className={`gradient-gen-copy-btn ${copied ? 'copied' : ''}`} onClick={copyCSS}>
            {copied ? 'Copied!' : 'Copy CSS'}
          </button>
        </div>
      </div>

      <div className="gradient-gen-presets">
        <h3>Preset Gradients</h3>
        <div className="gradient-gen-presets-grid">
          {PRESETS.map((preset, index) => (
            <button
              key={index}
              className="gradient-gen-preset-card"
              onClick={() => loadPreset(preset)}
              title={preset.name}
            >
              <div
                className="gradient-gen-preset-swatch"
                style={{
                  background: buildGradientCSS(preset.type, preset.type === 'linear' ? preset.direction : preset.direction, preset.direction, preset.stops)
                }}
              />
              <span className="gradient-gen-preset-name">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

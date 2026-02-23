import { useState, useMemo } from 'react'
import './UnitConverter.css'

const categories = {
  Length: {
    base: 'm',
    units: {
      mm: { factor: 0.001, label: 'Millimeter (mm)' },
      cm: { factor: 0.01, label: 'Centimeter (cm)' },
      m: { factor: 1, label: 'Meter (m)' },
      km: { factor: 1000, label: 'Kilometer (km)' },
      inch: { factor: 0.0254, label: 'Inch (in)' },
      foot: { factor: 0.3048, label: 'Foot (ft)' },
      yard: { factor: 0.9144, label: 'Yard (yd)' },
      mile: { factor: 1609.344, label: 'Mile (mi)' },
    },
  },
  Weight: {
    base: 'kg',
    units: {
      mg: { factor: 0.000001, label: 'Milligram (mg)' },
      g: { factor: 0.001, label: 'Gram (g)' },
      kg: { factor: 1, label: 'Kilogram (kg)' },
      lb: { factor: 0.45359237, label: 'Pound (lb)' },
      oz: { factor: 0.028349523125, label: 'Ounce (oz)' },
      ton: { factor: 1000, label: 'Metric Ton (t)' },
    },
  },
  Temperature: {
    base: 'Celsius',
    units: {
      Celsius: { label: 'Celsius (\u00b0C)' },
      Fahrenheit: { label: 'Fahrenheit (\u00b0F)' },
      Kelvin: { label: 'Kelvin (K)' },
    },
  },
  'Data Size': {
    base: 'byte',
    units: {
      bit: { factor: 0.125, label: 'Bit (b)' },
      byte: { factor: 1, label: 'Byte (B)' },
      KB: { factor: 1024, label: 'Kilobyte (KB)' },
      MB: { factor: 1048576, label: 'Megabyte (MB)' },
      GB: { factor: 1073741824, label: 'Gigabyte (GB)' },
      TB: { factor: 1099511627776, label: 'Terabyte (TB)' },
      PB: { factor: 1125899906842624, label: 'Petabyte (PB)' },
    },
  },
  Time: {
    base: 'second',
    units: {
      millisecond: { factor: 0.001, label: 'Millisecond (ms)' },
      second: { factor: 1, label: 'Second (s)' },
      minute: { factor: 60, label: 'Minute (min)' },
      hour: { factor: 3600, label: 'Hour (hr)' },
      day: { factor: 86400, label: 'Day (d)' },
      week: { factor: 604800, label: 'Week (wk)' },
      month: { factor: 2629746, label: 'Month (mo)' },
      year: { factor: 31556952, label: 'Year (yr)' },
    },
  },
  Speed: {
    base: 'm/s',
    units: {
      'm/s': { factor: 1, label: 'Meters/sec (m/s)' },
      'km/h': { factor: 0.277778, label: 'Kilometers/hr (km/h)' },
      mph: { factor: 0.44704, label: 'Miles/hr (mph)' },
      knots: { factor: 0.514444, label: 'Knots (kn)' },
    },
  },
}

function convertTemperature(value, from, to) {
  if (from === to) return value
  let celsius
  if (from === 'Celsius') celsius = value
  else if (from === 'Fahrenheit') celsius = (value - 32) * (5 / 9)
  else celsius = value - 273.15

  if (to === 'Celsius') return celsius
  if (to === 'Fahrenheit') return celsius * (9 / 5) + 32
  return celsius + 273.15
}

function convert(value, from, to, category) {
  if (isNaN(value) || value === '') return ''
  const num = parseFloat(value)
  if (category === 'Temperature') {
    return convertTemperature(num, from, to)
  }
  const cat = categories[category]
  const fromFactor = cat.units[from].factor
  const toFactor = cat.units[to].factor
  return (num * fromFactor) / toFactor
}

function getFormula(from, to, category) {
  if (category === 'Temperature') {
    const formulas = {
      'Celsius->Fahrenheit': '\u00b0F = \u00b0C \u00d7 9/5 + 32',
      'Fahrenheit->Celsius': '\u00b0C = (\u00b0F \u2212 32) \u00d7 5/9',
      'Celsius->Kelvin': 'K = \u00b0C + 273.15',
      'Kelvin->Celsius': '\u00b0C = K \u2212 273.15',
      'Fahrenheit->Kelvin': 'K = (\u00b0F \u2212 32) \u00d7 5/9 + 273.15',
      'Kelvin->Fahrenheit': '\u00b0F = (K \u2212 273.15) \u00d7 9/5 + 32',
    }
    const key = `${from}->${to}`
    return formulas[key] || 'Same unit'
  }
  const cat = categories[category]
  const fromFactor = cat.units[from].factor
  const toFactor = cat.units[to].factor
  const ratio = fromFactor / toFactor
  if (ratio === 1) return 'Same unit'
  return `1 ${from} = ${formatNumber(ratio)} ${to}`
}

function formatNumber(num) {
  if (num === '' || num === undefined || num === null || isNaN(num)) return ''
  const n = typeof num === 'string' ? parseFloat(num) : num
  if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-10 && n !== 0)) {
    return n.toExponential(6)
  }
  if (Number.isInteger(n)) return n.toLocaleString()
  const decimals = Math.abs(n) < 0.001 ? 10 : Math.abs(n) < 1 ? 8 : 6
  const formatted = parseFloat(n.toFixed(decimals))
  return formatted.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

export default function UnitConverter() {
  const [category, setCategory] = useState('Length')
  const [inputValue, setInputValue] = useState('1')
  const [fromUnit, setFromUnit] = useState('m')
  const [toUnit, setToUnit] = useState('km')

  const unitKeys = Object.keys(categories[category].units)

  const handleCategoryChange = (cat) => {
    setCategory(cat)
    const keys = Object.keys(categories[cat].units)
    setFromUnit(keys[0])
    setToUnit(keys.length > 1 ? keys[1] : keys[0])
    setInputValue('1')
  }

  const handleSwap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  const result = useMemo(
    () => convert(inputValue, fromUnit, toUnit, category),
    [inputValue, fromUnit, toUnit, category]
  )

  const formula = useMemo(
    () => getFormula(fromUnit, toUnit, category),
    [fromUnit, toUnit, category]
  )

  const referenceTable = useMemo(() => {
    if (inputValue === '' || isNaN(parseFloat(inputValue))) return []
    return unitKeys.map((unit) => ({
      unit,
      label: categories[category].units[unit].label,
      value: convert(inputValue, fromUnit, unit, category),
    }))
  }, [inputValue, fromUnit, category, unitKeys])

  return (
    <div className="uc-container">
      <div className="uc-header">
        <h2>Unit Converter</h2>
        <p>Convert between units across multiple categories instantly</p>
      </div>

      <div className="uc-categories">
        {Object.keys(categories).map((cat) => (
          <button
            key={cat}
            className={`uc-cat-btn ${category === cat ? 'uc-cat-active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="uc-converter-panel">
        <div className="uc-conversion-row">
          <div className="uc-field">
            <label className="uc-label">From</label>
            <input
              type="number"
              className="uc-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter value"
            />
            <select
              className="uc-select"
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
            >
              {unitKeys.map((u) => (
                <option key={u} value={u}>
                  {categories[category].units[u].label}
                </option>
              ))}
            </select>
          </div>

          <button className="uc-swap-btn" onClick={handleSwap} title="Swap units">
            <svg
              className="uc-swap-icon"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          </button>

          <div className="uc-field">
            <label className="uc-label">To</label>
            <input
              type="text"
              className="uc-input uc-input-result"
              value={formatNumber(result)}
              readOnly
            />
            <select
              className="uc-select"
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
            >
              {unitKeys.map((u) => (
                <option key={u} value={u}>
                  {categories[category].units[u].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="uc-formula">
          <span className="uc-formula-label">Formula:</span>
          <span className="uc-formula-text">{formula}</span>
        </div>
      </div>

      <div className="uc-reference-panel">
        <h3 className="uc-reference-title">
          Quick Reference &mdash; {inputValue || '0'} {categories[category].units[fromUnit].label}
        </h3>
        <div className="uc-reference-table-wrapper">
          <table className="uc-reference-table">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {referenceTable.map((row) => (
                <tr
                  key={row.unit}
                  className={
                    row.unit === toUnit
                      ? 'uc-ref-highlight'
                      : row.unit === fromUnit
                      ? 'uc-ref-source'
                      : ''
                  }
                >
                  <td>{row.label}</td>
                  <td className="uc-ref-value">{formatNumber(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

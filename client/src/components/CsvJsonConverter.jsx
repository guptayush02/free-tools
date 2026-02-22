import { useState } from 'react'
import './CsvJsonConverter.css'

export default function CsvJsonConverter() {
  const [mode, setMode] = useState('csv-to-json')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [delimiter, setDelimiter] = useState(',')
  const [firstRowHeaders, setFirstRowHeaders] = useState(true)
  const [copied, setCopied] = useState(false)

  const DELIMITERS = [
    { label: 'Comma (,)', value: ',' },
    { label: 'Semicolon (;)', value: ';' },
    { label: 'Tab', value: '\t' },
    { label: 'Pipe (|)', value: '|' },
  ]

  const parseCSVRow = (row, delim) => {
    const fields = []
    let current = ''
    let inQuotes = false
    let i = 0

    while (i < row.length) {
      const char = row[i]

      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < row.length && row[i + 1] === '"') {
            current += '"'
            i += 2
            continue
          } else {
            inQuotes = false
            i++
            continue
          }
        } else {
          current += char
          i++
        }
      } else {
        if (char === '"') {
          inQuotes = true
          i++
        } else if (char === delim) {
          fields.push(current)
          current = ''
          i++
        } else {
          current += char
          i++
        }
      }
    }

    fields.push(current)
    return fields
  }

  const parseCSV = (text, delim) => {
    const rows = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < text.length; i++) {
      const char = text[i]

      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < text.length && text[i + 1] === '"') {
            current += '""'
            i++
          } else {
            inQuotes = false
            current += char
          }
        } else {
          current += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
          current += char
        } else if (char === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
          rows.push(current)
          current = ''
          i++
        } else if (char === '\n') {
          rows.push(current)
          current = ''
        } else {
          current += char
        }
      }
    }

    if (current.length > 0) {
      rows.push(current)
    }

    return rows
      .map((row) => parseCSVRow(row, delim))
      .filter((row) => row.some((cell) => cell.trim() !== ''))
  }

  const escapeCSVField = (field, delim) => {
    const str = field == null ? '' : String(field)
    if (
      str.includes(delim) ||
      str.includes('"') ||
      str.includes('\n') ||
      str.includes('\r')
    ) {
      return '"' + str.replace(/"/g, '""') + '"'
    }
    return str
  }

  const convertCsvToJson = () => {
    try {
      setError('')
      setCopied(false)

      if (!input.trim()) {
        setError('Please enter CSV data to convert.')
        setOutput('')
        return
      }

      const rows = parseCSV(input, delimiter)

      if (rows.length === 0) {
        setError('No valid CSV data found.')
        setOutput('')
        return
      }

      let result
      if (firstRowHeaders && rows.length > 1) {
        const headers = rows[0]
        result = rows.slice(1).map((row) => {
          const obj = {}
          headers.forEach((header, idx) => {
            obj[header.trim()] = idx < row.length ? row[idx] : ''
          })
          return obj
        })
      } else if (firstRowHeaders && rows.length === 1) {
        const headers = rows[0]
        result = [
          headers.reduce((obj, header) => {
            obj[header.trim()] = ''
            return obj
          }, {}),
        ]
        setError(
          'Only one row found. Using it as headers with empty values.'
        )
      } else {
        result = rows
      }

      setOutput(JSON.stringify(result, null, 2))
    } catch (e) {
      setError(`CSV parsing error: ${e.message}`)
      setOutput('')
    }
  }

  const convertJsonToCsv = () => {
    try {
      setError('')
      setCopied(false)

      if (!input.trim()) {
        setError('Please enter JSON data to convert.')
        setOutput('')
        return
      }

      const parsed = JSON.parse(input)

      if (!Array.isArray(parsed)) {
        setError('JSON input must be an array of objects or an array of arrays.')
        setOutput('')
        return
      }

      if (parsed.length === 0) {
        setError('The JSON array is empty.')
        setOutput('')
        return
      }

      let csvRows

      if (
        typeof parsed[0] === 'object' &&
        parsed[0] !== null &&
        !Array.isArray(parsed[0])
      ) {
        const allKeys = []
        const keySet = new Set()
        parsed.forEach((item) => {
          if (item && typeof item === 'object') {
            Object.keys(item).forEach((key) => {
              if (!keySet.has(key)) {
                keySet.add(key)
                allKeys.push(key)
              }
            })
          }
        })

        const headerRow = allKeys
          .map((key) => escapeCSVField(key, delimiter))
          .join(delimiter)

        const dataRows = parsed.map((item) =>
          allKeys
            .map((key) => escapeCSVField(item[key], delimiter))
            .join(delimiter)
        )

        csvRows = [headerRow, ...dataRows]
      } else if (Array.isArray(parsed[0])) {
        csvRows = parsed.map((row) =>
          row.map((cell) => escapeCSVField(cell, delimiter)).join(delimiter)
        )
      } else {
        csvRows = parsed.map((item) => escapeCSVField(item, delimiter))
      }

      setOutput(csvRows.join('\n'))
    } catch (e) {
      setError(`JSON parsing error: ${e.message}`)
      setOutput('')
    }
  }

  const handleConvert = () => {
    if (mode === 'csv-to-json') {
      convertCsvToJson()
    } else {
      convertJsonToCsv()
    }
  }

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadOutput = () => {
    if (!output) return
    const isCsvOutput = mode === 'json-to-csv'
    const extension = isCsvOutput ? 'csv' : 'json'
    const mimeType = isCsvOutput ? 'text/csv' : 'application/json'
    const filename = `converted.${extension}`

    const blob = new Blob([output], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
    setCopied(false)
  }

  const switchMode = (newMode) => {
    if (newMode !== mode) {
      setMode(newMode)
      setInput('')
      setOutput('')
      setError('')
      setCopied(false)
    }
  }

  const loadExample = (exampleInput) => {
    setInput(exampleInput)
    setOutput('')
    setError('')
    setCopied(false)
  }

  const csvExamples = [
    {
      label: 'Simple Table',
      data: 'name,age,city\nAlice,30,New York\nBob,25,London\nCharlie,35,Tokyo',
    },
    {
      label: 'Quoted Fields',
      data: 'product,description,price\n"Widget A","A small, handy widget",9.99\n"Widget B","A ""premium"" widget",19.99\n"Widget C","Multi-line\ndescription here",29.99',
    },
    {
      label: 'No Headers',
      data: '1,Alice,alice@example.com\n2,Bob,bob@example.com\n3,Charlie,charlie@example.com',
    },
  ]

  const jsonExamples = [
    {
      label: 'Array of Objects',
      data: JSON.stringify(
        [
          { name: 'Alice', age: 30, city: 'New York' },
          { name: 'Bob', age: 25, city: 'London' },
          { name: 'Charlie', age: 35, city: 'Tokyo' },
        ],
        null,
        2
      ),
    },
    {
      label: 'Array of Arrays',
      data: JSON.stringify(
        [
          ['name', 'age', 'city'],
          ['Alice', 30, 'New York'],
          ['Bob', 25, 'London'],
        ],
        null,
        2
      ),
    },
    {
      label: 'Mixed Data Types',
      data: JSON.stringify(
        [
          { id: 1, active: true, score: 95.5, tags: 'js,react' },
          { id: 2, active: false, score: 88.0, tags: 'python,flask' },
          { id: 3, active: true, score: 72.3, tags: 'go,gin' },
        ],
        null,
        2
      ),
    },
  ]

  const examples = mode === 'csv-to-json' ? csvExamples : jsonExamples

  return (
    <div className="csvjson-container">
      <div className="csvjson-header">
        <h2>CSV / JSON Converter</h2>
        <p>Convert between CSV and JSON formats instantly</p>
      </div>

      <div className="csvjson-mode-toggle">
        <button
          className={`csvjson-mode-btn ${mode === 'csv-to-json' ? 'csvjson-mode-active' : ''}`}
          onClick={() => switchMode('csv-to-json')}
        >
          CSV &rarr; JSON
        </button>
        <button
          className={`csvjson-mode-btn ${mode === 'json-to-csv' ? 'csvjson-mode-active' : ''}`}
          onClick={() => switchMode('json-to-csv')}
        >
          JSON &rarr; CSV
        </button>
      </div>

      <div className="csvjson-options">
        <div className="csvjson-option-group">
          <label className="csvjson-option-label" htmlFor="csvjson-delimiter">
            Delimiter:
          </label>
          <select
            id="csvjson-delimiter"
            className="csvjson-select"
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
          >
            {DELIMITERS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        {mode === 'csv-to-json' && (
          <div className="csvjson-option-group">
            <label className="csvjson-checkbox-label">
              <input
                type="checkbox"
                checked={firstRowHeaders}
                onChange={(e) => setFirstRowHeaders(e.target.checked)}
              />
              First row as headers
            </label>
          </div>
        )}
      </div>

      <div className="csvjson-grid">
        <div className="csvjson-input-panel">
          <div className="csvjson-panel-header">
            <h3>{mode === 'csv-to-json' ? 'CSV Input' : 'JSON Input'}</h3>
            <button
              className="csvjson-icon-btn"
              onClick={clearAll}
              title="Clear all"
            >
              Clear
            </button>
          </div>
          <textarea
            className="csvjson-textarea"
            placeholder={
              mode === 'csv-to-json'
                ? 'Paste your CSV data here...'
                : 'Paste your JSON array here...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="csvjson-controls">
          <button className="csvjson-btn csvjson-btn-convert" onClick={handleConvert}>
            Convert
          </button>
        </div>

        <div className="csvjson-output-panel">
          <div className="csvjson-panel-header">
            <h3>{mode === 'csv-to-json' ? 'JSON Output' : 'CSV Output'}</h3>
            <div className="csvjson-output-actions">
              <button
                className="csvjson-icon-btn"
                onClick={copyOutput}
                title="Copy output"
                disabled={!output}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                className="csvjson-icon-btn"
                onClick={downloadOutput}
                title={
                  mode === 'csv-to-json'
                    ? 'Download as .json'
                    : 'Download as .csv'
                }
                disabled={!output}
              >
                Download
              </button>
            </div>
          </div>
          {error && <div className="csvjson-error">{error}</div>}
          <textarea
            className="csvjson-textarea csvjson-output-textarea"
            placeholder={
              mode === 'csv-to-json'
                ? 'Converted JSON will appear here...'
                : 'Converted CSV will appear here...'
            }
            value={output}
            readOnly
          />
        </div>
      </div>

      <div className="csvjson-examples">
        <h3>Quick Examples</h3>
        <div className="csvjson-examples-grid">
          {examples.map((ex, idx) => (
            <div className="csvjson-example-card" key={idx}>
              <button onClick={() => loadExample(ex.data)}>
                {ex.label}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

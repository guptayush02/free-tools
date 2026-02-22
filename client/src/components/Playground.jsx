import React, { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import './Playground.css'

export default function Playground({ initialSnippetId, user }) {
  const [code, setCode] = useState(`import React from 'react'\nimport { Text, View, StyleSheet } from 'react-native'\n\nexport default function App() {\n  return (\n    <View style={styles.container}>\n      <Text style={styles.text}>Hello from React Native Playground!</Text>\n    </View>\n  )\n}\n\nconst styles = StyleSheet.create({\n  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },\n  text: { color: '#333', fontSize: 18 }\n})`)
  const [language, setLanguage] = useState('javascript')
  const [title, setTitle] = useState('Untitled')
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState('')
  const [execError, setExecError] = useState(null)
  const [snippetId, setSnippetId] = useState(null)
  const iframeRef = useRef(null)

  // If parent provides an initial snippet id (from library), load it
  useEffect(() => {
    if (!initialSnippetId) return
    ;(async () => {
      try {
        const res = await fetch(`/api/playground/snippet/${initialSnippetId}`)
        const json = await res.json()
        if (json && json.code) {
          setCode(json.code)
          setLanguage(json.language || 'javascript')
          setTitle(json.title || 'Untitled')
          setSnippetId(json._id || initialSnippetId)
        }
      } catch (e) {
        console.error('Load snippet error', e)
      }
    })()
  }, [initialSnippetId])

  const saveSnippet = async () => {
    // Require login to save snippets
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login to save snippets')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/playground/snippet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Untitled',
          code,
          language,
          description: `${language} snippet`,
          tags: [language, 'code']
        })
      })
      const json = await res.json()
      if (json.id) {
        setSnippetId(json.id)
        alert(`Saved! Share this URL: ${window.location.origin}/playground/${json.id}`)
      }
    } catch (err) {
      console.error('Save error', err)
      alert('Failed to save snippet')
    } finally {
      setSaving(false)
    }
  }

  const runCode = async () => {
    setRunning(true)
    setOutput('')
    setExecError(null)
    const token = localStorage.getItem('token')

    // Require login to actually run code or open Expo Snack
    if (!token) {
      alert('Please log in to run code or open Expo Snack')
      setRunning(false)
      return
    }

    if (language === 'jsx' || language === 'react-native') {
      // For React Native, open in Expo Snack
      (async () => {
        try {
          await navigator.clipboard.writeText(code)
          window.open('https://snack.expo.dev/', '_blank')
        } catch (e) {
          window.open('https://snack.expo.dev/', '_blank')
        }
      })()
      setRunning(false)
      return
    }

    try {
      const res = await fetch('/api/playground/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      })
      const json = await res.json()

      if (json.error) {
        setExecError(json.error)
      } else if (language === 'html') {
        // Render HTML output in iframe
        setOutput(json.output)
      } else {
        // Show console output
        setOutput(json.output || '(No output)')
      }
    } catch (err) {
      setExecError(err.message)
    } finally {
      setRunning(false)
    }
  }

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output)
      alert('Output copied to clipboard!')
    } catch (e) {
      alert('Failed to copy output')
    }
  }

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(code)
      const formatted = JSON.stringify(parsed, null, 2)
      setCode(formatted)
      setOutput(formatted)
      setExecError(null)
    } catch (e) {
      setExecError(`Invalid JSON: ${e.message}`)
    }
  }

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(code)
      const minified = JSON.stringify(parsed)
      setCode(minified)
      setOutput(minified)
      setExecError(null)
    } catch (e) {
      setExecError(`Invalid JSON: ${e.message}`)
    }
  }

  const languageOptions = [
    { label: 'JavaScript', value: 'javascript' },
    { label: 'Python', value: 'python' },
    { label: 'HTML', value: 'html' },
    { label: 'React Native', value: 'jsx' }
  ]

  const monacoLanguage = {
    'javascript': 'javascript',
    'python': 'python',
    'html': 'html',
    'jsx': 'javascript',
    'json': 'json'
  }[language] || 'javascript'

  return (
    <div className="playground-page">
      <div className="ads-top">Advertisement</div>
      <div className="playground-grid">
        <div className="editor-column">
          <div className="playground-header">
            <div className="header-row">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Snippet title"
                className="title-input"
              />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="language-select"
              >
                {languageOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="buttons">
              {language === 'json' ? (
                <>
                  <button className="btn" onClick={formatJSON}>Format</button>
                  <button className="btn" onClick={minifyJSON}>Minify</button>
                </>
              ) : (
                <button className="btn" onClick={runCode} disabled={running}>
                  {running ? 'Running...' : 'Run'}
                </button>
              )}
              <button className="btn" onClick={saveSnippet} disabled={saving}>
                {saving ? 'Saving...' : 'Save & Share'}
              </button>
            </div>
          </div>
          <Editor
            height="65vh"
            language={monacoLanguage}
            value={code}
            theme="vs-dark"
            onChange={(val) => setCode(val || '')}
            options={{ wordWrap: 'on', minimap: { enabled: false }, scrollBeyondLastLine: false }}
          />
        </div>
        <div className="output-column">
          <div className="output-header">
            <span>Output</span>
            {output && <button className="copy-btn" onClick={copyOutput}>📋 Copy</button>}
          </div>
          <div className="output-panel">
            {execError && (
              <div className="error-box">
                <strong>Error:</strong>
                <pre>{execError}</pre>
              </div>
            )}
            {!execError && language === 'html' && output && (
              <iframe
                ref={iframeRef}
                title="html-output"
                srcDoc={output}
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: '4px' }}
              />
            )}
            {!execError && language !== 'html' && output && (
              <pre className="output-text">{output}</pre>
            )}
            {!output && !execError && (
              <div className="placeholder">Click "Run" to execute code</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

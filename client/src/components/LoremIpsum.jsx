import { useState } from 'react'
import './LoremIpsum.css'

const CLASSIC_LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`

const LOREM_SENTENCES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Curabitur pretium tincidunt lacus nulla gravida orci.',
  'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
  'Maecenas sollicitudin accumsan enim, ut aliquet risus cursus et.',
  'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.',
  'Proin eget tortor risus, vitae tincidunt lacus pharetra vel.',
  'Nulla porttitor accumsan tincidunt, cras ultricies ligula sed magna dictum porta.',
  'Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus.',
  'Donec sollicitudin molestie malesuada, nulla quis lorem ut libero malesuada feugiat.',
  'Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a.',
  'Quisque velit nisi, pretium ut lacinia in, elementum id enim.',
  'Praesent sapien massa, convallis a pellentesque nec, egestas non nisi.',
  'Nulla facilisi morbi tempus iaculis urna id volutpat lacus.',
  'Cras ultricies ligula sed magna dictum porta donec rutrum congue leo eget malesuada.',
  'Vivamus suscipit tortor eget felis porttitor volutpat.',
  'Sed porttitor lectus nibh, quisque velit nisi pretium ut lacinia in.',
  'Pellentesque in ipsum id orci porta dapibus, cras ultricies ligula sed magna dictum porta.',
  'Nunc non blandit massa enim nec dui nunc mattis enim.',
  'Faucibus purus in massa tempor nec feugiat nisl pretium fusce.',
  'Amet porttitor eget dolor morbi non arcu risus quis varius.',
  'Integer feugiat scelerisque varius morbi enim nunc faucibus.',
  'Tortor at risus viverra adipiscing at in tellus integer feugiat.',
  'Gravida neque convallis a cras semper auctor neque vitae tempus.',
  'Erat pellentesque adipiscing commodo elit at imperdiet dui accumsan sit.',
  'Pulvinar elementum integer enim neque volutpat ac tincidunt vitae semper.',
  'Sagittis scelerisque purus semper eget duis at tellus at urna.',
]

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'curabitur', 'pretium',
  'tincidunt', 'lacus', 'gravida', 'orci', 'pellentesque', 'habitant', 'morbi',
  'tristique', 'senectus', 'netus', 'malesuada', 'fames', 'ac', 'turpis',
  'egestas', 'maecenas', 'sollicitudin', 'accumsan', 'aliquet', 'risus', 'cursus',
  'vestibulum', 'ante', 'primis', 'faucibus', 'luctus', 'ultrices', 'posuere',
  'cubilia', 'curae', 'proin', 'eget', 'tortor', 'vitae', 'pharetra', 'vel',
  'porttitor', 'cras', 'ultricies', 'ligula', 'dictum', 'porta', 'vivamus',
  'justo', 'lacinia', 'convallis', 'tellus', 'donec', 'molestie', 'libero',
  'feugiat', 'mauris', 'blandit', 'nibh', 'pulvinar', 'quisque', 'elementum',
  'praesent', 'sapien', 'massa', 'nec', 'sagittis', 'scelerisque', 'purus',
  'semper', 'neque', 'auctor', 'tempus', 'erat', 'imperdiet', 'dui', 'integer',
  'volutpat', 'suscipit', 'porttitor', 'lectus', 'dapibus', 'nunc', 'mattis',
  'fusce', 'arcu', 'varius', 'natoque', 'penatibus', 'magnis', 'dis', 'parturient',
  'montes', 'nascetur', 'ridiculus', 'mus', 'condimentum', 'facilisis', 'ornare',
  'placerat', 'bibendum', 'rutrum', 'congue', 'leo', 'fermentum', 'iaculis',
]

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateWords(count, startClassic) {
  if (startClassic) {
    const classicWords = CLASSIC_LOREM.toLowerCase().replace(/[.,]/g, '').split(/\s+/)
    const result = classicWords.slice(0, Math.min(count, classicWords.length))
    while (result.length < count) {
      result.push(pickRandom(LOREM_WORDS))
    }
    return result.join(' ')
  }
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(pickRandom(LOREM_WORDS))
  }
  return result.join(' ')
}

function generateSentences(count, startClassic) {
  const result = []
  if (startClassic && count > 0) {
    result.push(LOREM_SENTENCES[0])
    for (let i = 1; i < count; i++) {
      result.push(pickRandom(LOREM_SENTENCES))
    }
  } else {
    for (let i = 0; i < count; i++) {
      result.push(pickRandom(LOREM_SENTENCES))
    }
  }
  return result.join(' ')
}

function generateParagraphs(count, startClassic) {
  const paragraphs = []
  for (let i = 0; i < count; i++) {
    const sentenceCount = 4 + Math.floor(Math.random() * 4) // 4-7 sentences per paragraph
    if (i === 0 && startClassic) {
      const rest = []
      rest.push(LOREM_SENTENCES[0])
      for (let j = 1; j < sentenceCount; j++) {
        rest.push(pickRandom(LOREM_SENTENCES))
      }
      paragraphs.push(rest.join(' '))
    } else {
      const sentences = []
      for (let j = 0; j < sentenceCount; j++) {
        sentences.push(pickRandom(LOREM_SENTENCES))
      }
      paragraphs.push(sentences.join(' '))
    }
  }
  return paragraphs.join('\n\n')
}

function countWords(text) {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

export default function LoremIpsum() {
  const [count, setCount] = useState(5)
  const [type, setType] = useState('paragraphs')
  const [startClassic, setStartClassic] = useState(true)
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    let text = ''
    const num = Math.max(1, Math.min(50, count))
    switch (type) {
      case 'words':
        text = generateWords(num, startClassic)
        break
      case 'sentences':
        text = generateSentences(num, startClassic)
        break
      case 'paragraphs':
      default:
        text = generateParagraphs(num, startClassic)
        break
    }
    setOutput(text)
    setCopied(false)
  }

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClear = () => {
    setOutput('')
    setCopied(false)
  }

  const wordCount = countWords(output)

  return (
    <div className="lorem-container">
      <div className="lorem-header">
        <h2>Lorem Ipsum Generator</h2>
        <p>Generate placeholder text for your designs and layouts</p>
      </div>

      <div className="lorem-controls-panel">
        <div className="lorem-controls-row">
          <div className="lorem-control-group">
            <label className="lorem-label" htmlFor="lorem-count">Amount</label>
            <input
              id="lorem-count"
              className="lorem-input"
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </div>

          <div className="lorem-control-group">
            <label className="lorem-label" htmlFor="lorem-type">Type</label>
            <select
              id="lorem-type"
              className="lorem-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="words">Words</option>
              <option value="sentences">Sentences</option>
              <option value="paragraphs">Paragraphs</option>
            </select>
          </div>

          <div className="lorem-control-group lorem-checkbox-group">
            <label className="lorem-checkbox-label">
              <input
                type="checkbox"
                checked={startClassic}
                onChange={(e) => setStartClassic(e.target.checked)}
              />
              <span className="lorem-checkbox-text">Start with "Lorem ipsum dolor sit amet..."</span>
            </label>
          </div>

          <div className="lorem-control-group lorem-btn-group">
            <button className="lorem-btn lorem-btn-generate" onClick={handleGenerate}>
              Generate
            </button>
          </div>
        </div>
      </div>

      <div className="lorem-output-panel">
        <div className="lorem-output-header">
          <h3>Generated Text</h3>
          <div className="lorem-output-actions">
            {output && (
              <span className="lorem-word-count">{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
            )}
            <button
              className={`lorem-action-btn ${copied ? 'lorem-copied' : ''}`}
              onClick={handleCopy}
              title="Copy to clipboard"
              disabled={!output}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              className="lorem-action-btn lorem-clear-btn"
              onClick={handleClear}
              title="Clear output"
              disabled={!output}
            >
              Clear
            </button>
          </div>
        </div>
        <div className="lorem-output-area">
          {output ? (
            output.split('\n\n').map((paragraph, i) => (
              <p key={i} className="lorem-paragraph">{paragraph}</p>
            ))
          ) : (
            <p className="lorem-placeholder">Click "Generate" to create lorem ipsum text...</p>
          )}
        </div>
      </div>

      <div className="lorem-info-section">
        <h3>About Lorem Ipsum</h3>
        <p>
          Lorem Ipsum has been the industry's standard dummy text since the 1500s, when an unknown
          printer took a galley of type and scrambled it to make a type specimen book. It has
          survived five centuries and the leap into electronic typesetting, remaining essentially
          unchanged.
        </p>
      </div>
    </div>
  )
}

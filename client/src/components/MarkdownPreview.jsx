import { useState, useMemo } from 'react'
import './MarkdownPreview.css'

function convertMarkdownToHtml(md) {
  if (!md) return ''

  let html = md

  // Escape HTML to prevent injection
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Code blocks (``` ... ```) - must come before other inline processing
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`
  })

  // Split into lines for block-level processing
  const lines = html.split('\n')
  const result = []
  let inList = false
  let listType = ''
  let inBlockquote = false
  let blockquoteLines = []

  const flushBlockquote = () => {
    if (inBlockquote && blockquoteLines.length > 0) {
      result.push(`<blockquote>${blockquoteLines.join('<br>')}</blockquote>`)
      blockquoteLines = []
      inBlockquote = false
    }
  }

  const flushList = () => {
    if (inList) {
      result.push(listType === 'ul' ? '</ul>' : '</ol>')
      inList = false
      listType = ''
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip lines inside code blocks (already processed)
    if (line.includes('<pre><code') || line.includes('</code></pre>')) {
      flushBlockquote()
      flushList()
      result.push(line)
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim()) || /^___+$/.test(line.trim())) {
      flushBlockquote()
      flushList()
      result.push('<hr>')
      continue
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headerMatch) {
      flushBlockquote()
      flushList()
      const level = headerMatch[1].length
      const text = processInline(headerMatch[2])
      result.push(`<h${level}>${text}</h${level}>`)
      continue
    }

    // Blockquotes
    const blockquoteMatch = line.match(/^&gt;\s?(.*)$/)
    if (blockquoteMatch) {
      flushList()
      inBlockquote = true
      blockquoteLines.push(processInline(blockquoteMatch[1]))
      continue
    } else if (inBlockquote) {
      flushBlockquote()
    }

    // Unordered list
    const ulMatch = line.match(/^[-*+]\s+(.+)$/)
    if (ulMatch) {
      flushBlockquote()
      if (!inList || listType !== 'ul') {
        flushList()
        result.push('<ul>')
        inList = true
        listType = 'ul'
      }
      result.push(`<li>${processInline(ulMatch[1])}</li>`)
      continue
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.+)$/)
    if (olMatch) {
      flushBlockquote()
      if (!inList || listType !== 'ol') {
        flushList()
        result.push('<ol>')
        inList = true
        listType = 'ol'
      }
      result.push(`<li>${processInline(olMatch[1])}</li>`)
      continue
    }

    // If we were in a list but this line is not a list item, close the list
    if (inList) {
      flushList()
    }

    // Empty line
    if (line.trim() === '') {
      flushBlockquote()
      result.push('<br>')
      continue
    }

    // Regular paragraph
    result.push(`<p>${processInline(line)}</p>`)
  }

  flushBlockquote()
  flushList()

  return result.join('\n')
}

function processInline(text) {
  // Images ![alt](url) - must come before links
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:4px;">')

  // Links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Bold **text** or __text__
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/__(.+?)__/g, '<strong>$1</strong>')

  // Italic *text* or _text_
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>')
  text = text.replace(/_(.+?)_/g, '<em>$1</em>')

  // Strikethrough ~~text~~
  text = text.replace(/~~(.+?)~~/g, '<del>$1</del>')

  // Inline code `text`
  text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

  return text
}

const sampleMarkdown = `# Markdown Previewer

## Welcome to the Live Preview!

This is a **Markdown Previewer** built with React. Type on the left and see the rendered output on the right.

### Text Formatting

You can write **bold text**, *italic text*, and ~~strikethrough text~~. You can also combine **bold and *italic*** together.

### Code

Inline code looks like \`const x = 42\` within a sentence.

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return true;
}
\`\`\`

### Lists

Unordered list:

- First item
- Second item
- Third item

Ordered list:

1. Step one
2. Step two
3. Step three

### Links and Images

Visit [OpenAI](https://openai.com) for more info.

![Placeholder](https://via.placeholder.com/300x100.png?text=Markdown+Preview)

### Blockquotes

> "The only way to do great work is to love what you do."
> -- Steve Jobs

### Horizontal Rule

---

That's it! Start editing to see the magic happen.`

export default function MarkdownPreview() {
  const [markdown, setMarkdown] = useState('')

  const htmlOutput = useMemo(() => convertMarkdownToHtml(markdown), [markdown])

  const copyMarkdown = () => {
    if (markdown) {
      navigator.clipboard.writeText(markdown)
      alert('Markdown copied to clipboard!')
    }
  }

  const copyHtml = () => {
    if (htmlOutput) {
      navigator.clipboard.writeText(htmlOutput)
      alert('HTML copied to clipboard!')
    }
  }

  const loadSample = () => {
    setMarkdown(sampleMarkdown)
  }

  const clearAll = () => {
    setMarkdown('')
  }

  return (
    <div className="md-preview-container">
      <div className="md-preview-header">
        <h2>Markdown Previewer</h2>
        <p>Write Markdown on the left, see the rendered preview on the right</p>
      </div>

      <div className="md-preview-toolbar">
        <button className="md-toolbar-btn md-btn-sample" onClick={loadSample}>
          Load Sample
        </button>
        <button className="md-toolbar-btn md-btn-copy-md" onClick={copyMarkdown}>
          Copy Markdown
        </button>
        <button className="md-toolbar-btn md-btn-copy-html" onClick={copyHtml}>
          Copy HTML
        </button>
        <button className="md-toolbar-btn md-btn-clear" onClick={clearAll}>
          Clear
        </button>
      </div>

      <div className="md-preview-grid">
        <div className="md-editor-panel">
          <div className="md-panel-header">
            <h3>Markdown</h3>
            <span className="md-char-count">{markdown.length} chars</span>
          </div>
          <textarea
            className="md-textarea"
            placeholder="Type your Markdown here..."
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
          />
        </div>

        <div className="md-output-panel">
          <div className="md-panel-header">
            <h3>Preview</h3>
            <span className="md-char-count">HTML</span>
          </div>
          <div
            className="md-rendered-preview"
            dangerouslySetInnerHTML={{ __html: htmlOutput || '<p class="md-placeholder-text">Preview will appear here...</p>' }}
          />
        </div>
      </div>
    </div>
  )
}

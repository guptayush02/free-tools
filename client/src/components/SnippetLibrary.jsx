import React, { useEffect, useState } from 'react'
import './SnippetLibrary.css'

export default function SnippetLibrary({ openSnippet }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/playground/snippets')
      .then(r => r.json())
      .then(data => setItems(data || []))
      .catch(err => console.error('Fetch snippets error', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="snippet-library">
      <h3>Snippet Library</h3>
      {loading && <div>Loading...</div>}
      {!loading && items.length === 0 && <div>No snippets yet.</div>}
      <ul>
        {items.map(it => (
          <li key={it.id}>
            <div className="row">
              <div className="meta">
                <strong>{it.title}</strong>
                <div className="date">{new Date(it.createdAt).toLocaleString()}</div>
              </div>
              <div className="actions">
                <button onClick={() => openSnippet(it.id)}>Open</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

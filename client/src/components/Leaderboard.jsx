import React, { useEffect, useState } from 'react'
import './Leaderboard.css'

export default function Leaderboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => setRows(data || []))
      .catch(err => console.error('Leaderboard fetch error', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="leaderboard">
      <h2>🏆 Leaderboard</h2>
      {loading && <div>Loading...</div>}
      {!loading && rows.length === 0 && <div>No scores yet.</div>}
      <ol>
        {rows.map(r => (
          <li key={r.username} className="leader-row">
            <div className="rank">#{r.rank}</div>
            <div className="meta">
              <strong>{r.username}</strong>
              <div className="sub">{r.bio || ''}</div>
            </div>
            <div className="score">{r.score}</div>
          </li>
        ))}
      </ol>
    </div>
  )
}

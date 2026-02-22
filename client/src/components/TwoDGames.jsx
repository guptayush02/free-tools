import React, { useState, useEffect, useRef } from 'react'

// Number Blast Game - Click matching number pairs
export function NumberBlastGame({ onClose, onScore }) {
  const [tiles, setTiles] = useState([])
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    const numbers = Array.from({ length: 8 }, (_, i) => i + 1)
    const shuffled = [...numbers, ...numbers].sort(() => Math.random() - 0.5)
    setTiles(shuffled.map((num, idx) => ({ id: idx, number: num, flipped: false, matched: false })))
    setScore(0)
    setMoves(0)
    setGameOver(false)
  }

  const handleTileClick = (index) => {
    if (tiles[index].matched || moves >= 20) return
    
    const newTiles = [...tiles]
    newTiles[index].flipped = !newTiles[index].flipped
    setTiles(newTiles)

    const flipped = newTiles.filter((t, i) => t.flipped && !t.matched)
    if (flipped.length === 2) {
      setMoves(moves + 1)
      if (flipped[0].number === flipped[1].number) {
        setTimeout(() => {
          const updated = [...newTiles]
          // Find indices and update them
          const indices = []
          for (let i = 0; i < updated.length; i++) {
            if (flipped.some(f => f.id === updated[i].id && !updated[i].matched)) {
              indices.push(i)
            }
          }
          indices.forEach(idx => {
            updated[idx].matched = true
            updated[idx].flipped = false
          })
          setTiles(updated)
          setScore(score + 10)
          if (onScore) onScore(10)
          if (updated.every(t => t.matched)) setGameOver(true)
        }, 500)
      } else {
        setTimeout(() => {
          const updated = [...newTiles]
          updated.forEach((t, idx) => {
            if (flipped.some(f => f.id === t.id)) {
              updated[idx].flipped = false
            }
          })
          setTiles(updated)
        }, 800)
      }
    }
  }

  return (
    <div className="game-2d">
      <div className="game-header-2d">
        <h3>Number Blast - Memory Matching</h3>
        <div className="game-stats">
          <span>Score: {score}</span>
          <span>Moves: {moves}/20</span>
        </div>
      </div>
      <div className="tiles-grid">
        {tiles.map((tile, idx) => (
          <div
            key={tile.id}
            className={`tile ${tile.flipped || tile.matched ? 'flipped' : ''} ${tile.matched ? 'matched' : ''}`}
            onClick={() => handleTileClick(idx)}
          >
            {(tile.flipped || tile.matched) && <span>{tile.number}</span>}
          </div>
        ))}
      </div>
      {gameOver && (
        <div className="game-result">
          <p>🎉 You Won! Score: {score}</p>
          <button onClick={initializeGame}>Play Again</button>
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  )
}

// Math Dodge Game - Solve equations rapidly
export function MathDodgeGame({ onClose, onScore }) {
  const [score, setScore] = useState(0)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(0)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    generateQuestion()
  }, [])

  const generateQuestion = () => {
    const a = Math.floor(Math.random() * 12) + 1
    const b = Math.floor(Math.random() * 12) + 1
    const ops = ['+', '-', '×']
    const op = ops[Math.floor(Math.random() * ops.length)]
    let q = `${a} ${op} ${b} = ?`
    let ans
    if (op === '+') ans = a + b
    else if (op === '-') ans = a - b
    else ans = a * b
    setQuestion(q)
    setAnswer(ans)
    setInputValue('')
  }

  const handleSubmit = () => {
    if (parseInt(inputValue) === answer) {
      setScore(score + 10)
      if (onScore) onScore(10)
      generateQuestion()
    } else {
      alert(`Wrong! The answer was ${answer}`)
      generateQuestion()
    }
  }

  return (
    <div className="game-2d">
      <div className="game-header-2d">
        <h3>Math Dodge - Quick Brain</h3>
        <span>Score: {score}</span>
      </div>
      <div className="math-dodge-container">
        <div className="question-box">{question}</div>
        <input
          type="number"
          placeholder="Your answer..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          autoFocus
        />
        <button className="submit-btn" onClick={handleSubmit} style={{ marginTop: '10px' }}>Submit</button>
        <p>⏱️ Answer quickly to score points!</p>
      </div>
      <button className="close-game-btn" onClick={onClose}>Close Game</button>
    </div>
  )
}

// Merge Master - 2048 style merge game
export function MergeMasterGame({ onClose, onScore }) {
  const [grid, setGrid] = useState([])
  const [score, setScore] = useState(0)
  const gridRef = useRef([])

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    const newGrid = Array(16).fill(0)
    newGrid[Math.floor(Math.random() * 16)] = 2
    let secondPos = Math.floor(Math.random() * 16)
    while (newGrid[secondPos] !== 0) secondPos = Math.floor(Math.random() * 16)
    newGrid[secondPos] = 2
    setGrid(newGrid)
    gridRef.current = newGrid
    setScore(0)
  }

  const compressLine = (line) => line.filter(val => val !== 0)
  
  const mergeLine = (line) => {
    const result = [...line]
    for (let i = 0; i < result.length - 1; i++) {
      if (result[i] !== 0 && result[i] === result[i + 1]) {
        result[i] *= 2
        result.splice(i + 1, 1)
        result.push(0)
      }
    }
    return result
  }

  const move = (direction) => {
    let newGrid = [...gridRef.current]
    let moved = false

    if (direction === 'left' || direction === 'right') {
      for (let row = 0; row < 4; row++) {
        let line = newGrid.slice(row * 4, row * 4 + 4)
        const oldLine = [...line]
        if (direction === 'right') line.reverse()
        line = compressLine(line)
        line = mergeLine(line)
        line = compressLine(line)
        while (line.length < 4) line.push(0)
        if (direction === 'right') line.reverse()
        if (JSON.stringify(line) !== JSON.stringify(oldLine)) moved = true
        newGrid.splice(row * 4, 4, ...line)
      }
    } else {
      for (let col = 0; col < 4; col++) {
        let line = [newGrid[col], newGrid[col + 4], newGrid[col + 8], newGrid[col + 12]]
        const oldLine = [...line]
        if (direction === 'down') line.reverse()
        line = compressLine(line)
        line = mergeLine(line)
        line = compressLine(line)
        while (line.length < 4) line.push(0)
        if (direction === 'down') line.reverse()
        if (JSON.stringify(line) !== JSON.stringify(oldLine)) moved = true
        newGrid[col] = line[0]
        newGrid[col + 4] = line[1]
        newGrid[col + 8] = line[2]
        newGrid[col + 12] = line[3]
      }
    }

    if (moved) {
      const empty = newGrid.map((v, i) => v === 0 ? i : null).filter(i => i !== null)
      if (empty.length > 0) {
        newGrid[empty[Math.floor(Math.random() * empty.length)]] = Math.random() > 0.9 ? 4 : 2
      }
      gridRef.current = newGrid
      setGrid(newGrid)
      // Calculate score from largest tile
      const max = Math.max(...newGrid)
      const newScore = max > score ? max : score
      if (newScore > score && onScore) onScore(newScore - score)
      setScore(newScore)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        move('left')
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        move('right')
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        move('up')
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        move('down')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="game-2d">
      <div className="game-header-2d">
        <h3>Merge Master (2048 Style)</h3>
        <span>Score: {score}</span>
      </div>
      <div className="merge-grid">
        {grid.map((val, idx) => (
          <div key={idx} className={`merge-tile tile-${val}`}>
            {val > 0 && val}
          </div>
        ))}
      </div>
      <p>Use arrow keys to move. Merge same numbers to increase!</p>
      <div className="game-buttons">
        <button onClick={() => initializeGame()}>New Game</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

// Color Catch - Match colors to math operations
export function ColorCatchGame({ onClose, onScore }) {
  const [score, setScore] = useState(0)
  const [rounds, setRounds] = useState(0)
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState([])
  const [correctAnswer, setCorrectAnswer] = useState(0)

  useEffect(() => {
    generateRound()
  }, [])

  const generateRound = () => {
    const a = Math.floor(Math.random() * 20) + 1
    const b = Math.floor(Math.random() * 20) + 1
    const correct = a + b
    const wrong1 = correct + Math.floor(Math.random() * 5) + 1
    const wrong2 = correct - Math.floor(Math.random() * 5) - 1

    const opts = [
      { value: correct, color: '#4caf50', label: correct },
      { value: wrong1, color: '#f44336', label: wrong1 },
      { value: wrong2, color: '#2196f3', label: wrong2 }
    ].sort(() => Math.random() - 0.5)

    setQuestion(`${a} + ${b} = ?`)
    setCorrectAnswer(correct)
    setOptions(opts)
  }

  const handleAnswer = (val) => {
    if (val === correctAnswer) {
      setScore(score + 10)
      if (onScore) onScore(10)
      setRounds(rounds + 1)
      if (rounds < 9) {
        setTimeout(generateRound, 500)
      }
    } else {
      alert('Incorrect!')
    }
  }

  return (
    <div className="game-2d">
      <div className="game-header-2d">
        <h3>Color Catch - Quick Math</h3>
        <div className="game-stats">
          <span>Score: {score}</span>
          <span>Round: {rounds}/10</span>
        </div>
      </div>
      {rounds < 10 ? (
        <div className="color-catch-container">
          <div className="catch-question">{question}</div>
          <div className="catch-buttons">
            {options.map((opt, idx) => (
              <button
                key={idx}
                className="catch-btn"
                style={{ backgroundColor: opt.color }}
                onClick={() => handleAnswer(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="game-result">
          <p>🎉 Game Complete! Final Score: {score}</p>
          <button onClick={() => { setScore(0); setRounds(0); generateRound() }}>Play Again</button>
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  )
}

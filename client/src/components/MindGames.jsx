import React, { useState } from 'react'
import './MindGames.css'
import { NumberBlastGame, MathDodgeGame, MergeMasterGame, ColorCatchGame } from './TwoDGames'

export default function MindGames({ user }) {
  const [selectedGame, setSelectedGame] = useState(null)
  const [gameState, setGameState] = useState({})
  const [score, setScore] = useState(0)
  const [active2DGame, setActive2DGame] = useState(null)

  const games = [
    {
      id: 'fibonacci',
      title: 'Fibonacci Sequence',
      description: 'Generate the nth Fibonacci number',
      difficulty: 'Easy',
      challenge: 'What is the 10th Fibonacci number?',
      answer: 55,
      hint: 'Each number is the sum of the previous two (1, 1, 2, 3, 5, 8, 13, 21, 34, 55)'
    },
    {
      id: 'palindrome',
      title: 'Palindrome Checker',
      description: 'Determine if a string reads the same forwards and backwards',
      difficulty: 'Easy',
      challenge: 'Is "racecar" a palindrome? (yes/no)',
      answer: 'yes',
      hint: 'Compare the string with its reverse'
    },
    {
      id: 'factorial',
      title: 'Factorial Calculator',
      description: 'Calculate the factorial of a number (n!)',
      difficulty: 'Easy',
      challenge: 'What is 5! (5 factorial)?',
      answer: 120,
      hint: '5! = 5 × 4 × 3 × 2 × 1'
    },
    {
      id: 'prime',
      title: 'Prime Number Checker',
      description: 'Check if a number is prime',
      difficulty: 'Medium',
      challenge: 'Is 17 a prime number? (yes/no)',
      answer: 'yes',
      hint: 'A prime number is only divisible by 1 and itself'
    },
    {
      id: 'reverse',
      title: 'String Reversal',
      description: 'Reverse a given string',
      difficulty: 'Easy',
      challenge: 'Reverse "hello". What is the result?',
      answer: 'olleh',
      hint: 'Reverse the order of characters'
    },
    {
      id: 'evenodd',
      title: 'Even or Odd',
      description: 'Determine if a number is even or odd',
      difficulty: 'Easy',
      challenge: 'Is 42 even or odd?',
      answer: 'even',
      hint: 'Use modulo (%) operator to check divisibility by 2'
    },
    {
      id: 'anagram',
      title: 'Anagram Checker',
      description: 'Check if two words are anagrams',
      difficulty: 'Medium',
      challenge: 'Are "listen" and "silent" anagrams? (yes/no)',
      answer: 'yes',
      hint: 'Sort the letters of both words and compare'
    },
    {
      id: 'vowels',
      title: 'Count Vowels',
      description: 'Count the number of vowels in a string',
      difficulty: 'Easy',
      challenge: 'How many vowels are in "programming"?',
      answer: 3,
      hint: 'Count: a, e, i, o, u (case-insensitive)'
    }
  ]

  const twoDeGames = [
    {
      id: 'number-blast',
      title: '💥 Number Blast',
      description: 'Memory matching game - flip tiles to find pairs',
      difficulty: 'Easy',
      type: '2d'
    },
    {
      id: 'math-dodge',
      title: '⚡ Math Dodge',
      description: 'Quick brain - solve equations rapidly',
      difficulty: 'Medium',
      type: '2d'
    },
    {
      id: 'merge-master',
      title: '🎮 Merge Master',
      description: '2048 style - merge numbers for high scores',
      difficulty: 'Hard',
      type: '2d'
    },
    {
      id: 'color-catch',
      title: '🎨 Color Catch',
      description: 'Quick math - tap the right colored answer',
      difficulty: 'Medium',
      type: '2d'
    }
  ]

  const handleGameSelect = (game) => {
    if (game.type === '2d') {
      setActive2DGame(game.id)
    } else {
      setSelectedGame(game)
      setGameState({ answer: '', submitted: false, correct: null })
    }
  }

  const reportScore = async (points) => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      await fetch('/api/games/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ points }),
      })
    } catch (e) {
      console.error('Report score failed', e)
    }
  }

  const handleAnswerSubmit = () => {
    const userAnswer = gameState.answer
    const isCorrect = String(userAnswer).toLowerCase().trim() === String(selectedGame.answer).toLowerCase().trim()
    
    setGameState({ ...gameState, submitted: true, correct: isCorrect })
    
    if (isCorrect) {
      setScore(score + 10)
      if (user) reportScore(10)
      setTimeout(() => {
        handleGameSelect(null)
      }, 2000)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAnswerSubmit()
    }
  }

  return (
    <div className="mind-games">
      <div className="games-header">
        <h2>🧠 Mind Games for Coders</h2>
        <div className="score-board">
          <span>Score: <strong>{score}</strong></span>
        </div>
      </div>

      {active2DGame === 'number-blast' && <NumberBlastGame onClose={() => setActive2DGame(null)} onScore={(p) => { setScore(s => s + p); if (user) reportScore(p) }} />}
      {active2DGame === 'math-dodge' && <MathDodgeGame onClose={() => setActive2DGame(null)} onScore={(p) => { setScore(s => s + p); if (user) reportScore(p) }} />}
      {active2DGame === 'merge-master' && <MergeMasterGame onClose={() => setActive2DGame(null)} onScore={(p) => { setScore(s => s + p); if (user) reportScore(p) }} />}
      {active2DGame === 'color-catch' && <ColorCatchGame onClose={() => setActive2DGame(null)} onScore={(p) => { setScore(s => s + p); if (user) reportScore(p) }} />}

      {!active2DGame && !selectedGame ? (
        <div className="games-grid-container">
          <div className="games-section">
            <h3>🧩 Brain Teasers</h3>
            <div className="games-grid">
              {games.map(game => (
                <div key={game.id} className="game-card" onClick={() => handleGameSelect(game)}>
                  <div className="difficulty-badge">{game.difficulty}</div>
                  <h3>{game.title}</h3>
                  <p>{game.description}</p>
                  <button className="play-btn">Play Game</button>
                </div>
              ))}
            </div>
          </div>

          <div className="games-section">
            <h3>🎮 2D Games</h3>
            <div className="games-grid">
              {twoDeGames.map(game => (
                <div key={game.id} className="game-card" onClick={() => handleGameSelect(game)}>
                  <div className="difficulty-badge">{game.difficulty}</div>
                  <h3>{game.title}</h3>
                  <p>{game.description}</p>
                  <button className="play-btn">Play Game</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !active2DGame && selectedGame ? (
        <div className="game-arena">
          <button className="back-btn" onClick={() => setSelectedGame(null)}>← Back to Games</button>
          
          <div className="game-container">
            <h2>{selectedGame.title}</h2>
            <div className="challenge-box">
              <p className="challenge">{selectedGame.challenge}</p>
            </div>

            {gameState.submitted ? (
              <div className={`result ${gameState.correct ? 'correct' : 'incorrect'}`}>
                {gameState.correct ? (
                  <>
                    <div className="result-icon">✅</div>
                    <p>Correct! You earned 10 points!</p>
                  </>
                ) : (
                  <>
                    <div className="result-icon">❌</div>
                    <p>Incorrect. The answer was: <strong>{selectedGame.answer}</strong></p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="hint-box">
                  <strong>💡 Hint:</strong> {selectedGame.hint}
                </div>

                <div className="input-section">
                  <input
                    type="text"
                    value={gameState.answer}
                    onChange={(e) => setGameState({ ...gameState, answer: e.target.value })}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your answer..."
                    className="answer-input"
                    autoFocus
                  />
                  <button className="submit-btn" onClick={handleAnswerSubmit}>
                    Submit Answer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

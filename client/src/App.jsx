import { useState, useEffect } from 'react'
import axios from 'axios'
import ResumeUpload from './components/ResumeUpload'
import ResultsDisplay from './components/ResultsDisplay'
import Playground from './components/Playground'
import OtherFeature from './components/OtherFeature'
import SnippetLibrary from './components/SnippetLibrary'
import MindGames from './components/MindGames'
import Auth from './components/Auth'
import JSONFormatter from './components/JSONFormatter'
import WordCounter from './components/WordCounter'
import Base64Tool from './components/Base64Tool'
import UrlEncoder from './components/UrlEncoder'
import LoremIpsum from './components/LoremIpsum'
import ColorPicker from './components/ColorPicker'
import MarkdownPreview from './components/MarkdownPreview'
import RegexTester from './components/RegexTester'
import GradientGenerator from './components/GradientGenerator'
import DiffChecker from './components/DiffChecker'
import QRCodeGenerator from './components/QRCodeGenerator'
import ImageCompressor from './components/ImageCompressor'
import PasswordGenerator from './components/PasswordGenerator'
import UnitConverter from './components/UnitConverter'
import PomodoroTimer from './components/PomodoroTimer'
import CsvJsonConverter from './components/CsvJsonConverter'
import StoryBuilder from './components/StoryBuilder'
import Leaderboard from './components/Leaderboard'
import './App.css'

const API_URL = '/api'

const TOOLS = [
  { id: 'ats', label: 'ATS Optimizer' },
  { id: 'playground', label: 'Code Playground' },
  { id: 'library', label: 'Snippet Library' },
  { id: 'json', label: 'JSON Formatter' },
  { id: 'wordcounter', label: 'Word Counter' },
  { id: 'base64', label: 'Base64 Tool' },
  { id: 'url', label: 'URL Encoder' },
  { id: 'lorem', label: 'Lorem Ipsum' },
  { id: 'color', label: 'Color Picker' },
  { id: 'markdown', label: 'Markdown Preview' },
  { id: 'regex', label: 'Regex Tester' },
  { id: 'gradient', label: 'Gradient Generator' },
  { id: 'diff', label: 'Diff Checker' },
  { id: 'qr', label: 'QR Code Generator' },
  { id: 'image', label: 'Image Compressor' },
  { id: 'password', label: 'Password Generator' },
  { id: 'units', label: 'Unit Converter' },
  { id: 'pomodoro', label: 'Pomodoro Timer' },
  { id: 'csv', label: 'CSV/JSON Converter' },
  { id: 'stories', label: 'Story Builder' },
  { id: 'games', label: 'Mind Games' },
]

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [resumeData, setResumeData] = useState(null)
  const [appLoading, setAppLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedSnippetId, setSelectedSnippetId] = useState(null)
  const [activeTab, setActiveTab] = useState('ats')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const handleAuthSuccess = (userData) => {
    setUser(userData)
    setActiveTab('ats')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setResumeData(null)
    setActiveTab('ats')
  }

  const handleUpload = async (file) => {
    if (!user) {
      setError('Please login to upload resumes')
      setShowAuth(true)
      return
    }

    setAppLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('resume', file)

    try {
      const response = await axios.post(`${API_URL}/resume/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setResumeData(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload resume')
    } finally {
      setAppLoading(false)
    }
  }

  const handleOptimize = async () => {
    if (!resumeData?.id) return

    setAppLoading(true)
    setError('')

    try {
      const response = await axios.post(`${API_URL}/resume/${resumeData.id}/optimize`)
      setResumeData(prev => ({
        ...prev,
        optimizedResume: response.data.optimizedResume
      }))
    } catch (err) {
      setError('Failed to optimize resume')
    } finally {
      setAppLoading(false)
    }
  }

  const openSnippetInPlayground = (id) => {
    setSelectedSnippetId(id)
    setActiveTab('playground')
  }

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="brand">
          <img src="assets/images/logo.jpeg" alt="Free Tools Logo" style={{height: 40, width: 40}} />
          <div>
            <h1>Free Tools</h1>
            <div className="subtitle">Developer & Productivity Tools</div>
          </div>
        </div>
        <nav className="top-tabs">
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              className={`tab-btn ${activeTab === tool.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tool.id)}
            >
              {tool.label}
            </button>
          ))}
        </nav>
        <div className="user-info">
          {user ? (
            <>
              <span className="username" onClick={() => setActiveTab('leaderboard')} style={{cursor: 'pointer'}}>{user.username}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`} onClick={() => setActiveTab('leaderboard')}>Board</button>
              <button className="login-btn" onClick={() => setShowAuth(true)}>Login / Sign up</button>
            </>
          )}
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'ats' && (
          <div>
            <div className="ats-header">
              <h2>ATS Resume Optimizer</h2>
              <p>Optimize your resume for Applicant Tracking Systems</p>
            </div>
            {!resumeData ? (
              <ResumeUpload onUpload={handleUpload} loading={appLoading} error={error} />
            ) : (
              <ResultsDisplay
                data={resumeData}
                onOptimize={handleOptimize}
                loading={appLoading}
                error={error}
              />
            )}
          </div>
        )}

        {activeTab === 'playground' && <Playground initialSnippetId={selectedSnippetId} user={user} />}
        {activeTab === 'json' && <JSONFormatter />}
        {activeTab === 'wordcounter' && <WordCounter />}
        {activeTab === 'base64' && <Base64Tool />}
        {activeTab === 'url' && <UrlEncoder />}
        {activeTab === 'lorem' && <LoremIpsum />}
        {activeTab === 'color' && <ColorPicker />}
        {activeTab === 'markdown' && <MarkdownPreview />}
        {activeTab === 'regex' && <RegexTester />}
        {activeTab === 'gradient' && <GradientGenerator />}
        {activeTab === 'diff' && <DiffChecker />}
        {activeTab === 'qr' && <QRCodeGenerator />}
        {activeTab === 'image' && <ImageCompressor />}
        {activeTab === 'password' && <PasswordGenerator />}
        {activeTab === 'units' && <UnitConverter />}
        {activeTab === 'pomodoro' && <PomodoroTimer />}
        {activeTab === 'csv' && <CsvJsonConverter />}
        {activeTab === 'stories' && <StoryBuilder user={user} />}
        {activeTab === 'games' && <MindGames user={user} />}
        {activeTab === 'leaderboard' && <Leaderboard user={user} />}

        {activeTab === 'library' && (
          <div>
            <OtherFeature openSnippetInPlayground={openSnippetInPlayground} />
            <SnippetLibrary openSnippet={openSnippetInPlayground} />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2026 Free Tools (Sutra Group). All rights reserved.</p>
      </footer>
      {showAuth && (
        <Auth
          onAuthSuccess={(userData) => {
            handleAuthSuccess(userData)
            setShowAuth(false)
          }}
        />
      )}
    </div>
  )
}

export default App

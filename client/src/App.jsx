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
import StoryBuilder from './components/StoryBuilder'
import Leaderboard from './components/Leaderboard'
// import Leaderboard from './components/Leaderboard'
import './App.css'

const API_URL = '/api'

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
    // Check if user is logged in
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
    // Require login to upload resume
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

  // Removed early return so header and public components are visible to unauthenticated users.

  return (
    <div className="app-container">
      <header className="header">
        <div className="brand">
          {/* <div className="logo" /> */}
          <img src="assets/images/logo.jpeg" alt="Free Tools Logo" style={{height: 40, width: 40}} />
          <div>
            <h1>Free Tools</h1>
            <div className="subtitle">Resume, Playground & Stories</div>
          </div>
        </div>
        <nav className="top-tabs">
          <button className={`tab-btn ${activeTab === 'ats' ? 'active' : ''}`} onClick={() => setActiveTab('ats')}>ATS Optimizer</button>
          <button className={`tab-btn ${activeTab === 'playground' ? 'active' : ''}`} onClick={() => setActiveTab('playground')}>Code Playground</button>
          <button className={`tab-btn ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>Snippet Library</button>
          <button className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`} onClick={() => setActiveTab('json')}>JSON Formatter</button>
          <button className={`tab-btn ${activeTab === 'stories' ? 'active' : ''}`} onClick={() => setActiveTab('stories')}>Story Builder</button>
          <button className={`tab-btn ${activeTab === 'games' ? 'active' : ''}`} onClick={() => setActiveTab('games')}>Mind Games</button>
          {/* <button className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`} onClick={() => setActiveTab('leaderboard')}>{user.username}</button> */}
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

        {activeTab === 'playground' && (
          <div>
            <Playground initialSnippetId={selectedSnippetId} user={user} />
          </div>
        )}

        {activeTab === 'json' && (
          <div>
            <JSONFormatter />
          </div>
        )}

        {activeTab === 'stories' && (
          <div>
            <StoryBuilder user={user} />
          </div>
        )}

        {activeTab === 'games' && (
          <div>
            <MindGames user={user} />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div>
            <Leaderboard user={user} />
          </div>
        )}

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

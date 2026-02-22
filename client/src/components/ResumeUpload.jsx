import { useState } from 'react'
import './ResumeUpload.css'

export default function ResumeUpload({ onUpload, loading, error }) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = (file) => {
    if (file.type === 'text/plain' || file.type === 'application/pdf') {
      onUpload(file)
    } else {
      alert('Please upload a PDF or TXT file')
    }
  }

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Upload Your Resume</h2>
        
        <div
          className={`upload-area ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="upload-content">
            <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p className="upload-text">
              <strong>Drag and drop your resume here</strong>
            </p>
            <p className="upload-subtext">or click to browse (PDF or TXT)</p>
          </div>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleInputChange}
            disabled={loading}
            className="file-input"
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Analyzing your resume...</p>
          </div>
        )}
      </div>

      <div className="info-card">
        <h3>How it works:</h3>
        <ol>
          <li>Upload your resume in PDF or TXT format</li>
          <li>Get your ATS compatibility score (0-100)</li>
          <li>View suggestions to improve your resume</li>
          <li>Get AI-optimized version with better keywords</li>
          <li>Share your optimized resume</li>
        </ol>
      </div>
    </div>
  )
}

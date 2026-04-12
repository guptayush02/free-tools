import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Auth.css'

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // 'idle' | 'email_sent' | 'verified' | 'verify_failed' | 'resent'
  const [status, setStatus] = useState('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resentSuccess, setResentSuccess] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // Handle ?verified=true / ?verify_token=... redirects from the verification link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const verifyToken = params.get('verify_token')
    if (verifyToken) {
      // Call the backend verify endpoint
      axios.get(`/api/auth/verify-email?token=${verifyToken}`)
        .then(() => {
          // Server redirects, so this won't normally run — but handle the case
          // where the server returns JSON instead of redirecting
          setStatus('verified')
          setStatusMessage('✅ Email verified! You can now sign in.')
        })
        .catch(() => {
          setStatus('verify_failed')
          setStatusMessage('❌ Verification link is invalid or has expired.')
        })
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

    const verified = params.get('verified')
    if (verified === 'true') {
      setStatus('verified')
      setStatusMessage('✅ Email verified! You can now sign in.')
      setIsLogin(true)
      window.history.replaceState({}, '', window.location.pathname)
      return
    }
    if (verified === 'false') {
      const reason = params.get('reason') || 'unknown'
      const messages = {
        invalid_token: '❌ Verification link is invalid.',
        expired_token: '❌ Verification link has expired. Please request a new one.',
        missing_token: '❌ No verification token found in the link.',
        server_error: '❌ A server error occurred during verification. Please try again.',
      }
      setStatus('verify_failed')
      setStatusMessage(messages[reason] || '❌ Email verification failed.')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const response = await axios.post('/api/auth/login', {
          email: formData.email,
          password: formData.password,
        })
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        onAuthSuccess(response.data.user)
      } else {
        await axios.post('/api/auth/signup', formData)
        setStatus('email_sent')
        setUnverifiedEmail(formData.email)
      }
    } catch (err) {
      const data = err.response?.data
      if (data?.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(data.email || formData.email)
        setError('Your email address is not verified yet.')
      } else {
        setError(data?.error || 'An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return
    setResendLoading(true)
    setError('')
    try {
      await axios.post('/api/auth/resend-verification', { email: unverifiedEmail })
      setResentSuccess(true)
      setStatusMessage(`📧 Verification email resent to ${unverifiedEmail}. Check your inbox.`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const resetToLogin = () => {
    setIsLogin(true)
    setStatus('idle')
    setError('')
    setUnverifiedEmail('')
    setFormData({ username: '', email: '', password: '', confirmPassword: '' })
  }

  // ── Email sent screen (shown after successful signup) ──────────────────────
  if (status === 'email_sent') {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <img src="assets/images/logo.jpeg" alt="Free Tools Logo" style={{ height: 90, width: 90, maxWidth: '25vw', maxHeight: '25vw' }} />
            <h1>Free Tools</h1>
          </div>
          <div className="auth-verify-screen">
            <div className="auth-verify-icon">📧</div>
            <h2>Check your email</h2>
            <p>
              We sent a verification link to <strong>{unverifiedEmail}</strong>.
              Click the link in that email to activate your account.
            </p>
            <p className="auth-verify-note">Didn't receive it? Check your spam folder, or</p>
            <button
              className="auth-button"
              onClick={handleResendVerification}
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending…' : 'Resend verification email'}
            </button>
            {error && <div className="auth-error" style={{ marginTop: 12 }}>{error}</div>}
            {resentSuccess && <div className="auth-success" style={{ marginTop: 12 }}>{statusMessage}</div>}
            <button type="button" className="auth-link" style={{ marginTop: 16, display: 'block' }} onClick={resetToLogin}>
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <img src="assets/images/logo.jpeg" alt="Free Tools Logo" style={{ height: 90, width: 90, maxWidth: '25vw', maxHeight: '25vw' }} />
          <h1>Free Tools</h1>
          <p>{isLogin ? 'Welcome Back!' : 'Join Our Community'}</p>
        </div>

        {/* Verification success / failure banners */}
        {status === 'verified' && (
          <div className="auth-success">{statusMessage}</div>
        )}
        {status === 'verify_failed' && (
          <div className="auth-error">{statusMessage}</div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          {/* Resend verification button when login is blocked */}
          {error && unverifiedEmail && (
            <div className="auth-unverified-block">
              <button
                type="button"
                className="auth-button auth-button-secondary"
                onClick={handleResendVerification}
                disabled={resendLoading}
              >
                {resendLoading ? 'Sending…' : 'Resend verification email'}
              </button>
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleInputChange}
                required={!isLogin}
                minLength="3"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength="6"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required={!isLogin}
              />
            </div>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Processing…' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              className="auth-link"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setStatus('idle')
                setUnverifiedEmail('')
                setFormData({ username: '', email: '', password: '', confirmPassword: '' })
              }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        <div className="auth-demo">
          <p>Demo Credentials:</p>
          <code>Email: demo@example.com | Password: demo123</code>
        </div>
      </div>
    </div>
  )
}

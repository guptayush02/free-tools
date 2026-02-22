import React, { useState } from 'react'
import axios from 'axios'
import './Auth.css'

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData

      const response = await axios.post(`${endpoint}`, payload)

      // Store token and user data
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      onAuthSuccess(response.data.user)
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <img src="assets/images/logo.jpeg" alt="Free Tools Logo" style={{height: 90, width: 90}} />
          <h1>Free Tools</h1>
          <p>{isLogin ? 'Welcome Back!' : 'Join Our Community'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

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
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
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
                setFormData({
                  username: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                })
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

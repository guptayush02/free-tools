import { useState, useEffect, useRef, useCallback } from 'react'
import './PomodoroTimer.css'

/* ── Default durations (in minutes) ── */
const DEFAULT_FOCUS = 25
const DEFAULT_SHORT_BREAK = 5
const DEFAULT_LONG_BREAK = 15
const LONG_BREAK_INTERVAL = 4 // long break every N focus sessions

/* ── Modes ── */
const MODES = {
  focus: { label: 'Focus', key: 'focus' },
  shortBreak: { label: 'Short Break', key: 'shortBreak' },
  longBreak: { label: 'Long Break', key: 'longBreak' },
}

/* ── Beep via AudioContext ── */
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)

    gain.gain.setValueAtTime(0.5, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.8)

    // second tone
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1100, ctx.currentTime + 0.3)
    gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.3)
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.1)
    osc2.start(ctx.currentTime + 0.3)
    osc2.stop(ctx.currentTime + 1.1)

    setTimeout(() => ctx.close(), 2000)
  } catch {
    // AudioContext unavailable — silently ignore
  }
}

/* ── Format seconds → MM:SS ── */
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/* ── Component ── */
export default function PomodoroTimer() {
  /* settings */
  const [settings, setSettings] = useState({
    focus: DEFAULT_FOCUS,
    shortBreak: DEFAULT_SHORT_BREAK,
    longBreak: DEFAULT_LONG_BREAK,
  })
  const [showSettings, setShowSettings] = useState(false)
  const [tempSettings, setTempSettings] = useState({ ...settings })

  /* timer state */
  const [mode, setMode] = useState('focus')
  const [secondsLeft, setSecondsLeft] = useState(settings.focus * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)

  /* refs */
  const intervalRef = useRef(null)
  const secondsLeftRef = useRef(secondsLeft)
  const modeRef = useRef(mode)

  /* keep refs in sync */
  useEffect(() => {
    secondsLeftRef.current = secondsLeft
  }, [secondsLeft])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  /* total duration for current mode (in seconds) */
  const totalDuration = settings[mode] * 60

  /* ── Derived progress (0 → 1) ── */
  const progress = 1 - secondsLeft / totalDuration

  /* SVG circle constants */
  const RADIUS = 115
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS

  /* ── Switch mode helper ── */
  const switchMode = useCallback(
    (newMode) => {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      setIsRunning(false)
      setMode(newMode)
      setSecondsLeft(settings[newMode] * 60)
    },
    [settings]
  )

  /* ── Handle timer completion ── */
  const handleTimerEnd = useCallback(() => {
    playBeep()

    if (modeRef.current === 'focus') {
      const newCount = completedSessions + 1
      setCompletedSessions(newCount)

      // auto-switch to break
      if (newCount % LONG_BREAK_INTERVAL === 0) {
        switchMode('longBreak')
      } else {
        switchMode('shortBreak')
      }
    } else {
      // break ended → back to focus
      switchMode('focus')
    }
  }, [completedSessions, switchMode])

  /* ── Countdown interval ── */
  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      if (secondsLeftRef.current <= 1) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        setSecondsLeft(0)
        setIsRunning(false)
        handleTimerEnd()
        return
      }
      setSecondsLeft((prev) => prev - 1)
    }, 1000)

    return () => {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [isRunning, handleTimerEnd])

  /* ── Controls ── */
  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setIsRunning(false)
    setSecondsLeft(settings[mode] * 60)
  }

  /* ── Settings ── */
  const openSettings = () => {
    setTempSettings({ ...settings })
    setShowSettings(true)
  }

  const saveSettings = () => {
    const clamped = {
      focus: Math.max(1, Math.min(120, Number(tempSettings.focus) || DEFAULT_FOCUS)),
      shortBreak: Math.max(1, Math.min(60, Number(tempSettings.shortBreak) || DEFAULT_SHORT_BREAK)),
      longBreak: Math.max(1, Math.min(60, Number(tempSettings.longBreak) || DEFAULT_LONG_BREAK)),
    }
    setSettings(clamped)

    // reset current timer to new duration if not running
    if (!isRunning) {
      setSecondsLeft(clamped[mode] * 60)
    }
    setShowSettings(false)
  }

  const cancelSettings = () => setShowSettings(false)

  /* ── Session dots (max 8 visible) ── */
  const maxDots = 8
  const dots = Math.min(completedSessions, maxDots)

  /* ── Mode-specific class ── */
  const modeClass =
    mode === 'focus' ? 'pomo-focus' : mode === 'shortBreak' ? 'pomo-short' : 'pomo-long'

  return (
    <div className={`pomodoro-timer ${modeClass}`}>
      <h1 className="pomo-title">Pomodoro Timer</h1>

      {/* ── Mode tabs ── */}
      <div className="pomo-tabs">
        {Object.values(MODES).map((m) => (
          <button
            key={m.key}
            className={`pomo-tab ${mode === m.key ? 'pomo-tab--active' : ''}`}
            onClick={() => switchMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Timer circle ── */}
      <div className="pomo-circle-wrapper">
        <svg className="pomo-svg" viewBox="0 0 250 250">
          {/* background ring */}
          <circle
            className="pomo-ring-bg"
            cx="125"
            cy="125"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
          />
          {/* progress ring */}
          <circle
            className="pomo-ring-progress"
            cx="125"
            cy="125"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * progress}
            strokeLinecap="round"
            transform="rotate(-90 125 125)"
          />
        </svg>
        <div className="pomo-time-display">
          <span className="pomo-time">{formatTime(secondsLeft)}</span>
          <span className="pomo-mode-label">{MODES[mode].label}</span>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="pomo-controls">
        {!isRunning ? (
          <button className="pomo-btn pomo-btn--start" onClick={handleStart}>
            Start
          </button>
        ) : (
          <button className="pomo-btn pomo-btn--pause" onClick={handlePause}>
            Pause
          </button>
        )}
        <button className="pomo-btn pomo-btn--reset" onClick={handleReset}>
          Reset
        </button>
      </div>

      {/* ── Session counter ── */}
      <div className="pomo-sessions">
        <span className="pomo-sessions-label">
          Sessions: {completedSessions}
        </span>
        <div className="pomo-dots">
          {Array.from({ length: dots }).map((_, i) => (
            <span key={i} className="pomo-dot pomo-dot--filled" />
          ))}
          {Array.from({ length: maxDots - dots }).map((_, i) => (
            <span key={`e-${i}`} className="pomo-dot" />
          ))}
        </div>
      </div>

      {/* ── Settings toggle ── */}
      <button className="pomo-settings-toggle" onClick={openSettings}>
        Settings
      </button>

      {/* ── Settings panel ── */}
      {showSettings && (
        <div className="pomo-settings-overlay" onClick={cancelSettings}>
          <div className="pomo-settings-panel" onClick={(e) => e.stopPropagation()}>
            <h2 className="pomo-settings-title">Timer Settings</h2>

            <label className="pomo-setting">
              <span>Focus (min)</span>
              <input
                type="number"
                min="1"
                max="120"
                value={tempSettings.focus}
                onChange={(e) =>
                  setTempSettings((prev) => ({ ...prev, focus: e.target.value }))
                }
              />
            </label>

            <label className="pomo-setting">
              <span>Short Break (min)</span>
              <input
                type="number"
                min="1"
                max="60"
                value={tempSettings.shortBreak}
                onChange={(e) =>
                  setTempSettings((prev) => ({ ...prev, shortBreak: e.target.value }))
                }
              />
            </label>

            <label className="pomo-setting">
              <span>Long Break (min)</span>
              <input
                type="number"
                min="1"
                max="60"
                value={tempSettings.longBreak}
                onChange={(e) =>
                  setTempSettings((prev) => ({ ...prev, longBreak: e.target.value }))
                }
              />
            </label>

            <div className="pomo-settings-actions">
              <button className="pomo-btn pomo-btn--save" onClick={saveSettings}>
                Save
              </button>
              <button className="pomo-btn pomo-btn--cancel" onClick={cancelSettings}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

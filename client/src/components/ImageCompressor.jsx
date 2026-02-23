import { useState, useRef } from 'react'
import './ImageCompressor.css'

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function ImageCompressor() {
  const [originalFile, setOriginalFile] = useState(null)
  const [originalUrl, setOriginalUrl] = useState('')
  const [compressedUrl, setCompressedUrl] = useState('')
  const [compressedBlob, setCompressedBlob] = useState(null)
  const [quality, setQuality] = useState(70)
  const [maxWidth, setMaxWidth] = useState('')
  const [maxHeight, setMaxHeight] = useState('')
  const [outputFormat, setOutputFormat] = useState('image/jpeg')
  const [dragActive, setDragActive] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState('')
  const [originalDimensions, setOriginalDimensions] = useState(null)
  const [compressedDimensions, setCompressedDimensions] = useState(null)

  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)

  const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']

  const handleFile = (file) => {
    setError('')
    setCompressedUrl('')
    setCompressedBlob(null)
    setCompressedDimensions(null)

    if (!file) return

    if (!acceptedTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPG, PNG, or WEBP image.')
      return
    }

    if (originalUrl) {
      URL.revokeObjectURL(originalUrl)
    }
    if (compressedUrl) {
      URL.revokeObjectURL(compressedUrl)
    }

    const url = URL.createObjectURL(file)
    setOriginalFile(file)
    setOriginalUrl(url)

    const img = new Image()
    img.onload = () => {
      setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.src = url
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current.click()
  }

  const compressImage = () => {
    if (!originalFile) {
      setError('Please upload an image first.')
      return
    }

    setCompressing(true)
    setError('')

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        let newWidth = img.naturalWidth
        let newHeight = img.naturalHeight

        const mw = maxWidth ? parseInt(maxWidth, 10) : 0
        const mh = maxHeight ? parseInt(maxHeight, 10) : 0

        if (mw > 0 && mh > 0) {
          const ratioW = mw / newWidth
          const ratioH = mh / newHeight
          const ratio = Math.min(ratioW, ratioH)
          if (ratio < 1) {
            newWidth = Math.round(newWidth * ratio)
            newHeight = Math.round(newHeight * ratio)
          }
        } else if (mw > 0 && newWidth > mw) {
          const ratio = mw / newWidth
          newWidth = mw
          newHeight = Math.round(newHeight * ratio)
        } else if (mh > 0 && newHeight > mh) {
          const ratio = mh / newHeight
          newHeight = mh
          newWidth = Math.round(newWidth * ratio)
        }

        canvas.width = newWidth
        canvas.height = newHeight

        ctx.clearRect(0, 0, newWidth, newHeight)

        if (outputFormat === 'image/jpeg') {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, newWidth, newHeight)
        }

        ctx.drawImage(img, 0, 0, newWidth, newHeight)

        const qualityValue = outputFormat === 'image/png' ? undefined : quality / 100

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setError('Compression failed. Please try a different format or settings.')
              setCompressing(false)
              return
            }

            if (compressedUrl) {
              URL.revokeObjectURL(compressedUrl)
            }

            const url = URL.createObjectURL(blob)
            setCompressedBlob(blob)
            setCompressedUrl(url)
            setCompressedDimensions({ width: newWidth, height: newHeight })
            setCompressing(false)
          },
          outputFormat,
          qualityValue
        )
      }

      img.onerror = () => {
        setError('Failed to load image. The file may be corrupted.')
        setCompressing(false)
      }

      img.src = e.target.result
    }

    reader.onerror = () => {
      setError('Failed to read file. Please try again.')
      setCompressing(false)
    }

    reader.readAsDataURL(originalFile)
  }

  const downloadCompressed = () => {
    if (!compressedBlob) return

    const extensions = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    }

    const ext = extensions[outputFormat] || 'jpg'
    const baseName = originalFile.name.replace(/\.[^.]+$/, '')
    const fileName = `${baseName}-compressed.${ext}`

    const link = document.createElement('a')
    link.href = compressedUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetAll = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    if (compressedUrl) URL.revokeObjectURL(compressedUrl)
    setOriginalFile(null)
    setOriginalUrl('')
    setCompressedUrl('')
    setCompressedBlob(null)
    setQuality(70)
    setMaxWidth('')
    setMaxHeight('')
    setOutputFormat('image/jpeg')
    setError('')
    setOriginalDimensions(null)
    setCompressedDimensions(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const reductionPercent =
    originalFile && compressedBlob
      ? ((1 - compressedBlob.size / originalFile.size) * 100).toFixed(1)
      : null

  const formatLabel = {
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
    'image/webp': 'WEBP',
  }

  return (
    <div className="ic-container">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="ic-header">
        <h2>Image Compressor</h2>
        <p>Compress and resize images directly in your browser — no uploads to any server</p>
      </div>

      {/* Upload Area */}
      {!originalFile && (
        <div
          className={`ic-upload-area ${dragActive ? 'ic-upload-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <div className="ic-upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <h3>Drop your image here</h3>
          <p>or click to browse</p>
          <span className="ic-upload-formats">Supports JPG, PNG, WEBP</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="ic-file-input"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {error && <div className="ic-error">{error}</div>}

      {/* Controls */}
      {originalFile && (
        <div className="ic-controls-panel">
          <h3>Compression Settings</h3>
          <div className="ic-controls-grid">
            {/* Quality Slider */}
            <div className="ic-control-group">
              <label className="ic-control-label">
                Quality
                <span className="ic-control-value">{quality}%</span>
              </label>
              <input
                type="range"
                className="ic-slider"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
              />
              <div className="ic-slider-labels">
                <span>Low</span>
                <span>High</span>
              </div>
              {outputFormat === 'image/png' && (
                <span className="ic-control-hint">PNG is lossless — quality slider affects only JPEG/WEBP output</span>
              )}
            </div>

            {/* Max Dimensions */}
            <div className="ic-control-group">
              <label className="ic-control-label">Max Dimensions (optional)</label>
              <div className="ic-dimension-inputs">
                <div className="ic-dimension-field">
                  <label className="ic-dimension-label">Width</label>
                  <input
                    type="number"
                    className="ic-dimension-input"
                    placeholder="px"
                    min="1"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(e.target.value)}
                  />
                </div>
                <span className="ic-dimension-x">x</span>
                <div className="ic-dimension-field">
                  <label className="ic-dimension-label">Height</label>
                  <input
                    type="number"
                    className="ic-dimension-input"
                    placeholder="px"
                    min="1"
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(e.target.value)}
                  />
                </div>
              </div>
              {originalDimensions && (
                <span className="ic-control-hint">
                  Original: {originalDimensions.width} x {originalDimensions.height} px
                </span>
              )}
            </div>

            {/* Output Format */}
            <div className="ic-control-group">
              <label className="ic-control-label">Output Format</label>
              <div className="ic-format-buttons">
                {['image/jpeg', 'image/png', 'image/webp'].map((fmt) => (
                  <button
                    key={fmt}
                    className={`ic-format-btn ${outputFormat === fmt ? 'ic-format-btn-active' : ''}`}
                    onClick={() => setOutputFormat(fmt)}
                  >
                    {formatLabel[fmt]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="ic-actions">
            <button
              className="ic-btn ic-btn-compress"
              onClick={compressImage}
              disabled={compressing}
            >
              {compressing ? 'Compressing...' : 'Compress Image'}
            </button>
            <button className="ic-btn ic-btn-reset" onClick={resetAll}>
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Previews */}
      {originalFile && (
        <div className="ic-preview-section">
          <div className="ic-preview-grid">
            {/* Original */}
            <div className="ic-preview-card">
              <div className="ic-preview-card-header">
                <h4>Original</h4>
                <span className="ic-preview-badge ic-badge-original">Before</span>
              </div>
              <div className="ic-preview-image-wrapper">
                <img src={originalUrl} alt="Original" className="ic-preview-image" />
              </div>
              <div className="ic-preview-meta">
                <span>{formatBytes(originalFile.size)}</span>
                {originalDimensions && (
                  <span>{originalDimensions.width} x {originalDimensions.height}</span>
                )}
                <span>{originalFile.type.split('/')[1].toUpperCase()}</span>
              </div>
            </div>

            {/* Compressed */}
            <div className="ic-preview-card">
              <div className="ic-preview-card-header">
                <h4>Compressed</h4>
                <span className="ic-preview-badge ic-badge-compressed">After</span>
              </div>
              <div className="ic-preview-image-wrapper">
                {compressedUrl ? (
                  <img src={compressedUrl} alt="Compressed" className="ic-preview-image" />
                ) : (
                  <div className="ic-preview-placeholder">
                    {compressing ? 'Processing...' : 'Click "Compress Image" to see result'}
                  </div>
                )}
              </div>
              <div className="ic-preview-meta">
                {compressedBlob ? (
                  <>
                    <span>{formatBytes(compressedBlob.size)}</span>
                    {compressedDimensions && (
                      <span>{compressedDimensions.width} x {compressedDimensions.height}</span>
                    )}
                    <span>{formatLabel[outputFormat]}</span>
                  </>
                ) : (
                  <span>--</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats & Download */}
      {originalFile && compressedBlob && (
        <div className="ic-stats-section">
          <div className="ic-stats-grid">
            <div className="ic-stat-card">
              <span className="ic-stat-label">Original Size</span>
              <span className="ic-stat-value">{formatBytes(originalFile.size)}</span>
            </div>
            <div className="ic-stat-card">
              <span className="ic-stat-label">Compressed Size</span>
              <span className="ic-stat-value">{formatBytes(compressedBlob.size)}</span>
            </div>
            <div className={`ic-stat-card ${Number(reductionPercent) > 0 ? 'ic-stat-card-success' : 'ic-stat-card-warn'}`}>
              <span className="ic-stat-label">Reduction</span>
              <span className="ic-stat-value">
                {Number(reductionPercent) > 0 ? '-' : '+'}{Math.abs(Number(reductionPercent))}%
              </span>
            </div>
          </div>

          <button className="ic-btn ic-btn-download" onClick={downloadCompressed}>
            Download Compressed Image
          </button>
        </div>
      )}
    </div>
  )
}

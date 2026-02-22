import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './StoryBuilder.css'

export default function StoryBuilder({ user }) {
  const [stories, setStories] = useState([])
  const [selectedStory, setSelectedStory] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newStoryData, setNewStoryData] = useState({
    title: '',
    description: '',
  })
  const [newLine, setNewLine] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  const API_URL = '/api/stories'
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_URL)
      setStories(response.data)
    } catch (error) {
      console.error('Failed to fetch stories:', error)
    } finally {
      setLoading(false)
    }
  }

  // const handleCreateStory = async (e) => {
  //   e.preventDefault()
  //   if (!newStoryData.title.trim()) {
  //     alert('Please enter a story title')
  //     return
  //   }

  //   try {
  //     const response = await axios.post(API_URL, newStoryData, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })
  //     setStories([response.data.story, ...stories])
  //     setNewStoryData({ title: '', description: '' })
  //     setShowCreateForm(false)
  //     setSelectedStory(response.data.story)
  //   } catch (error) {
  //     console.error('Failed to create story:', error)
  //     alert('Failed to create story')
  //   }
  // }

  // const handleAddLine = async (e) => {
  //   e.preventDefault()
  //   if (!newLine.trim() || !selectedStory) {
  //     alert('Please enter a line to add')
  //     return
  //   }

  //   try {
  //     const response = await axios.post(
  //       `${API_URL}/${selectedStory._id}/add-line`,
  //       {
  //         text: newLine,
  //         isAnonymous,
  //       },
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     )
  //     setSelectedStory(response.data.story)
  //     setNewLine('')
  //     setIsAnonymous(false)
      
  //     // Update stories list
  //     setStories(stories.map(s => s._id === response.data.story._id ? response.data.story : s))
  //   } catch (error) {
  //     console.error('Failed to add line:', error)
  //     alert('Failed to add line to story')
  //   }
  // }

  const handleAddLine = async (e) => {
    e.preventDefault();
    if (!newLine.trim() || !selectedStory?._id) {
      alert('Please enter a line and select a story');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/add-line`,  // ✅ Fixed endpoint
        {
          storyId: selectedStory._id,  // ✅ Pass storyId in BODY
          text: newLine,
          isAnonymous,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ AUTO UPDATE - Replace selected story with fresh data
      setSelectedStory(response.data.story);
      
      // ✅ Refresh entire list too
      await fetchStories();
      
      setNewLine('');
      setIsAnonymous(false);
    } catch (error) {
      console.error('Add line failed:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Failed to add line');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!newStoryData.title.trim()) {
      alert('Please enter a story title');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(API_URL, newStoryData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // ✅ AUTO UPDATE - Add new story + select it
      setStories([response.data.story, ...stories]);
      setNewStoryData({ title: '', description: '' });
      setShowCreateForm(false);
      setSelectedStory(response.data.story);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create story');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="story-builder-container">
      <div className="story-header">
        <h2>📖 Story Builder</h2>
        <p>Collaborate with others to create amazing stories</p>
        <button 
          className="create-story-btn"
          onClick={() => {
            if (!user) {
              alert('Please login to create a story')
              return
            }
            setShowCreateForm(!showCreateForm)
          }}
        >
          {showCreateForm ? '✕ Cancel' : '✚ Create New Story'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-story-form">
          <form onSubmit={handleCreateStory}>
            <div className="form-group">
              <label>Story Title *</label>
              <input
                type="text"
                placeholder="Enter an intriguing title..."
                value={newStoryData.title}
                onChange={(e) =>
                  setNewStoryData({ ...newStoryData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                placeholder="Brief description of your story..."
                value={newStoryData.description}
                onChange={(e) =>
                  setNewStoryData({ ...newStoryData, description: e.target.value })
                }
                rows="3"
              />
            </div>
            <button type="submit" className="submit-btn" disabled={!user}>Create Story</button>
          </form>
        </div>
      )}

      <div className="story-content">
        <div className="stories-list">
          <h3>Stories ({stories.length})</h3>
          <div className="stories-grid">
            {stories.map((story) => (
              <div
                key={story._id}
                className={`story-card ${selectedStory?._id === story._id ? 'active' : ''}`}
                onClick={() => setSelectedStory(story)}
              >
                <h4>{story.title}</h4>
                <p className="story-meta">
                  By {story.createdByUsername} • {story.lines.length} lines • {story.totalContributions} contributions
                </p>
                {story.description && <p className="story-desc">{story.description}</p>}
              </div>
            ))}
          </div>
        </div>

        {selectedStory && (
          <div className="story-detail">
            <div className="story-title-section">
              <h2>{selectedStory.title}</h2>
              {selectedStory.description && (
                <p className="story-description">{selectedStory.description}</p>
              )}
              <div className="story-info">
                <span>Created by: <strong>{selectedStory.createdByUsername}</strong></span>
                <span>Lines: <strong>{selectedStory.lines.length}</strong></span>
                <span>Total Contributions: <strong>{selectedStory.totalContributions}</strong></span>
              </div>
            </div>

            {/* <div className="story-lines">
              <h3>Story Content</h3>
              <div className="lines-container">
                {selectedStory.lines.length === 0 ? (
                  <p className="empty-story">Be the first to add a line to this story...</p>
                ) : (
                  selectedStory.lines.map((line, index) => (
                    <div key={index} className="line-item">
                      <div className="line-number">{index + 1}</div>
                      <div className="line-content">
                        <p>{line.text}</p>
                        <small className="line-meta">
                          {line.isAnonymous ? 'Anonymous' : line.contributorUsername} •{' '}
                          {new Date(line.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div> */}
            <div className="story-lines">
              <h3>📖 The Story Unfolds</h3>
              <div className="full-story">
                {selectedStory.lines.length === 0 ? (
                  <div className="empty-story">
                    <p className="empty-text">No lines yet. Be the first to begin this tale...</p>
                  </div>
                ) : (
                  <div className="story-paragraph">
                    {selectedStory.lines.map((line, index) => (
                      <span 
                        key={index}
                        className="story-sentence"
                        data-author={line.isAnonymous ? 'Anonymous' : line.contributorUsername}
                        data-time={new Date(line.createdAt).toLocaleDateString()}
                        title={`${line.isAnonymous ? 'Anonymous' : line.contributorUsername} • ${new Date(line.createdAt).toLocaleString()}`}
                      >
                        {line.text.trim()} 
                        {index < selectedStory.lines.length - 1 && <span className="sentence-connector"> </span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {loading && <div className="loading">⏳ Updating story...</div>}

            <div className="add-line-form" style={{ opacity: loading ? 0.7 : 1 }}>
              <h3>Add Your Line</h3>
              <form onSubmit={handleAddLine}>
                <textarea
                  placeholder="Write your next line in the story..."
                  value={newLine}
                  onChange={(e) => setNewLine(e.target.value)}
                  rows="4"
                  required
                  disabled={!user}
                />
                <div className="form-footer">
                  <label className="anonymous-checkbox">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    Post as Anonymous
                  </label>
                  <button type="submit" className="add-line-btn" disabled={!user}>
                    {loading ? 'Adding...' : 'Add Line'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!selectedStory && (
          <div className="no-story-selected">
            <p>👈 Select a story to read and contribute</p>
          </div>
        )}
      </div>
    </div>
  )
}

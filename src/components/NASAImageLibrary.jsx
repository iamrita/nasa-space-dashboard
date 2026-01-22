import { useState, useEffect } from 'react'
import { searchNASAImages } from '../api/nasaApi'
import LoadingSpinner from './LoadingSpinner'

const POPULAR_TOPICS = [
  { id: 'galaxy', label: 'Galaxies' },
  { id: 'nebula', label: 'Nebulae' },
  { id: 'supernova', label: 'Supernovae' },
  { id: 'black hole', label: 'Black Holes' },
  { id: 'jupiter', label: 'Jupiter' },
  { id: 'saturn', label: 'Saturn' },
  { id: 'mars', label: 'Mars' },
  { id: 'moon', label: 'Moon' },
  { id: 'earth', label: 'Earth' },
  { id: 'astronaut', label: 'Astronauts' },
  { id: 'space station', label: 'ISS' },
  { id: 'rocket launch', label: 'Launches' }
]

function NASAImageLibrary() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTopic, setActiveTopic] = useState('galaxy')
  const [selectedImage, setSelectedImage] = useState(null)
  const [page, setPage] = useState(1)
  const [totalHits, setTotalHits] = useState(0)

  useEffect(() => {
    async function loadImages() {
      try {
        setLoading(true)
        setError(null)
        const query = searchQuery || activeTopic
        const result = await searchNASAImages(query, 'image', page)
        
        const items = result.collection?.items || []
        setTotalHits(result.collection?.metadata?.total_hits || 0)
        
        // Extract image data with thumbnails
        const imageData = items
          .filter(item => item.links && item.links[0]?.href)
          .map(item => ({
            id: item.data[0]?.nasa_id,
            title: item.data[0]?.title,
            description: item.data[0]?.description,
            date: item.data[0]?.date_created,
            center: item.data[0]?.center,
            keywords: item.data[0]?.keywords || [],
            thumbnail: item.links[0]?.href,
            detailsHref: item.href
          }))
          .slice(0, 24)
        
        setImages(imageData)
      } catch (err) {
        console.error('Image search error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadImages()
  }, [activeTopic, searchQuery, page])

  const handleSearch = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const query = formData.get('search')
    if (query) {
      setSearchQuery(query)
      setActiveTopic('')
      setPage(1)
    }
  }

  const handleTopicClick = (topicId) => {
    setActiveTopic(topicId)
    setSearchQuery('')
    setPage(1)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="nasa-images-container">
      <div className="section-header">
        <h2>NASA Image Library</h2>
        <span className="count-badge">{totalHits.toLocaleString()} images found</span>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <input 
          type="text" 
          name="search"
          placeholder="Search NASA's image archive..."
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      <div className="topic-chips">
        {POPULAR_TOPICS.map(topic => (
          <button
            key={topic.id}
            className={`topic-chip ${activeTopic === topic.id ? 'active' : ''}`}
            onClick={() => handleTopicClick(topic.id)}
          >
            {topic.label}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}
      
      {error && <div className="error-message">Error: {error}</div>}
      
      {!loading && !error && images.length === 0 && (
        <div className="no-data">
          <p>No images found. Try a different search term.</p>
        </div>
      )}

      {!loading && images.length > 0 && (
        <>
          <div className="image-grid">
            {images.map(image => (
              <div 
                key={image.id} 
                className="image-card"
                onClick={() => setSelectedImage(image)}
              >
                <img 
                  src={image.thumbnail} 
                  alt={image.title}
                  loading="lazy"
                />
                <div className="image-overlay">
                  <h4 className="image-title">{image.title}</h4>
                  <span className="image-date">{formatDate(image.date)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="page-btn"
            >
              ← Previous
            </button>
            <span className="page-info">Page {page}</span>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={images.length < 24}
              className="page-btn"
            >
              Next →
            </button>
          </div>
        </>
      )}

      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content image-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedImage(null)}>×</button>
            <img src={selectedImage.thumbnail.replace('thumb', 'medium')} alt={selectedImage.title} />
            <div className="modal-info">
              <h3>{selectedImage.title}</h3>
              <p className="modal-date">{formatDate(selectedImage.date)}</p>
              {selectedImage.center && (
                <p className="modal-center">NASA Center: {selectedImage.center}</p>
              )}
              {selectedImage.description && (
                <p className="modal-description">{selectedImage.description}</p>
              )}
              {selectedImage.keywords.length > 0 && (
                <div className="modal-keywords">
                  {selectedImage.keywords.slice(0, 8).map((keyword, idx) => (
                    <span key={idx} className="keyword-tag">{keyword}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NASAImageLibrary

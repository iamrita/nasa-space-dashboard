import { useState, useEffect } from 'react'
import { fetchAPOD } from '../api/nasaApi'
import LoadingSpinner from './LoadingSpinner'

function APOD() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadAPOD() {
      try {
        setLoading(true)
        const result = await fetchAPOD()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadAPOD()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="error-message">Error: {error}</div>
  if (!data) return null

  return (
    <div className="apod-container">
      <div className="section-header">
        <h2>Astronomy Picture of the Day</h2>
        <span className="date-badge">{data.date}</span>
      </div>
      
      <div className="apod-content">
        <div className="apod-media">
          {data.media_type === 'video' ? (
            <iframe
              src={data.url}
              title={data.title}
              allowFullScreen
              className="apod-video"
            />
          ) : (
            <img src={data.url} alt={data.title} className="apod-image" />
          )}
        </div>
        
        <div className="apod-info">
          <h3 className="apod-title">{data.title}</h3>
          {data.copyright && (
            <p className="apod-copyright">© {data.copyright}</p>
          )}
          <p className="apod-explanation">{data.explanation}</p>
          
          {data.hdurl && (
            <a 
              href={data.hdurl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hd-link"
            >
              View HD Image →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default APOD

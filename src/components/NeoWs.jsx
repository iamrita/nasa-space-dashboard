import { useState, useEffect } from 'react'
import { fetchNEOs } from '../api/nasaApi'
import LoadingSpinner from './LoadingSpinner'

function NeoWs() {
  const [neoData, setNeoData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedNeo, setSelectedNeo] = useState(null)

  useEffect(() => {
    async function loadNEOs() {
      try {
        setLoading(true)
        const result = await fetchNEOs()
        setNeoData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadNEOs()
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="error-message">Error: {error}</div>
  if (!neoData) return null

  const allNeos = Object.entries(neoData.near_earth_objects)
    .sort(([a], [b]) => new Date(a) - new Date(b))

  return (
    <div className="neo-container">
      <div className="section-header">
        <h2>Near Earth Objects</h2>
        <span className="count-badge">{neoData.element_count} objects tracked</span>
      </div>

      <div className="neo-summary">
        <div className="summary-card">
          <span className="summary-icon">○</span>
          <span className="summary-value">{neoData.element_count}</span>
          <span className="summary-label">Total Objects</span>
        </div>
        <div className="summary-card hazardous">
          <span className="summary-icon">◆</span>
          <span className="summary-value">
            {Object.values(neoData.near_earth_objects)
              .flat()
              .filter(neo => neo.is_potentially_hazardous_asteroid).length}
          </span>
          <span className="summary-label">Potentially Hazardous</span>
        </div>
      </div>

      <div className="neo-timeline">
        {allNeos.map(([date, neos]) => (
          <div key={date} className="neo-day">
            <h3 className="neo-date">{new Date(date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</h3>
            
            <div className="neo-list">
              {neos.map(neo => (
                <div 
                  key={neo.id} 
                  className={`neo-card ${neo.is_potentially_hazardous_asteroid ? 'hazardous' : ''}`}
                  onClick={() => setSelectedNeo(neo)}
                >
                  <div className="neo-header">
                    <h4>{neo.name}</h4>
                    {neo.is_potentially_hazardous_asteroid && (
                      <span className="hazard-badge">Hazardous</span>
                    )}
                  </div>
                  
                  <div className="neo-details">
                    <div className="neo-stat">
                      <span className="stat-label">Diameter</span>
                      <span className="stat-value">
                        {Math.round(neo.estimated_diameter.meters.estimated_diameter_min)} - {Math.round(neo.estimated_diameter.meters.estimated_diameter_max)} m
                      </span>
                    </div>
                    <div className="neo-stat">
                      <span className="stat-label">Miss Distance</span>
                      <span className="stat-value">
                        {Math.round(parseFloat(neo.close_approach_data[0]?.miss_distance?.kilometers)).toLocaleString()} km
                      </span>
                    </div>
                    <div className="neo-stat">
                      <span className="stat-label">Velocity</span>
                      <span className="stat-value">
                        {Math.round(parseFloat(neo.close_approach_data[0]?.relative_velocity?.kilometers_per_hour)).toLocaleString()} km/h
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedNeo && (
        <div className="modal-overlay" onClick={() => setSelectedNeo(null)}>
          <div className="modal-content neo-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedNeo(null)}>×</button>
            
            <h3>{selectedNeo.name}</h3>
            
            {selectedNeo.is_potentially_hazardous_asteroid && (
              <div className="hazard-warning">
                This asteroid is classified as potentially hazardous
              </div>
            )}
            
            <div className="modal-stats">
              <div className="modal-stat">
                <span className="label">NASA JPL ID</span>
                <span className="value">{selectedNeo.id}</span>
              </div>
              <div className="modal-stat">
                <span className="label">Absolute Magnitude</span>
                <span className="value">{selectedNeo.absolute_magnitude_h}</span>
              </div>
              <div className="modal-stat">
                <span className="label">Estimated Diameter (min)</span>
                <span className="value">{selectedNeo.estimated_diameter.meters.estimated_diameter_min.toFixed(2)} m</span>
              </div>
              <div className="modal-stat">
                <span className="label">Estimated Diameter (max)</span>
                <span className="value">{selectedNeo.estimated_diameter.meters.estimated_diameter_max.toFixed(2)} m</span>
              </div>
            </div>
            
            <h4>Close Approach Data</h4>
            {selectedNeo.close_approach_data.map((approach, idx) => (
              <div key={idx} className="approach-data">
                <div className="modal-stat">
                  <span className="label">Approach Date</span>
                  <span className="value">{approach.close_approach_date_full}</span>
                </div>
                <div className="modal-stat">
                  <span className="label">Relative Velocity</span>
                  <span className="value">{parseFloat(approach.relative_velocity.kilometers_per_hour).toLocaleString()} km/h</span>
                </div>
                <div className="modal-stat">
                  <span className="label">Miss Distance</span>
                  <span className="value">{parseFloat(approach.miss_distance.kilometers).toLocaleString()} km</span>
                </div>
                <div className="modal-stat">
                  <span className="label">Orbiting Body</span>
                  <span className="value">{approach.orbiting_body}</span>
                </div>
              </div>
            ))}
            
            <a 
              href={selectedNeo.nasa_jpl_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="nasa-link"
            >
              View on NASA JPL →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default NeoWs

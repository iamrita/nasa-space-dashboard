function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <span className="spinner-planet">◆</span>
      </div>
      <p className="loading-text">Loading</p>
    </div>
  )
}

export default LoadingSpinner

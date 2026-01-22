import { useState } from 'react'
import Header from './components/Header'
import APOD from './components/APOD'
import NASAImageLibrary from './components/NASAImageLibrary'
import NeoWs from './components/NeoWs'

function App() {
  const [activeTab, setActiveTab] = useState('apod')

  const tabs = [
    { id: 'apod', label: 'Picture of the Day', icon: '◆' },
    { id: 'images', label: 'Image Library', icon: '◇' },
    { id: 'neo', label: 'Near Earth Objects', icon: '○' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'apod':
        return <APOD />
      case 'images':
        return <NASAImageLibrary />
      case 'neo':
        return <NeoWs />
      default:
        return <APOD />
    }
  }

  return (
    <div className="app">
      <Header />
      
      <nav className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="main-content">
        {renderContent()}
      </main>

      <footer className="footer">
        <p>Data Provided by NASA Open APIs</p>
      </footer>
    </div>
  )
}

export default App

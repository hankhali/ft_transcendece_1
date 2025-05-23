import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import TournamentPage from './pages/TournamentPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Clear error after 5 seconds
  useState(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  })

  return (
    <Router>
      <div className="app-container">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        <Routes>
          <Route path="/" element={<HomePage setIsLoading={setIsLoading} setError={setError} />} />
          <Route path="/register" element={<RegisterPage setIsLoading={setIsLoading} setError={setError} />} />
          <Route path="/tournament" element={<TournamentPage setIsLoading={setIsLoading} setError={setError} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface HomePageProps {
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

const HomePage: React.FC<HomePageProps> = () => {
  const navigate = useNavigate()

  const startNewTournament = () => {
    navigate('/register')
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Welcome to Pong Tournament</h1>
      
      <div className="nav-menu">
        <Link to="/" className="nav-link active">Home</Link>
        <Link to="/register" className="nav-link">Register</Link>
        <Link to="/tournament" className="nav-link">Tournament</Link>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Challenge your friends to the classic game of Pong!</p>
        <p>Create a tournament and compete to see who's the ultimate Pong champion.</p>
      </div>
      
      <button onClick={startNewTournament}>Start New Tournament</button>
    </div>
  )
}

export default HomePage

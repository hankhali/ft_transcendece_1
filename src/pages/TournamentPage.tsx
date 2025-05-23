import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface TournamentPageProps {
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

interface Match {
  id: number
  player1: string
  player2: string
  status: 'upcoming' | 'in-progress' | 'completed'
  winner?: string
  score?: string
}

interface Tournament {
  id: number
  name: string
  status: 'active' | 'upcoming' | 'completed'
  participants: string[]
  matches: Match[]
  currentMatch?: number
}

const TournamentPage: React.FC<TournamentPageProps> = ({ setIsLoading, setError }) => {
  const [tournament, setTournament] = useState<Tournament | null>(null)

  useEffect(() => {
    // Fetch tournament data (simulated)
    const fetchTournament = async () => {
      setIsLoading(true)
      
      try {
        // Get players from localStorage (from registration)
        const playersJson = localStorage.getItem('tournamentPlayers')
        const players = playersJson ? JSON.parse(playersJson) : ['Player 1', 'Player 2', 'Player 3', 'Player 4']
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Generate matches based on players
        const matches: Match[] = []
        for (let i = 0; i < players.length; i += 2) {
          if (i + 1 < players.length) {
            matches.push({
              id: matches.length + 1,
              player1: players[i],
              player2: players[i + 1],
              status: matches.length === 0 ? 'in-progress' : 'upcoming'
            })
          }
        }
        
        // Create tournament object
        const tournamentData: Tournament = {
          id: 1,
          name: 'Pong Tournament',
          status: 'active',
          participants: players,
          matches: matches,
          currentMatch: 1
        }
        
        setTournament(tournamentData)
      } catch (err) {
        setError('Failed to load tournament data')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTournament()
  }, [setIsLoading, setError])

  const handleStartMatch = (matchId: number) => {
    if (!tournament) return
    
    setTournament(prev => {
      if (!prev) return prev
      
      const updatedMatches = prev.matches.map(match => {
        if (match.id === matchId) {
          return { ...match, status: 'in-progress' as const }
        } else if (match.status === 'in-progress') {
          return { ...match, status: 'completed' as const, winner: match.player1, score: '11-9' }
        }
        return match
      })
      
      return {
        ...prev,
        matches: updatedMatches,
        currentMatch: matchId
      }
    })
  }

  if (!tournament) {
    return (
      <div className="page-container">
        <h1 className="page-title">Tournament</h1>
        <p>No active tournament found.</p>
        <Link to="/register">
          <button>Create New Tournament</button>
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1 className="page-title">{tournament.name}</h1>
      
      <div className="nav-menu">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/register" className="nav-link">Register</Link>
        <Link to="/tournament" className="nav-link active">Tournament</Link>
      </div>
      
      <div style={{ width: '100%', marginBottom: '2rem' }}>
        <h2>Participants</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
          {tournament.participants.map((player, index) => (
            <div key={index} style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#1a1a1a', 
              borderRadius: '4px' 
            }}>
              {player}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ width: '100%' }}>
        <h2>Matches</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tournament.matches.map((match) => (
            <div key={match.id} style={{ 
              padding: '1rem', 
              backgroundColor: match.status === 'in-progress' ? 'rgba(100, 108, 255, 0.2)' : '#1a1a1a', 
              borderRadius: '8px',
              border: match.status === 'in-progress' ? '2px solid #646cff' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>Match {match.id}</h3>
                  <p>{match.player1} vs {match.player2}</p>
                  {match.status === 'completed' && match.winner && (
                    <p>Winner: {match.winner} ({match.score})</p>
                  )}
                </div>
                <div>
                  {match.status === 'upcoming' && (
                    <button onClick={() => handleStartMatch(match.id)}>Start Match</button>
                  )}
                  {match.status === 'in-progress' && (
                    <span style={{ 
                      backgroundColor: '#4caf50', 
                      color: 'white', 
                      padding: '0.3rem 0.6rem', 
                      borderRadius: '4px' 
                    }}>
                      In Progress
                    </span>
                  )}
                  {match.status === 'completed' && (
                    <span style={{ 
                      backgroundColor: '#9e9e9e', 
                      color: 'white', 
                      padding: '0.3rem 0.6rem', 
                      borderRadius: '4px' 
                    }}>
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TournamentPage

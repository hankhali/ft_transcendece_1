import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface RegisterPageProps {
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

const RegisterPage: React.FC<RegisterPageProps> = ({ setIsLoading, setError }) => {
  const navigate = useNavigate()
  const [aliases, setAliases] = useState<string[]>(['', ''])
  const [errors, setErrors] = useState<string[]>(['', ''])

  const addPlayer = () => {
    setAliases([...aliases, ''])
    setErrors([...errors, ''])
  }

  const removePlayer = (index: number) => {
    if (aliases.length <= 2) {
      setError('A tournament requires at least 2 players')
      return
    }
    
    const newAliases = [...aliases]
    const newErrors = [...errors]
    newAliases.splice(index, 1)
    newErrors.splice(index, 1)
    setAliases(newAliases)
    setErrors(newErrors)
  }

  const handleAliasChange = (index: number, value: string) => {
    const newAliases = [...aliases]
    newAliases[index] = value
    setAliases(newAliases)
    
    // Clear error when typing
    if (errors[index]) {
      const newErrors = [...errors]
      newErrors[index] = ''
      setErrors(newErrors)
    }
  }

  const validateForm = (): boolean => {
    let isValid = true
    const newErrors = [...errors]
    
    // Check for empty aliases
    aliases.forEach((alias, index) => {
      if (!alias.trim()) {
        newErrors[index] = 'Alias cannot be empty'
        isValid = false
      }
    })
    
    // Check for duplicate aliases
    aliases.forEach((alias, index) => {
      if (alias.trim()) {
        const isDuplicate = aliases.findIndex(
          (a, i) => i !== index && a.toLowerCase() === alias.toLowerCase()
        ) !== -1
        
        if (isDuplicate) {
          newErrors[index] = 'Duplicate alias'
          isValid = false
        }
      }
    })
    
    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      setIsLoading(true)
      
      // Simulate API call with timeout
      setTimeout(() => {
        setIsLoading(false)
        // Store aliases in localStorage for demo purposes
        localStorage.setItem('tournamentPlayers', JSON.stringify(aliases))
        navigate('/tournament')
      }, 1000)
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Register Players</h1>
      
      <div className="nav-menu">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/register" className="nav-link active">Register</Link>
        <Link to="/tournament" className="nav-link">Tournament</Link>
      </div>
      
      <form className="form-container" onSubmit={handleSubmit}>
        <p>Enter player aliases for the tournament:</p>
        
        {aliases.map((alias, index) => (
          <div key={index} className="form-group" style={{ flexDirection: 'row', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor={`player-${index}`}>Player {index + 1}</label>
              <input
                id={`player-${index}`}
                type="text"
                value={alias}
                onChange={(e) => handleAliasChange(index, e.target.value)}
                placeholder="Enter alias"
              />
              {errors[index] && <div className="error">{errors[index]}</div>}
            </div>
            <button 
              type="button" 
              onClick={() => removePlayer(index)}
              style={{ marginLeft: '10px' }}
            >
              Remove
            </button>
          </div>
        ))}
        
        <button type="button" onClick={addPlayer} style={{ marginTop: '1rem' }}>
          Add Player
        </button>
        
        <button type="submit" style={{ marginTop: '2rem' }}>
          Start Tournament
        </button>
      </form>
    </div>
  )
}

export default RegisterPage

import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">
        <button>Return to Home</button>
      </Link>
    </div>
  )
}

export default NotFoundPage

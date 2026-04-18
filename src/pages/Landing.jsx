import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="hero">
      <h1>🌱 ImpactBridge</h1>
      <p>
        Connecting community needs with volunteers through AI. 
        We turn scattered paper surveys into real-time coordinated action.
      </p>
      <div className="card-grid">
        <Link to="/field" className="card">
          <div className="card-icon">📸</div>
          <h2>Field Worker</h2>
          <p>Upload a photo of any paper survey. Gemini AI reads it instantly and extracts structured data.</p>
        </Link>
        <Link to="/dashboard" className="card">
          <div className="card-icon">📊</div>
          <h2>NGO Dashboard</h2>
          <p>View all community needs ranked by urgency. Track impact in real time.</p>
        </Link>
        <Link to="/volunteer" className="card">
          <div className="card-icon">🤝</div>
          <h2>Volunteer</h2>
          <p>Register your skills and location. AI matches you to where you're needed most.</p>
        </Link>
      </div>
    </div>
  )
}
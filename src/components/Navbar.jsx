import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🌱 ImpactBridge</Link>
      <div className="navbar-links">
        <Link to="/field" className="nav-link">📸 Field Worker</Link>
        <Link to="/dashboard" className="nav-link">📊 Dashboard</Link>
        <Link to="/map" className="nav-link">🗺️ Live Map</Link>
        <Link to="/volunteer" className="nav-link">🤝 Volunteer</Link>
      </div>
    </nav>
  )
}
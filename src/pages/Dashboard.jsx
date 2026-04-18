import { useState, useEffect } from 'react'

const DEMO_NEEDS = [
  { id: 1, location: "Koramangala, Bengaluru", needType: "Medical", urgency: "High", description: "Elderly residents need medical check-ups and medicine supply regularly.", peopleAffected: "15", status: "Open", contactName: "Ravi Kumar", timestamp: new Date().toISOString() },
  { id: 2, location: "Indiranagar, Bengaluru", needType: "Education", urgency: "Medium", description: "Children from low-income families need after-school tutoring support.", peopleAffected: "30", status: "Matched", contactName: "Priya Sharma", timestamp: new Date().toISOString() },
  { id: 3, location: "Whitefield, Bengaluru", needType: "Food", urgency: "High", description: "Migrant workers need daily meals. Many haven't eaten in 2 days.", peopleAffected: "50", status: "Open", contactName: "Ahmed Khan", timestamp: new Date().toISOString() },
  { id: 4, location: "HSR Layout, Bengaluru", needType: "Water", urgency: "Low", description: "Clean drinking water access is limited in this locality.", peopleAffected: "100", status: "Open", contactName: "Sunita Rao", timestamp: new Date().toISOString() },
  { id: 5, location: "Jayanagar, Bengaluru", needType: "Shelter", urgency: "Medium", description: "Homeless families need temporary shelter during monsoon season.", peopleAffected: "8", status: "Open", contactName: "Mohan Das", timestamp: new Date().toISOString() },
]

const needIcon = (t) => ({ Medical:'🏥', Food:'🍲', Education:'📚', Water:'💧', Shelter:'🏠', Sanitation:'🚿' }[t] || '🆘')

export default function Dashboard() {
  const [needs, setNeeds] = useState([])
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('impactbridge_needs') || '[]')
    if (stored.length === 0) {
      localStorage.setItem('impactbridge_needs', JSON.stringify(DEMO_NEEDS))
      setNeeds(DEMO_NEEDS)
    } else {
      setNeeds(stored)
    }
  }, [])

  const filters = ['All', 'High', 'Medium', 'Low', 'Medical', 'Food', 'Education', 'Water', 'Shelter']

  const filtered = filter === 'All' ? needs : needs.filter(n =>
    n.urgency === filter || n.needType === filter
  )

  const sorted = [...filtered].sort((a, b) => {
    const order = { High: 0, Medium: 1, Low: 2 }
    return order[a.urgency] - order[b.urgency]
  })

  const highCount = needs.filter(n => n.urgency === 'High').length
  const openCount = needs.filter(n => n.status === 'Open').length
  const matchedCount = needs.filter(n => n.status === 'Matched').length
  const totalPeople = needs.reduce((s, n) => s + (parseInt(n.peopleAffected) || 0), 0)

  return (
    <div className="page">
      <h1 className="page-title">📊 NGO Dashboard</h1>
      <p className="page-subtitle">Live community needs — ranked by urgency and matched with volunteers</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{needs.length}</div>
          <div className="stat-label">Total Needs</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#dc2626' }}>{highCount}</div>
          <div className="stat-label">🔴 High Urgency</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#d97706' }}>{openCount}</div>
          <div className="stat-label">🟡 Open</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#16a34a' }}>{matchedCount}</div>
          <div className="stat-label">✅ Matched</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalPeople}+</div>
          <div className="stat-label">👥 Lives Impacted</div>
        </div>
      </div>

      <div className="filter-row">
        {filters.map(f => (
          <button key={f} className="btn" onClick={() => setFilter(f)} style={{
            background: filter === f ? '#2d6a4f' : 'white',
            color: filter === f ? 'white' : '#2d6a4f',
            border: '2px solid #2d6a4f',
            padding: '0.4rem 1rem',
            fontSize: '0.9rem'
          }}>{f}</button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No needs found. Use the Field Worker portal to add community data.</p>
        </div>
      ) : (
        <div className="needs-grid">
          {sorted.map(need => (
            <div key={need.id} className={`need-card ${need.urgency.toLowerCase()}`}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
                <span style={{ fontSize: '1.8rem' }}>{needIcon(need.needType)}</span>
                <span className={`badge badge-${need.urgency.toLowerCase()}`}>{need.urgency}</span>
              </div>
              <h3 style={{ marginBottom: '0.5rem', color: '#1a202c' }}>{need.needType}</h3>
              <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                {need.description}
              </p>
              <div style={{ fontSize: '0.85rem', color: '#777', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <span>📍 {need.location}</span>
                <span>👥 {need.peopleAffected} people affected</span>
                <span>👤 {need.contactName}</span>
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{
                    padding: '0.2rem 0.7rem',
                    borderRadius: '10px',
                    background: need.status === 'Matched' ? '#dcfce7' : '#fef9c3',
                    color: need.status === 'Matched' ? '#16a34a' : '#d97706',
                    fontWeight: '600',
                    fontSize: '0.85rem'
                  }}>
                    {need.status === 'Matched' ? '✅ Matched' : '🔍 Open'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
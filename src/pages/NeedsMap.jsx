import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps'
import { useState, useEffect } from 'react'

const DEMO_NEEDS = [
  { id: 1, location: "Koramangala, Bengaluru", needType: "Medical", urgency: "High", description: "Elderly residents need medical check-ups.", peopleAffected: "15", status: "Open", lat: 12.9352, lng: 77.6245 },
  { id: 2, location: "Indiranagar, Bengaluru", needType: "Education", urgency: "Medium", description: "Children need after-school tutoring.", peopleAffected: "30", status: "Matched", lat: 12.9784, lng: 77.6408 },
  { id: 3, location: "Whitefield, Bengaluru", needType: "Food", urgency: "High", description: "Migrant workers need daily meals.", peopleAffected: "50", status: "Open", lat: 12.9698, lng: 77.7500 },
  { id: 4, location: "HSR Layout, Bengaluru", needType: "Water", urgency: "Low", description: "Clean drinking water access limited.", peopleAffected: "100", status: "Open", lat: 12.9116, lng: 77.6474 },
  { id: 5, location: "Jayanagar, Bengaluru", needType: "Shelter", urgency: "Medium", description: "Homeless families need shelter.", peopleAffected: "8", status: "Open", lat: 12.9308, lng: 77.5838 },
]

const urgencyColor = (u) => ({ High: '#dc2626', Medium: '#d97706', Low: '#16a34a' }[u] || '#666')
const needIcon = (t) => ({ Medical:'🏥', Food:'🍲', Education:'📚', Water:'💧', Shelter:'🏠' }[t] || '🆘')

export default function NeedsMap() {
  const [needs, setNeeds] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('impactbridge_needs') || '[]')
    const withCoords = stored.map((n, i) => ({
      ...n,
      lat: DEMO_NEEDS[i % DEMO_NEEDS.length].lat + (Math.random() - 0.5) * 0.02,
      lng: DEMO_NEEDS[i % DEMO_NEEDS.length].lng + (Math.random() - 0.5) * 0.02,
    }))
    setNeeds(withCoords.length > 0 ? withCoords : DEMO_NEEDS)
  }, [])

  const filters = ['All', 'High', 'Medium', 'Low']
  const filtered = filter === 'All' ? needs : needs.filter(n => n.urgency === filter)

  return (
    <div className="page">
      <h1 className="page-title">🗺️ Live Needs Map</h1>
      <p className="page-subtitle">Real-time community needs across Bengaluru — color coded by urgency</p>

      <div className="filter-row" style={{ marginBottom: '1rem' }}>
        {filters.map(f => (
          <button key={f} className="btn" onClick={() => setFilter(f)} style={{
            background: filter === f ? '#2d6a4f' : 'white',
            color: filter === f ? 'white' : '#2d6a4f',
            border: '2px solid #2d6a4f',
            padding: '0.4rem 1rem',
            fontSize: '0.9rem'
          }}>{f}</button>
        ))}
        <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: '0.9rem', color: '#666' }}>
          Showing {filtered.length} needs
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.85rem' }}>
          <span style={{ width:12, height:12, borderRadius:'50%', background:'#dc2626', display:'inline-block' }}></span> High
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.85rem' }}>
          <span style={{ width:12, height:12, borderRadius:'50%', background:'#d97706', display:'inline-block' }}></span> Medium
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:'0.3rem', fontSize:'0.85rem' }}>
          <span style={{ width:12, height:12, borderRadius:'50%', background:'#16a34a', display:'inline-block' }}></span> Low
        </span>
      </div>

      <APIProvider apiKey={import.meta.env.VITE_MAPS_API_KEY}>
        <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', height: '520px' }}>
          <Map
            defaultCenter={{ lat: 12.9716, lng: 77.5946 }}
            defaultZoom={12}
            mapId="impactbridge-map"
            gestureHandling="greedy"
            disableDefaultUI={false}
          >
            {filtered.map(need => (
              <AdvancedMarker
                key={need.id}
                position={{ lat: need.lat, lng: need.lng }}
                onClick={() => setSelected(selected?.id === need.id ? null : need)}
              >
                <div style={{
                  background: urgencyColor(need.urgency),
                  borderRadius: '50%',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  transform: selected?.id === need.id ? 'scale(1.3)' : 'scale(1)',
                  transition: 'transform 0.2s'
                }}>
                  {needIcon(need.needType)}
                </div>
              </AdvancedMarker>
            ))}
          </Map>
        </div>
      </APIProvider>

      {selected && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          marginTop: '1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderLeft: `6px solid ${urgencyColor(selected.urgency)}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#2d6a4f' }}>{needIcon(selected.needType)} {selected.needType} Need</h3>
            <button onClick={() => setSelected(null)} style={{
              background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999'
            }}>×</button>
          </div>
          <p style={{ margin: '0.5rem 0', color: '#555' }}>📍 {selected.location}</p>
          <p style={{ margin: '0.5rem 0', color: '#555' }}>{selected.description}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <span className={`badge badge-${selected.urgency.toLowerCase()}`}>{selected.urgency} Urgency</span>
            <span style={{ color: '#666', fontSize: '0.9rem' }}>👥 {selected.peopleAffected} people affected</span>
            <span style={{ color: '#666', fontSize: '0.9rem' }}>
              {selected.status === 'Matched' ? '✅ Matched' : '🔍 Open'}
            </span>
          </div>
        </div>
      )}

      <div className="stats-grid" style={{ marginTop: '2rem' }}>
        {['Medical','Food','Education','Water','Shelter'].map(type => {
          const count = needs.filter(n => n.needType === type).length
          return count > 0 ? (
            <div key={type} className="stat-card">
              <div className="stat-number">{needIcon(type)}</div>
              <div className="stat-number" style={{ fontSize: '1.5rem' }}>{count}</div>
              <div className="stat-label">{type}</div>
            </div>
          ) : null
        })}
      </div>
    </div>
  )
}
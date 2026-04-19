import { useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

const needIcon = (t) => ({ Medical:'🏥', Food:'🍲', Education:'📚', Water:'💧', Shelter:'🏠' }[t] || '🆘')

export default function Volunteer() {
  const [form, setForm] = useState({ name: '', location: '', skills: '', availability: 'Weekends' })
  const [matches, setMatches] = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [accepted, setAccepted] = useState({})

  const findMatches = async () => {
    if (!form.name || !form.location || !form.skills) return
    setLoading(true)

    const needs = JSON.parse(localStorage.getItem('impactbridge_needs') || '[]')
    const openNeeds = needs.filter(n => n.status === 'Open').slice(0, 6)

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const prompt = `Volunteer profile:
Name: ${form.name}, Location: ${form.location}, Skills: ${form.skills}, Availability: ${form.availability}

Community needs:
${JSON.stringify(openNeeds)}

Analyze the volunteer's skills and match them to the most relevant needs.
A volunteer with Medical skills should match Medical needs with high score (85-95%).
A volunteer with Teaching skills should match Education needs with high score (85-95%).
Different skill types should get lower scores (55-70%) for unrelated needs.
Scores must be DIFFERENT for each match - not all the same.

Return ONLY a JSON array of the top 3 best-matched needs. No extra text, no markdown:
[{
  "needId": 1,
  "location": "location string",
  "needType": "type",
  "urgency": "High/Medium/Low",
  "description": "description",
  "matchReason": "specific reason mentioning volunteer's actual skills",
  "matchScore": 92
}]`

      const response = await model.generateContent(prompt)
      const text = response.response.text()
      const cleaned = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      setMatches(parsed)

    } catch (err) {
      console.log('Using local matching:', err)

      const skillsArray = form.skills.toLowerCase().split(',').map(s => s.trim())

      const needSkillMap = {
        'Medical': ['medical', 'doctor', 'nurse', 'health', 'medicine', 'healthcare'],
        'Education': ['teaching', 'teacher', 'education', 'tutor', 'tutoring', 'school'],
        'Food': ['cooking', 'food', 'chef', 'catering', 'nutrition'],
        'Water': ['water', 'plumbing', 'sanitation', 'engineering'],
        'Shelter': ['construction', 'shelter', 'building', 'carpentry', 'housing'],
      }

      const scored = openNeeds.map(n => {
        const relatedSkills = needSkillMap[n.needType] || []
        const directMatch = skillsArray.some(s =>
          relatedSkills.some(r => r.includes(s) || s.includes(r))
        )
        const locationMatch = n.location.toLowerCase()
          .includes(form.location.toLowerCase().split(',')[0].toLowerCase())
        const urgencyBonus = n.urgency === 'High' ? 6 : n.urgency === 'Medium' ? 3 : 0
        const randomVariance = Math.floor(Math.random() * 5)
        const baseScore = directMatch ? 87 : 58
        const score = Math.min(98, baseScore + (locationMatch ? 5 : 0) + urgencyBonus + randomVariance)

        const reason = directMatch
          ? `Your ${form.skills} skills are a direct match for this ${n.needType} need in ${n.location}.`
          : `Your availability and location near ${form.location} make you a helpful fit for this task.`

        return {
          needId: n.id,
          location: n.location,
          needType: n.needType,
          urgency: n.urgency,
          description: n.description,
          matchReason: reason,
          matchScore: score
        }
      })

      const fallback = scored
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3)

      setMatches(fallback)
    }

    setLoading(false)
    setDone(true)
  }

  const acceptTask = (id) => {
    setAccepted(prev => ({ ...prev, [id]: true }))
    const needs = JSON.parse(localStorage.getItem('impactbridge_needs') || '[]')
    const updated = needs.map(n => n.id === id ? { ...n, status: 'Matched' } : n)
    localStorage.setItem('impactbridge_needs', JSON.stringify(updated))
  }

  return (
    <div className="page">
      <h1 className="page-title">🤝 Volunteer Portal</h1>
      <p className="page-subtitle">Register once. AI finds where your skills are needed most.</p>

      {!done ? (
        <div className="result-card">
          <h3 style={{ marginBottom: '1.5rem' }}>Tell us about yourself</h3>
          <div className="form-group">
            <label>Your Name</label>
            <input type="text" placeholder="e.g. Rahul Sharma"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Your Location / Area</label>
            <input type="text" placeholder="e.g. Koramangala, Bengaluru"
              value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Your Skills</label>
            <input type="text" placeholder="e.g. Medical, Teaching, Driving, Cooking"
              value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Availability</label>
            <select value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })}>
              <option>Weekends</option>
              <option>Weekdays</option>
              <option>Anytime</option>
              <option>Mornings only</option>
              <option>Evenings only</option>
            </select>
          </div>
          <button className="btn btn-primary"
            onClick={findMatches}
            disabled={!form.name || !form.location || !form.skills || loading}
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
            {loading ? '⏳ Finding matches...' : '🤖 Find My Best Matches'}
          </button>
          {loading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p style={{ color: '#2d6a4f', fontWeight: '600' }}>
                AI is matching you to community needs...
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="success-banner">
            <h3>Welcome, {form.name}! 🎉</h3>
            <p>Based on your skills and location, here are your top matches:</p>
          </div>

          {matches && matches.map((match, i) => (
            <div key={i} className="match-card" style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: '#2d6a4f' }}>
                  {needIcon(match.needType)} {match.needType} Need
                </h3>
                <span style={{
                  background: match.matchScore >= 85 ? '#2d6a4f' : match.matchScore >= 70 ? '#d97706' : '#6b7280',
                  color: 'white',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px',
                  fontWeight: '700'
                }}>
                  {match.matchScore}% Match
                </span>
              </div>
              <p style={{ marginBottom: '0.4rem', fontWeight: '500' }}>📍 {match.location}</p>
              <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                {match.description}
              </p>
              <p style={{
                background: 'white', padding: '0.75rem', borderRadius: '8px',
                fontSize: '0.9rem', color: '#2d6a4f', fontStyle: 'italic', marginBottom: '1rem'
              }}>
                💡 {match.matchReason}
              </p>
              {accepted[match.needId] ? (
                <div style={{
                  background: '#dcfce7', color: '#16a34a',
                  padding: '0.75rem', borderRadius: '10px',
                  textAlign: 'center', fontWeight: '600'
                }}>
                  ✅ Task Accepted! The NGO will contact you shortly.
                </div>
              ) : (
                <button className="btn btn-primary"
                  onClick={() => acceptTask(match.needId)}
                  style={{ width: '100%' }}>
                  ✅ Accept This Task
                </button>
              )}
            </div>
          ))}

          <button className="btn"
            onClick={() => { setDone(false); setMatches(null); setAccepted({}) }}
            style={{ marginTop: '1.5rem', width: '100%', background: 'white', border: '2px solid #2d6a4f', color: '#2d6a4f' }}>
            🔄 Update My Profile
          </button>
        </>
      )}
    </div>
  )
}
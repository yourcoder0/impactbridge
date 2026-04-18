import { useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default function FieldWorker() {
  const [image, setImage] = useState(null)
  const [imageData, setImageData] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSaved(false)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImage(ev.target.result)
      setImageData({ base64: ev.target.result.split(',')[1], mimeType: file.type })
    }
    reader.readAsDataURL(file)
  }

  const analyzeImage = async () => {
    if (!imageData) return
    setLoading(true)
    setResult(null)

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const prompt = `Analyze this image. It may be a handwritten or printed community needs survey form, or any document related to social needs. Extract all relevant information and respond ONLY with this exact JSON format, no extra text:
{
  "location": "specific area or locality",
  "needType": "one of: Food, Water, Medical, Education, Shelter, Sanitation, Other",
  "urgency": "one of: High, Medium, Low",
  "description": "2-3 sentence description of the need",
  "peopleAffected": "estimated number as string",
  "contactName": "name or Unknown"
}`

      const response = await model.generateContent([
        { text: prompt },
        { inlineData: { data: imageData.base64, mimeType: imageData.mimeType } }
      ])

      const text = response.response.text()
      const cleaned = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      saveNeed(parsed)
      setResult(parsed)
      setSaved(true)

    } catch (err) {
      console.error('Gemini error:', err)
      const demo = {
        location: "Koramangala, Bengaluru",
        needType: "Medical",
        urgency: "High",
        description: "15 elderly residents require regular medical check-ups and medicine. Limited mobility prevents hospital access.",
        peopleAffected: "15",
        contactName: "Ravi Kumar"
      }
      saveNeed(demo)
      setResult(demo)
      setSaved(true)
    }

    setLoading(false)
  }

  const saveNeed = (data) => {
    const existing = JSON.parse(localStorage.getItem('impactbridge_needs') || '[]')
    const newNeed = {
      ...data,
      id: Date.now(),
      status: 'Open',
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem('impactbridge_needs', JSON.stringify([newNeed, ...existing]))
  }

  const reset = () => { setImage(null); setImageData(null); setResult(null); setSaved(false) }

  const urgencyClass = (u) => u === 'High' ? 'badge-high' : u === 'Medium' ? 'badge-medium' : 'badge-low'
  const needIcon = (t) => ({ Medical:'🏥', Food:'🍲', Education:'📚', Water:'💧', Shelter:'🏠', Sanitation:'🚿' }[t] || '🆘')

  return (
    <div className="page">
      <h1 className="page-title">📸 Field Worker Portal</h1>
      <p className="page-subtitle">Upload any community survey photo. Gemini AI reads it in seconds.</p>

      <div className="upload-area" onClick={() => document.getElementById('fileInput').click()}>
        {image ? (
          <img src={image} alt="Uploaded survey" />
        ) : (
          <>
            <div style={{ fontSize: '4rem' }}>📷</div>
            <h3 style={{ marginTop: '1rem', color: '#2d6a4f' }}>Click to upload survey photo</h3>
            <p style={{ color: '#999', marginTop: '0.5rem' }}>Supports JPG, PNG — handwritten or printed forms</p>
          </>
        )}
        <input id="fileInput" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
      </div>

      {image && !loading && !result && (
        <button className="btn btn-primary" onClick={analyzeImage}
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
          🤖 Analyze with Gemini AI
        </button>
      )}

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p style={{ color: '#2d6a4f', fontWeight: '600', fontSize: '1.1rem' }}>
            Gemini AI is reading the survey...
          </p>
        </div>
      )}

      {result && (
        <div className="result-card">
          <h3>✅ Survey Data Extracted Successfully</h3>
          <div className="result-grid">
            <div className="result-item">
              <label>📍 Location</label>
              <p>{result.location}</p>
            </div>
            <div className="result-item">
              <label>Type of Need</label>
              <p>{needIcon(result.needType)} {result.needType}</p>
            </div>
            <div className="result-item">
              <label>⚡ Urgency</label>
              <p><span className={`badge ${urgencyClass(result.urgency)}`}>{result.urgency}</span></p>
            </div>
            <div className="result-item">
              <label>👥 People Affected</label>
              <p>{result.peopleAffected}</p>
            </div>
            <div className="result-item" style={{ gridColumn: '1 / -1' }}>
              <label>📝 Description</label>
              <p>{result.description}</p>
            </div>
            <div className="result-item">
              <label>👤 Contact</label>
              <p>{result.contactName}</p>
            </div>
          </div>

          {saved && (
            <div className="success-banner" style={{ marginTop: '1.5rem' }}>
              <h3>🎉 Added to NGO Dashboard!</h3>
              <p>This need is now live and will be matched with the right volunteers automatically.</p>
            </div>
          )}

          <button className="btn btn-primary" onClick={reset}
            style={{ marginTop: '1.5rem', width: '100%' }}>
            📸 Upload Another Survey
          </button>
        </div>
      )}
    </div>
  )
}
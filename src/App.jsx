import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import FieldWorker from './pages/FieldWorker'
import Dashboard from './pages/Dashboard'
import Volunteer from './pages/Volunteer'
import NeedsMap from './pages/NeedsMap'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/field" element={<FieldWorker />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/map" element={<NeedsMap />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
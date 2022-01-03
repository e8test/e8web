import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from '../Home'
import Bank from '../Bank'
import Roadmap from '../Roadmap'
import Dashboard from '../Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bank" element={<Bank />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

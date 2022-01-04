import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Index from '../Index'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Index />} />
      </Routes>
    </BrowserRouter>
  )
}

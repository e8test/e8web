import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

import Navbar from '../../components/Navbar'
import Loading from '../../components/Loading'

const Home = lazy(() => import('../Home'))
const Bank = lazy(() => import('../Bank'))
const Roadmap = lazy(() => import('../Roadmap'))
const Dashboard = lazy(() => import('../Dashboard'))

export default function Index() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bank" element={<Bank />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </>
  )
}

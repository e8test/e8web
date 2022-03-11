import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Message } from '@arco-design/web-react'
import { useWeb3React } from '@web3-react/core'

import { useEagerConnect, useInactiveListener } from '@/libs/wallet/hooks'
import Main from '@/pages/Main'
import Bank from '@/pages/Bank'
import Dashboard from '@/pages/Dashboard'
import Home from '@/pages/Emptys/Home'
import Roadmap from '@/pages/Emptys/Roadmap'
import Market from '@/pages/Emptys/Market'
import Console from '@/pages/Console'
import Applies from '@/pages/Applies'
import Expires from '@/pages/Expires'

export default function App() {
  const { error } = useWeb3React()
  const tried = useEagerConnect()
  useInactiveListener(!tried)

  useEffect(() => {
    if (error?.message) Message.error(error.message)
  }, [error])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />}>
          <Route path="" element={<Home />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="bank" element={<Bank />} />
          <Route path="market" element={<Market />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
        <Route path="/console" element={<Console />}>
          <Route path="" element={<Applies />} />
          <Route path="expires" element={<Expires />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

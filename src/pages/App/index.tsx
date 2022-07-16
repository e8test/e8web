import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Message, Result, Button } from '@arco-design/web-react'
import { useWeb3React } from '@web3-react/core'

import { useEagerConnect, useInactiveListener } from '@/libs/wallet/hooks'
import Main from '@/pages/Main'
import Bank from '@/pages/Bank'
import Dashboard from '@/pages/Dashboard'
import Home from '@/pages/Emptys/Home'
import Roadmap from '@/pages/Emptys/Roadmap'
import Console from '@/pages/Console'
import Expires from '@/pages/Expires'
import Auctions from '@/pages/Auctions'
import AuctionAdmin from '@/pages/AuctionAdmin'
import Downgrades from '@/pages/Downgrades'
import GlobalDashboard from '@/pages/GlobalDashboard'
import Whitelist from '@/pages/Whitelist'
import Applies from '@/pages/Applies'
import Status from '@/pages/Status'
import DAO from '@/pages/DAO'
import DaoDeposit from '@/pages/DAO/Deposit'
import DaoApplies from '@/pages/DAO/Applies'
import { useConnect } from '@/libs/wallet/hooks'

export default function App() {
  const { connect } = useConnect()
  const [ready, setReady] = useState(false)
  const { error, account } = useWeb3React()
  const tried = useEagerConnect()
  useInactiveListener(!tried)

  useEffect(() => {
    if (error?.message) Message.error(error.message)
  }, [error])

  useEffect(() => {
    setTimeout(() => {
      setReady(true)
    }, 300)
  }, [])

  if (ready === false) return null

  if (!account) {
    return (
      <div className="page-result">
        <Result
          status="warning"
          title="Forbidden"
          extra={
            <Button type="primary" shape="round" size="large" onClick={connect}>
              Connect Wallet
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />}>
          <Route path="" element={<Bank />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="market" element={<Auctions />} />
          <Route path="dao" element={<DAO />}>
            <Route path="" element={<DaoDeposit />} />
            <Route path="applies" element={<DaoApplies />} />
          </Route>
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
        <Route path="/console" element={<Console />}>
          <Route path="" element={<Applies />} />
          <Route path="expires" element={<Expires />} />
          <Route path="auctions" element={<AuctionAdmin />} />
          <Route path="downgrades" element={<Downgrades />} />
          <Route path="dashboard" element={<GlobalDashboard />} />
          <Route path="whitelist" element={<Whitelist />} />
          <Route path="applies" element={<Applies />} />
          <Route path="status" element={<Status />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

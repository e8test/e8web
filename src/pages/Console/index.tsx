import { Outlet } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { Result, Button, Spin } from '@arco-design/web-react'

import ConsoleHeader from '@/components/ConsoleHeader'
import Footer from '@/components/Footer'
import useAdmin from '@/hooks/useAdmin'
import { useConnect } from '@/libs/wallet/hooks'

export default function Console() {
  const { connect } = useConnect()
  const admin = useAdmin()
  const { account } = useWeb3React()

  if (!admin) {
    return (
      <div className="page-result">
        <Spin />
      </div>
    )
  }

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

  if (account && admin && account.toLowerCase() !== admin) {
    return (
      <div className="page-result">
        <Result status="warning" title="Not Administrator" />
      </div>
    )
  }

  return (
    <div className="page">
      <ConsoleHeader />
      <Outlet />
      <Footer />
    </div>
  )
}

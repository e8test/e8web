import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Result, Button } from '@arco-design/web-react'
import { useWeb3React } from '@web3-react/core'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import useWhite from '@/hooks/useWhite'
import { useConnect } from '@/libs/wallet/hooks'

export default function Main() {
  const { account } = useWeb3React()
  const { connect } = useConnect()
  const { inWhite, checkAccount } = useWhite()

  useEffect(() => {
    checkAccount()
  }, [checkAccount])

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

  if (inWhite === undefined) {
    return null
  }

  if (inWhite === false) {
    return (
      <div className="page-result">
        <Result status="warning" title="Your are not in the whitelist" />
      </div>
    )
  }

  return (
    <div className="page">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}

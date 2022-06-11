import { useWeb3React } from '@web3-react/core'
import { Button } from '@arco-design/web-react'
import { Outlet } from 'react-router-dom'

import { useConnect } from '@/libs/wallet/hooks'

export default function DAO() {
  const { connect } = useConnect()
  const { account } = useWeb3React()

  if (!account) {
    return (
      <div className="page-empty">
        <Button size="large" type="primary" shape="round" onClick={connect}>
          Connect Wallet
        </Button>
      </div>
    )
  }

  return <Outlet />
}

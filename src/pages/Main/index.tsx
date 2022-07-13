import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Result } from '@arco-design/web-react'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import useWhite from '@/hooks/useWhite'

export default function Main() {
  const { inWhite, checkAccount } = useWhite()

  useEffect(() => {
    checkAccount()
  }, [checkAccount])

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

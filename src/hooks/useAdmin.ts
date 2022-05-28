import { useCallback, useEffect, useMemo } from 'react'
import { ethers } from 'ethers'

import { currentRouter } from '@/config'
import ROUTERABI from '@/libs/abis/router.json'
import { useProvider } from '@/libs/wallet/hooks'
import useMemoState from './useMemoState'

export default function useAdmin() {
  const provider = useProvider()
  const [admin, setAdmin] = useMemoState('admin', '')

  const routerContract = useMemo(() => {
    return new ethers.Contract(currentRouter, ROUTERABI, provider)
  }, [provider])

  const getAdmin = useCallback(async () => {
    const result = await routerContract.owner()
    console.log('admin', result)
    setAdmin(result.toLowerCase())
  }, [routerContract, setAdmin])

  useEffect(() => {
    getAdmin()
  }, [getAdmin])

  return admin
}

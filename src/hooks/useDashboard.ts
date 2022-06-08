import { useCallback, useMemo } from 'react'
import { ethers } from 'ethers'

import { useProvider } from '@/libs/wallet/hooks'
import ERC20ABI from '@/libs/abis/erc20.json'
import ROUTERABI from '@/libs/abis/router.json'
import CONFIG from '@/config'
import useMemoState from './useMemoState'

export default function useDashboard() {
  const provider = useProvider()
  const [markets, setMarkets] = useMemoState<number[]>('markets', [])
  const [balances, setBalances] = useMemoState<number[]>('balances', [])
  const [tokens, setTokens] = useMemoState<number[]>('token-pools', [])

  const tokenContract = useMemo(() => {
    return new ethers.Contract(CONFIG.tokenAddr, ERC20ABI, provider)
  }, [provider])

  const pool1 = useMemo(() => {
    return new ethers.Contract(CONFIG.pools[0], ROUTERABI, provider)
  }, [provider])

  const pool2 = useMemo(() => {
    return new ethers.Contract(CONFIG.pools[1], ROUTERABI, provider)
  }, [provider])

  const pool3 = useMemo(() => {
    return new ethers.Contract(CONFIG.pools[2], ROUTERABI, provider)
  }, [provider])

  const getTokens = useCallback(async () => {
    const result = await Promise.all([
      tokenContract.balanceOf(CONFIG.pools[0]),
      tokenContract.balanceOf(CONFIG.pools[1]),
      tokenContract.balanceOf(CONFIG.pools[2]),
      tokenContract.totalSupply()
    ])
    setTokens([
      Number(ethers.utils.formatUnits(result[0])),
      Number(ethers.utils.formatUnits(result[1])),
      Number(ethers.utils.formatUnits(result[2])),
      Number(ethers.utils.formatUnits(result[3]))
    ])
  }, [tokenContract, setTokens])

  const marketValues = useCallback(async () => {
    const actions = [
      pool1.marketValue(),
      pool2.marketValue(),
      pool3.marketValue()
    ]
    const result = await Promise.all(actions)
    const values = result.map(item => Number(ethers.utils.formatUnits(item)))
    setMarkets(values)
  }, [setMarkets, pool1, pool2, pool3])

  const getBalances = useCallback(async () => {
    const actions = [
      tokenContract.balanceOf(CONFIG.pools[0]),
      tokenContract.balanceOf(CONFIG.pools[1]),
      tokenContract.balanceOf(CONFIG.pools[2])
    ]
    const result = await Promise.all(actions)
    const values = result.map(item => Number(ethers.utils.formatUnits(item)))
    console.log(values)
    setBalances(values)
  }, [tokenContract, setBalances])

  return {
    markets,
    balances,
    tokens,
    marketValues,
    getBalances,
    getTokens
  }
}

import { useCallback, useEffect, useMemo } from 'react'
import { ethers } from 'ethers'

import { useProvider } from '@/libs/wallet/hooks'
import ERC20ABI from '@/libs/abis/erc20.json'
import CONFIG from '@/config'
import useMemoState from './useMemoState'

export default function useCharts() {
  const provider = useProvider()
  const [markets, setMarkets] = useMemoState<any[]>('markets', [])
  const [tokenInfo, setTokenInfo] = useMemoState<any>('tokenInfo')

  const tokenContract = useMemo(() => {
    return new ethers.Contract(CONFIG.tokenAddr, ERC20ABI, provider)
  }, [provider])

  const getTokenInfo = useCallback(async () => {
    const reserve = await tokenContract.balanceOf(CONFIG.routerAddr)
    const totalSupply = await tokenContract.totalSupply()
    setTokenInfo({
      reserve: Number(ethers.utils.formatUnits(reserve)),
      totalSupply: Number(ethers.utils.formatUnits(totalSupply))
    })
  }, [tokenContract, setTokenInfo])

  const marketValue = useCallback(async () => {
    const blockNumber = await provider.getBlockNumber()
    const logs = await provider.getLogs({
      address: CONFIG.routerAddr,
      fromBlock: blockNumber - 4900,
      topics: [CONFIG.logAddr]
    })
    const actions = []
    for (const log of logs) {
      actions.push(provider.getBlock(log.blockNumber))
    }
    const blocks = await Promise.all(actions)
    const rows = logs.map((log, i) => ({
      value: Number(ethers.utils.formatUnits(log.data)),
      time: blocks[i].timestamp * 1000
    }))
    setMarkets(rows)
    return rows
  }, [provider, setMarkets])

  useEffect(() => {
    marketValue()
    getTokenInfo()
  }, [marketValue, getTokenInfo])

  return {
    markets,
    tokenInfo
  }
}

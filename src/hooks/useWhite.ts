import { useState, useMemo, useCallback, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Message } from '@arco-design/web-react'
import { Web3Provider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import { Multicall } from 'ethereum-multicall'
import { CallContext } from 'ethereum-multicall/dist/esm/models'

import WHITEABI from '@/libs/abis/white.json'
import CONFIG from '@/config'
import { useProvider } from '@/libs/wallet/hooks'

export default function useWhite() {
  const provider: any = useProvider()
  const [count, setCount] = useState(0)
  const [airdroped, setAirdroped] = useState(false)
  const [inWhite, setInWhite] = useState<boolean>()
  const [whites, setWhites] = useState<IWhite[]>([])
  const { account, library } = useWeb3React<Web3Provider>()

  const multicall = useMemo(() => {
    return new Multicall({
      ethersProvider: provider
    })
  }, [provider])

  const whiteContract = useMemo(() => {
    return new ethers.Contract(CONFIG.whiteAddr, WHITEABI, library?.getSigner())
  }, [library])

  const listWhites = useCallback(async () => {
    const handle = Message.loading({
      content: 'Loading...',
      duration: 0
    })
    let lastIndex = await whiteContract.lastIndex()
    lastIndex = lastIndex.toNumber()
    const calls: CallContext[] = []
    for (let i = 1; i < lastIndex; i++) {
      calls.push({
        reference: 'indexToAddress',
        methodName: 'indexToAddress',
        methodParameters: [i]
      })
    }
    const context = [
      {
        reference: 'white',
        contractAddress: CONFIG.whiteAddr,
        abi: WHITEABI,
        calls
      }
    ]
    if (lastIndex > 1) {
      const results = await multicall.call(context)
      const rows: IWhite[] = []
      for (const item of results.results.white.callsReturnContext) {
        rows.push({
          addr: item.returnValues[0]
        })
      }
      setWhites(rows)
    }
    handle()
  }, [whiteContract, multicall])

  const checkAddr = useCallback(
    async (addr: string) => {
      let index = await whiteContract.addressToIndex(addr)
      index = index.toNumber()
      return index
    },
    [whiteContract]
  )

  const checkAccount = useCallback(async () => {
    let result = false
    if (account) {
      const index = await checkAddr(account)
      result = index > 0
    }
    setInWhite(result)
  }, [checkAddr, account])

  const addWhite = useCallback(
    async (addr: string) => {
      const trans = await whiteContract.addWhiteList(addr)
      await trans.wait(1)
    },
    [whiteContract]
  )

  const airdrop = useCallback(async () => {
    const handle = Message.loading({
      content: 'Loading...',
      duration: 0
    })
    try {
      const airdroped = await whiteContract.airdroped(account)
      if (airdroped === true) {
        Message.warning('Already received')
        return
      }
      const trans = await whiteContract.airdrop()
      await trans.wait(1)
      Message.success('Transaction confirmed')
    } catch (error) {
      console.trace(error)
      Message.clear()
      Message.warning('Transaction canceled')
    } finally {
      handle()
    }
  }, [whiteContract, account])

  const delWhite = useCallback(
    async (addr: string) => {
      const trans = await whiteContract.removeWhiteList(addr)
      await trans.wait(1)
    },
    [whiteContract]
  )

  const getInfo = useCallback(async () => {
    const [count, airdroped] = await Promise.all([
      whiteContract.count(),
      whiteContract.airdroped(account)
    ])
    const value = Number(ethers.utils.formatUnits(count))
    setCount(value)
    setAirdroped(airdroped)
  }, [whiteContract, account])

  useEffect(() => {
    if (account) getInfo()
  }, [getInfo, account])

  return {
    whites,
    inWhite,
    count,
    airdroped,
    listWhites,
    addWhite,
    checkAddr,
    delWhite,
    airdrop,
    checkAccount
  }
}

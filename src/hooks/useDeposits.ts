import { useMemo, useCallback, useEffect } from 'react'
import { ethers } from 'ethers'
import { Message } from '@arco-design/web-react'

import { currentRouter } from '@/config'
import NFTABI from '@/libs/abis/nft.json'
import ROUTERABI from '@/libs/abis/router.json'
import useMemoState from './useMemoState'
import { useProvider } from '@/libs/wallet/hooks'

export default function useDeposits() {
  const provider = useProvider()
  const [deposits, setDeposits] = useMemoState<IDeposit[]>('deposits')

  const routerContract = useMemo(() => {
    return new ethers.Contract(currentRouter, ROUTERABI, provider)
  }, [provider])

  const listDeposis = useCallback(async () => {
    const handle = Message.loading({
      content: 'Loading...',
      duration: 0
    })
    const items: IDeposit[] = []
    const first = await routerContract.firstDepostedNFTIndex()
    let _next = first.toNumber()
    if (_next > 0) {
      while (items.length < 10) {
        const result = await routerContract.getDepositedNFTByIndex(_next)
        const contract = new ethers.Contract(result.token, NFTABI, provider)
        const uri = await contract.tokenURI(result.tokenId)
        const obj: any = {
          token: result.token,
          tokenId: result.tokenId.toNumber(),
          uri,
          owner: result.owner,
          timestamp: result.timestamp.toNumber(),
          redeemDeadline: result.redeemDeadline.toNumber() * 1000,
          value: Number(ethers.utils.formatUnits(result.value))
        }
        items.push(obj)
        _next = result.next
        if (result.next.toNumber() === 0) break
      }
    }
    setDeposits(items)
    console.log('=============all deposits=============')
    console.log(items)
    handle()
  }, [routerContract, setDeposits, provider])

  useEffect(() => {
    listDeposis()
  }, [listDeposis])

  return {
    deposits,
    listDeposis
  }
}

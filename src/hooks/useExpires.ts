import { useMemo, useCallback, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { Message } from '@arco-design/web-react'
import { ethers } from 'ethers'

import CONFIG from '@/config'
import NFTABI from '@/libs/abis/nft.json'
import ROUTERABI from '@/libs/abis/router.json'
import useMemoState from './useMemoState'

export default function useExpires() {
  const [expires, setExpires] = useMemoState<IApply[]>('expires', [])
  const { account, library } = useWeb3React<Web3Provider>()

  const routerContract = useMemo(() => {
    return new ethers.Contract(
      CONFIG.routerAddr,
      ROUTERABI,
      library?.getSigner()
    )
  }, [library])

  const listExpires = useCallback(async () => {
    const ids: number[] = []
    let index = await routerContract.lastDepositedNFTIndex()
    if (index.toNumber() > 0) {
      const result = await routerContract.getDepositedNFTByIndex(index)
      const tokenId = result.tokenId.toNumber()
      console.log(result)
      console.log(tokenId)
      let redeemDeadline = result.redeemDeadline.toNumber() * 1000
      let previous = result.previous.toNumber()
      const now = Date.now()
      while (redeemDeadline < now) {
        ids.push(index)
        index = previous
        const result = await routerContract.getDepositedNFTByIndex(index)
        redeemDeadline = result.redeemDeadline.toNumber() * 1000
        previous = result.previous.toNumber()
        if (previous === 0 || index === 0) break
      }
    }
    return ids
  }, [routerContract])

  useEffect(() => {
    listExpires()
  }, [listExpires])
}

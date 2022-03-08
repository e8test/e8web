import { useMemo, useCallback, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { ethers, BigNumber } from 'ethers'

import CONFIG from '@/config'
import NFTABI from '@/libs/abis/nft.json'
import ROUTERABI from '@/libs/abis/router.json'
import useMemoState from './useMemoState'

export default function useExpires() {
  const [expires, setExpires] = useMemoState<INFT[]>('expires', [])
  const { account, library } = useWeb3React<Web3Provider>()

  const nftContract = useMemo(() => {
    return new ethers.Contract(CONFIG.nftAddr, NFTABI, library?.getSigner())
  }, [library])

  const routerContract = useMemo(() => {
    return new ethers.Contract(
      CONFIG.routerAddr,
      ROUTERABI,
      library?.getSigner()
    )
  }, [library])

  // 获取单个NFT信息
  const getNFT = useCallback(
    async (tokenId: BigNumber) => {
      const result = await Promise.all([
        nftContract.tokenURI(tokenId),
        nftContract.getApproved(tokenId),
        routerContract.getNFTStatus(CONFIG.nftAddr, tokenId)
      ])
      const uri = result[0]
      const isApproved = result[1] === CONFIG.routerAddr
      const [quote, value, depositExpire, redeemExpire] = result[2]
      const depositExpireTime = depositExpire.toNumber() * 1000
      const redeemExpireTime = redeemExpire.toNumber() * 1000
      const info: INFT = {
        tokenId: tokenId.toNumber(),
        uri,
        isApproved,
        owner: account!,
        quote: Number(ethers.utils.formatUnits(quote)),
        price: Number(ethers.utils.formatUnits(value)),
        depositExpire: depositExpireTime,
        redeemExpire: redeemExpireTime,
        timestamp: 0
      }
      return info
    },
    [nftContract, routerContract, account]
  )

  const listExpires = useCallback(async () => {
    const items: any[] = []
    let index = await routerContract.lastDepositedNFTIndex()
    if (index.toNumber() > 0) {
      let result = await routerContract.getDepositedNFTByIndex(index)
      let tokenId = result.tokenId.toNumber()
      let redeemDeadline = result.redeemDeadline.toNumber() * 1000
      let previous = result.previous.toNumber()
      const now = Date.now()
      while (redeemDeadline < now) {
        items.push(result)
        index = previous
        result = await routerContract.getDepositedNFTByIndex(index)
        redeemDeadline = result.redeemDeadline.toNumber() * 1000
        previous = result.previous.toNumber()
        tokenId = result.tokenId.toNumber()
        if (tokenId === 0) break
      }
    }
    const infoActions = []
    for (const item of items) {
      infoActions.push(getNFT(item.tokenId))
    }
    let rows = await Promise.all(infoActions)
    rows = rows
      .map((row, index) => ({
        ...row,
        timestamp: items[index].timestamp.toNumber() * 1000
      }))
      .reverse()
    console.log('=============expires=============')
    console.log(rows)
    setExpires(rows)
  }, [routerContract, getNFT, setExpires])

  const redemption = useCallback(
    async (tokenId: number) => {
      const trans = await routerContract.systemRedemption(
        CONFIG.nftAddr,
        tokenId
      )
      await trans.wait(1)
      listExpires()
    },
    [listExpires, routerContract]
  )

  useEffect(() => {
    listExpires()
  }, [listExpires])

  return {
    expires,
    redemption
  }
}

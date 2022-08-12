import { useMemo, useCallback, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { ethers, BigNumber } from 'ethers'
import { Message } from '@arco-design/web-react'

import { currentRouter } from '@/config'
import NFTABI from '@/libs/abis/nft.json'
import ROUTERABI from '@/libs/abis/router.json'
import useMemoState from './useMemoState'

export default function useExpires() {
  const [expires, setExpires] = useMemoState<INFT[]>('expires', [])
  const { account, library } = useWeb3React<Web3Provider>()

  const routerContract = useMemo(() => {
    return new ethers.Contract(currentRouter, ROUTERABI, library?.getSigner())
  }, [library])

  // 获取单个NFT信息
  const getNFT = useCallback(
    async (tokenId: BigNumber, addr: string) => {
      const contract = new ethers.Contract(addr, NFTABI, library?.getSigner())
      const result = await Promise.all([
        contract.tokenURI(tokenId),
        contract.getApproved(tokenId),
        routerContract.getNFTStatus(addr, tokenId)
      ])
      const uri = result[0]
      const isApproved = result[1] === currentRouter
      const [quote, value, depositExpire, redeemExpire, avaliableApply, status] = result[2]
      const depositExpireTime = depositExpire.toNumber() * 1000
      const redeemExpireTime = redeemExpire.toNumber() * 1000
      const avaliableApplyTime = avaliableApply.toNumber() * 1000
      const info: INFT = {
        tokenId: tokenId.toNumber(),
        uri,
        addr,
        isApproved,
        owner: account!,
        quote: Number(ethers.utils.formatUnits(quote)),
        price: Number(ethers.utils.formatUnits(value)),
        depositExpire: depositExpireTime,
        redeemExpire: redeemExpireTime,
        avaliableApplyTime,
        timestamp: 0,
        status: status.toNumber()
      }
      return info
    },
    [routerContract, account, library]
  )

  const listExpires = useCallback(async () => {
    const handle = Message.loading({
      content: 'Loading...',
      duration: 0
    })
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
      infoActions.push(getNFT(item.tokenId, item.token))
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
    handle()
  }, [routerContract, getNFT, setExpires])

  const redemption = useCallback(
    async (tokenId: number, addr: string) => {
      const trans = await routerContract.systemRedemption(
        addr,
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
    redemption,
    listExpires
  }
}

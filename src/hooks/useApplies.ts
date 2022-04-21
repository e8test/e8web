import { useMemo, useCallback, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { Message } from '@arco-design/web-react'
import { ethers } from 'ethers'

import CONFIG from '@/config'
import NFTABI from '@/libs/abis/nft.json'
import ROUTERABI from '@/libs/abis/router.json'
import useMemoState from './useMemoState'

export default function useApplies() {
  const [applies, setApplies] = useMemoState<IApply[]>('applies', [])
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

  const getNFT = useCallback(
    async (tokenId: number) => {
      const [uri, owner] = await Promise.all([
        nftContract.tokenURI(tokenId),
        nftContract.ownerOf(tokenId)
      ])
      return { uri, owner }
    },
    [nftContract]
  )

  const listApplies = useCallback(async () => {
    const auctions = await routerContract.auctions()
    console.log('auctions', auctions)
    const handle = Message.loading({
      content: 'Loading...',
      duration: 0
    })
    const count = await routerContract.lastValuationApplyIndex()
    const idActions = []
    for (let i = 1; i <= count.toNumber(); i++) {
      idActions.push(routerContract.queryApplyByIndex(i))
    }
    const infos = await Promise.all(idActions)
    const nftActions = []
    for (const info of infos) {
      nftActions.push(getNFT(info.tokenId))
    }
    const nfts = await Promise.all(nftActions)
    const rows = infos
      .map((info, i) => ({
        tokenId: info.tokenId.toNumber(),
        quote: Number(ethers.utils.formatUnits(info.quote)),
        timestamp: info.timestamp.toNumber(),
        token: info.token,
        uri: nfts[i].uri,
        owner: nfts[i].owner
      }))
      .reverse()
    console.log('=============applies=============')
    console.log(rows)
    setApplies(rows)
    handle()
  }, [routerContract, setApplies, getNFT])

  const setPrice = useCallback(
    async (
      tokenId: number,
      price: number,
      depositExpire: number,
      redeemExpire: number
    ) => {
      const trans = await routerContract.quote(
        CONFIG.nftAddr,
        tokenId,
        ethers.utils.parseEther(price + ''),
        depositExpire,
        Math.trunc(redeemExpire)
      )
      await trans.wait(1)
      listApplies()
    },
    [routerContract, listApplies]
  )

  useEffect(() => {
    if (account) {
      listApplies()
    }
  }, [listApplies, account])

  return {
    applies,
    setPrice,
    listApplies
  }
}

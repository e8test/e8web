import { useMemo, useCallback, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { Message } from '@arco-design/web-react'
import { ethers } from 'ethers'

import CONFIG, { currentRouter, currentDAO } from '@/config'
import NFTABI from '@/libs/abis/nft.json'
import ROUTERABI from '@/libs/abis/router.json'
import DAOABI from '@/libs/abis/dao.json'
import useMemoState from './useMemoState'

export default function useApplies() {
  const [applies, setApplies] = useMemoState<IApply[]>('applies', [])
  const { account, library } = useWeb3React<Web3Provider>()

  const nftContract = useMemo(() => {
    return new ethers.Contract(CONFIG.nftAddr, NFTABI, library?.getSigner())
  }, [library])

  const routerContract = useMemo(() => {
    return new ethers.Contract(
      currentRouter,
      ROUTERABI,
      library?.getSigner()
    )
  }, [library])

  const daoContract = useMemo(() => {
    return new ethers.Contract(
      currentDAO,
      DAOABI,
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

  const quoteHistory = useCallback(async (tokenId: number) => {
    const count = await daoContract.quoteCount(CONFIG.nftAddr, tokenId)
    const actions = []
    for (let i = 1; i <= count.toNumber(); i++) {
      actions.push(daoContract.queryQuote(CONFIG.nftAddr, tokenId, i))
    }
    const items = await Promise.all(actions)
    const rows = items.map(item => ({
      addr: item[0],
      value: Number(ethers.utils.formatUnits(item[1]))
    }))
    return rows
  }, [daoContract])

  const listApplies = useCallback(async () => {
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
    const quoteActions = []
    for (const info of infos) {
      nftActions.push(getNFT(info.tokenId))
      quoteActions.push(quoteHistory(info.tokenId))
    }
    const nfts = await Promise.all(nftActions)
    const quotes = await Promise.all(quoteActions)
    console.log('=============quotes=============')
    console.log(quotes)
    const rows = infos
      .map((info, i) => ({
        tokenId: info.tokenId.toNumber(),
        quote: Number(ethers.utils.formatUnits(info.quote)),
        timestamp: info.timestamp.toNumber(),
        token: info.token,
        uri: nfts[i].uri,
        quotes: quotes[i],
        owner: nfts[i].owner
      }))
      .reverse()
    console.log('=============applies=============')
    console.log(rows)
    setApplies(rows)
    handle()
  }, [routerContract, setApplies, quoteHistory, getNFT])

  // 估价
  const pricing = useCallback(async (tokenId: number, value: number) => {
    const trans = await daoContract.pricing(
      CONFIG.nftAddr,
      tokenId,
      ethers.utils.parseEther(value.toString())
    )
    await trans.wait(1)
    listApplies()
  }, [daoContract, listApplies])

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
      // routerContract.setDao('0xaebF1be0527F39a5446BaBa4cF6Cc2bbb8B18a02')
    }
  }, [listApplies, account, routerContract])

  return {
    applies,
    setPrice,
    pricing,
    listApplies
  }
}

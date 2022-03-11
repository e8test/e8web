import { useMemo, useCallback, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import { Message } from '@arco-design/web-react'

import CONFIG from '@/config'
import ERC20ABI from '@/libs/abis/erc20.json'
import NFTABI from '@/libs/abis/nft.json'
import AUCTIONABI from '../libs/abis/auctions.json'
import useMemoState from './useMemoState'

export default function useAuctions() {
  const [auctions, setAuctions] = useMemoState<IAuction[]>('auctions', [])
  const { account, library } = useWeb3React<Web3Provider>()
  const [balance, setBalance] = useMemoState<number>('tokenBalance', 0)
  const [owner, setOwner] = useMemoState<string>('auctionOwner', '')
  const [allowance, setAllowance] = useMemoState<number>('tokenBalance', 0)

  const nftContract = useMemo(() => {
    return new ethers.Contract(CONFIG.nftAddr, NFTABI, library?.getSigner())
  }, [library])

  const auctionContract = useMemo(() => {
    return new ethers.Contract(
      CONFIG.auctions,
      AUCTIONABI,
      library?.getSigner()
    )
  }, [library])

  const tokenContract = useMemo(() => {
    return new ethers.Contract(CONFIG.tokenAddr, ERC20ABI, library?.getSigner())
  }, [library])

  const getUser = useCallback(async () => {
    if (account) {
      const [balance, allowance] = await Promise.all([
        tokenContract.balanceOf(account),
        tokenContract.allowance(account, CONFIG.auctions)
      ])
      setBalance(Number(ethers.utils.formatUnits(balance)))
      setAllowance(Number(ethers.utils.formatUnits(allowance)))
    }
  }, [tokenContract, account, setBalance, setAllowance])

  const getOwner = useCallback(async () => {
    const owner = await auctionContract.owner()
    console.log('=============auctions owner=============')
    console.log(owner)
    setOwner(owner)
  }, [auctionContract, setOwner])

  const getItem = useCallback(
    async (index: number) => {
      const [result, status] = await Promise.all([
        auctionContract.auctions(index),
        auctionContract.getAuctionStatus(index)
      ])
      const uri = await nftContract.tokenURI(result.tokenId)
      const obj: IAuction = {
        index,
        bidTimes: result.bidTimes.toNumber(),
        lastPrice: Number(ethers.utils.formatUnits(result.lastPrice)),
        previous: result.previous.toNumber(),
        startingPrice: Number(ethers.utils.formatUnits(result.startingPrice)),
        timeout: result.timeout.toNumber() * 1000,
        token: result.token,
        tokenId: result.tokenId.toNumber(),
        uri,
        status: status.status.toNumber(),
        winner: status.winner
      }
      return obj
    },
    [auctionContract, nftContract]
  )

  const list = useCallback(async () => {
    const handle = Message.loading({
      content: 'Loading...',
      duration: 0
    })
    const rows: IAuction[] = []
    let index = await auctionContract.lastAuctionIndex()
    if (index.toNumber() > 0) {
      let item = await getItem(index.toNumber())
      rows.push(item)
      while (item.previous > 0) {
        item = await getItem(item.previous)
        rows.push(item)
      }
    }
    console.log('=============auctions=============')
    setAuctions(rows.reverse())
    console.log(rows)
    handle()
  }, [auctionContract, getItem, setAuctions])

  const bid = useCallback(
    async (index: number, price: number) => {
      const priceValue = ethers.utils.parseEther(price.toString())
      const trans = await auctionContract.bid(index, priceValue)
      await trans.wait(1)
      list()
      getUser()
    },
    [auctionContract, list, getUser]
  )

  const approve = useCallback(async () => {
    const trans = await tokenContract.approve(
      CONFIG.auctions,
      ethers.constants.MaxUint256
    )
    await trans.wait(1)
    list()
    getUser()
  }, [tokenContract, getUser, list])

  const takeAway = useCallback(
    async (index: number) => {
      const trans = await auctionContract.takeAwayNFT(index)
      await trans.wait(1)
      list()
      getUser()
    },
    [auctionContract, getUser, list]
  )

  const destroy = useCallback(
    async (index: number) => {
      const trans = await auctionContract.destory(index)
      await trans.wait(1)
      list()
      getUser()
    },
    [auctionContract, getUser, list]
  )

  useEffect(() => {
    if (library) {
      list()
      getUser()
      getOwner()
    }
  }, [list, getUser, library, getOwner])

  return {
    auctions,
    balance,
    allowance,
    owner,
    bid,
    approve,
    list,
    takeAway,
    destroy
  }
}

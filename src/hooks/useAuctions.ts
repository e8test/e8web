import { useMemo, useCallback, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import { Message } from '@arco-design/web-react'

import CONFIG, { currentAuction } from '@/config'
import ERC20ABI from '@/libs/abis/erc20.json'
import NFTABI from '@/libs/abis/nft.json'
import AUCTIONABI from '../libs/abis/auctions.json'
import useMemoState from './useMemoState'

export default function useAuctions() {
  const [auctions, setAuctions] = useMemoState<IAuction[]>('auctions', [])
  const [mine, setMine] = useMemoState<IAuction[]>('mine', [])
  const { account, library } = useWeb3React<Web3Provider>()
  const [balance, setBalance] = useMemoState<number>('tokenBalance', 0)
  const [owner, setOwner] = useMemoState<string>('auctionOwner', '')
  const [allowance, setAllowance] = useMemoState<number>('tokenBalance', 0)

  const auctionContract = useMemo(() => {
    return new ethers.Contract(currentAuction, AUCTIONABI, library?.getSigner())
  }, [library])

  const tokenContract = useMemo(() => {
    return new ethers.Contract(CONFIG.tokenAddr, ERC20ABI, library?.getSigner())
  }, [library])

  const getUser = useCallback(async () => {
    if (account) {
      const [balance, allowance] = await Promise.all([
        tokenContract.balanceOf(account),
        tokenContract.allowance(account, currentAuction)
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
    async (index: number, account = '') => {
      let result: any
      if (account) {
        result = await auctionContract.participatedAuctionByAddress(
          account,
          index
        )
      } else {
        result = await auctionContract.auctionByIndex(index)
      }
      const contract = new ethers.Contract(
        result.token,
        NFTABI,
        library?.getSigner()
      )
      const uri = await contract.tokenURI(result.tokenId)
      const obj: IAuction = {
        index,
        bidTimes: result.bidTimes.toNumber(),
        lastPrice: Number(ethers.utils.formatUnits(result.lastPrice)),
        lastBidder: result.lastBidder,
        startingPrice: Number(ethers.utils.formatUnits(result.startingPrice)),
        timeout: result.timeout.toNumber() * 1000,
        token: result.token,
        tokenId: result.tokenId.toNumber(),
        uri,
        status: result.status
      }
      return obj
    },
    [auctionContract, library]
  )

  const listAll = useCallback(async () => {
    const handle = Message.loading({
      content: 'Loading...',
      duration: 0
    })
    let rows: IAuction[] = []
    let index = await auctionContract.lastAuctionIndex()
    if (index.toNumber() > 0) {
      const actions = []
      for (let i = index.toNumber(); i >= 1; i--) {
        actions.push(getItem(i))
      }
      rows = await Promise.all(actions)
    }
    console.log('=============all auctions=============')
    console.log(rows)
    handle()
    setAuctions(rows)
  }, [auctionContract, getItem, setAuctions])

  const listMine = useCallback(async () => {
    const handle = Message.loading({
      content: 'Loading...',
      duration: 0
    })
    let rows: IAuction[] = []
    const count = await auctionContract.auctionCountByAddress(account)
    if (count.toNumber() > 0) {
      const actions = []
      for (let i = count.toNumber(); i >= 1; i--) {
        actions.push(getItem(i, account))
      }
      rows = await Promise.all(actions)
    }
    console.log('=============my auctions=============')
    console.log(rows)
    handle()
    setMine(rows)
  }, [auctionContract, getItem, account, setMine])

  const bid = useCallback(
    async (index: number, price: number) => {
      const priceValue = ethers.utils.parseEther(price.toString())
      const trans = await auctionContract.bid(index, priceValue)
      await trans.wait(1)
      listAll()
      getUser()
    },
    [auctionContract, listAll, getUser]
  )

  const approve = useCallback(async () => {
    const trans = await tokenContract.approve(
      currentAuction,
      ethers.constants.MaxUint256
    )
    await trans.wait(1)
    listAll()
    getUser()
  }, [tokenContract, getUser, listAll])

  const takeAway = useCallback(
    async (index: number) => {
      const trans = await auctionContract.takeAwayNFT(index)
      await trans.wait(1)
      listAll()
      listMine()
      getUser()
    },
    [auctionContract, getUser, listAll, listMine]
  )

  const destroy = useCallback(
    async (index: number) => {
      const trans = await auctionContract.destory(index)
      await trans.wait(1)
      listAll()
      getUser()
    },
    [auctionContract, getUser, listAll]
  )

  const downgrade = useCallback(
    async (index: number) => {
      const trans = await auctionContract.downgrade(index)
      await trans.wait(1)
      listAll()
      getUser()
    },
    [auctionContract, getUser, listAll]
  )

  useEffect(() => {
    if (library) {
      getUser()
      getOwner()
    }
  }, [getUser, library, getOwner])

  return {
    auctions,
    balance,
    allowance,
    owner,
    mine,
    bid,
    approve,
    listAll,
    takeAway,
    destroy,
    downgrade,
    listMine
  }
}

import { useMemo, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { Message } from '@arco-design/web-react'
import { BigNumber, ethers } from 'ethers'

import CONFIG, { currentRouter } from '@/config'
import NFTABI from '@/libs/abis/nft.json'
import ERC20ABI from '@/libs/abis/erc20.json'
import ROUTERABI from '@/libs/abis/router.json'
import useMemoState from './useMemoState'

export default function useNFTs() {
  const [nfts, setNfts] = useMemoState<INFT[]>('nfts', [])
  const [deposits, setDeposits] = useMemoState<INFT[]>('deposits')
  const [depositApproved, setDepositApproved] = useMemoState<boolean>(
    'depositApproved',
    false
  )
  const { account, library } = useWeb3React<Web3Provider>()

  const nftContract = useMemo(() => {
    return new ethers.Contract(CONFIG.nftAddr, NFTABI, library?.getSigner())
  }, [library])

  const routerContract = useMemo(() => {
    return new ethers.Contract(currentRouter, ROUTERABI, library?.getSigner())
  }, [library])

  const tokenContract = useMemo(() => {
    return new ethers.Contract(CONFIG.tokenAddr, ERC20ABI, library?.getSigner())
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
      const isApproved = result[1] === currentRouter
      const [quote, value, depositExpire, redeemExpire, lastApply] = result[2]
      const depositExpireTime = depositExpire.toNumber() * 1000
      const redeemExpireTime = redeemExpire.toNumber() * 1000
      const lastApplyTime = lastApply.toNumber() * 1000
      const info: INFT = {
        tokenId: tokenId.toNumber(),
        uri,
        isApproved,
        owner: account!,
        quote: Number(ethers.utils.formatUnits(quote)),
        price: Number(ethers.utils.formatUnits(value)),
        depositExpire: depositExpireTime,
        redeemExpire: redeemExpireTime,
        lastApplyTime,
        timestamp: 0
      }
      return info
    },
    [nftContract, routerContract, account]
  )

  const getDepositIndex = useCallback(
    async (tokenId: number) => {
      const status = await routerContract.getNFTStatus(CONFIG.nftAddr, tokenId)
      let index = await routerContract.findDepositPosition(status[3])
      return index
    },
    [routerContract]
  )

  // 获取NFT列表
  const listNFTs = useCallback(async () => {
    const handle = Message.loading({
      content: 'Loading...',
      duration: 0
    })
    const count = await nftContract.balanceOf(account)
    const idActions = []
    for (let i = 0; i < count; i++) {
      idActions.push(nftContract.tokenOfOwnerByIndex(account, i))
    }
    const ids = await Promise.all(idActions)
    const infoActions = []
    for (const id of ids) {
      infoActions.push(getNFT(id))
    }
    const rows = await Promise.all(infoActions.reverse())
    console.log('=============nfts=============')
    console.log(rows)
    setNfts(rows)
    handle()
  }, [nftContract, account, getNFT, setNfts])

  // 获取抵押列表
  const listDeposits = useCallback(async () => {
    const handle = Message.loading({
      content: 'Loading...',
      duration: 0
    })
    const [count, allowance] = await Promise.all([
      routerContract.getDepositedCount(account),
      tokenContract.allowance(account, currentRouter)
    ])
    const indexActions = []
    for (let i = 0; i < count.toNumber(); i++) {
      indexActions.push(
        routerContract.getDepositedNFTIndexByPositionOfOwner(account, i)
      )
    }
    const indexResult = await Promise.all(indexActions)
    const idActions = indexResult.map(index =>
      routerContract.getDepositedNFTByIndex(index)
    )
    const idResult = await Promise.all(idActions)
    const ids = idResult.map(item => item.tokenId)
    const infoActions = []
    for (const id of ids) {
      infoActions.push(getNFT(id))
    }
    let rows = await Promise.all(infoActions)
    rows = rows
      .map((row, index) => ({
        ...row,
        timestamp: idResult[index].timestamp.toNumber() * 1000
      }))
      .reverse()
    setDepositApproved(allowance.gt(0))
    setDeposits(rows)
    console.log('=============deposits=============')
    console.log(rows)
    handle()
    return rows
  }, [
    routerContract,
    tokenContract,
    setDepositApproved,
    getNFT,
    setDeposits,
    account
  ])

  const approve = useCallback(
    async (tokenId: number) => {
      const trans = await nftContract.approve(currentRouter, tokenId)
      await trans.wait(1)
    },
    [nftContract]
  )

  const add = useCallback(
    async (tokenId: number, uri: string) => {
      const trans = await nftContract.mint(tokenId, uri)
      await trans.wait(1)
      listNFTs()
    },
    [nftContract, listNFTs]
  )

  const applyValuation = useCallback(
    async (tokenId: number, quote: number) => {
      const trans = await routerContract.applyValuation(
        CONFIG.nftAddr,
        tokenId,
        ethers.utils.parseEther(quote.toString())
      )
      await trans.wait(1)
      listNFTs()
    },
    [routerContract, listNFTs]
  )

  const deposit = useCallback(
    async (tokenId: number) => {
      const index = await getDepositIndex(tokenId)
      console.log('=============deposit info=============')
      console.log('tokenId', tokenId, 'index', index.toNumber())
      const trans = await routerContract.deposit(CONFIG.nftAddr, tokenId, index)
      await trans.wait(1)
      listNFTs()
    },
    [routerContract, getDepositIndex, listNFTs]
  )

  const approveRedemption = useCallback(async () => {
    const trans = await tokenContract.approve(
      currentRouter,
      ethers.constants.MaxUint256
    )
    await trans.wait(1)
    listDeposits()
  }, [tokenContract, listDeposits])

  const redemption = useCallback(
    async (tokenId: number) => {
      const trans = await routerContract.redemption(CONFIG.nftAddr, tokenId)
      await trans.wait(1)
      listDeposits()
      listNFTs()
    },
    [routerContract, listDeposits, listNFTs]
  )

  return {
    nfts,
    deposits,
    depositApproved,
    listNFTs,
    listDeposits,
    approve,
    add,
    applyValuation,
    deposit,
    approveRedemption,
    redemption
  }
}

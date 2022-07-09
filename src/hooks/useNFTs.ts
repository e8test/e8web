import { useMemo, useState, useCallback, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { Message } from '@arco-design/web-react'
import { BigNumber, ethers } from 'ethers'
import { Multicall } from 'ethereum-multicall'
import {
  CallContext,
  ContractCallContext
} from 'ethereum-multicall/dist/esm/models'

import CONFIG, { currentRouter } from '@/config'
import NFTABI from '@/libs/abis/nft.json'
import ERC20ABI from '@/libs/abis/erc20.json'
import ROUTERABI from '@/libs/abis/router.json'
import useMemoState from './useMemoState'
import { useProvider } from '@/libs/wallet/hooks'

export default function useNFTs() {
  const provider = useProvider()
  const [locals, setLocals] = useState<LocalAddr[]>(
    JSON.parse(localStorage.getItem('nfts') || '[]')
  )
  const [nfts, setNfts] = useMemoState<INFT[]>('nfts', [])
  const [deposits, setDeposits] = useMemoState<INFT[]>('deposits')
  const [depositApproved, setDepositApproved] = useMemoState<boolean>(
    'depositApproved',
    false
  )
  const { account, library } = useWeb3React<Web3Provider>()

  const multicall = useMemo(() => {
    return new Multicall({
      ethersProvider: provider
    })
  }, [provider])

  const routerContract = useMemo(() => {
    return new ethers.Contract(currentRouter, ROUTERABI, library?.getSigner())
  }, [library])

  const tokenContract = useMemo(() => {
    return new ethers.Contract(CONFIG.tokenAddr, ERC20ABI, library?.getSigner())
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
      const [quote, value, depositExpire, redeemExpire, lastApply] = result[2]
      const depositExpireTime = depositExpire.toNumber() * 1000
      const redeemExpireTime = redeemExpire.toNumber() * 1000
      const lastApplyTime = lastApply.toNumber() * 1000
      const info: INFT = {
        tokenId: tokenId.toNumber(),
        uri,
        addr: addr,
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
    [routerContract, account, library]
  )

  const getDepositIndex = useCallback(
    async (tokenId: number, addr: string) => {
      const status = await routerContract.getNFTStatus(addr, tokenId)
      let index = await routerContract.findDepositPosition(status[3])
      return index
    },
    [routerContract]
  )

  const nftAddrs = useCallback(() => {
    let addrs = [CONFIG.nftAddr]
    try {
      const local = locals
        .filter((item: any) => item.account === account)
        .map((item: any) => item.addr)
      addrs = local.concat(addrs)
    } catch (error) {}
    return addrs
  }, [account, locals])

  const listAllNFTs = useCallback(async () => {
    const handle = Message.loading({
      content: 'Loading...',
      duration: 0
    })
    const countContext = nftAddrs().map(addr => ({
      reference: addr,
      contractAddress: addr,
      abi: NFTABI,
      calls: [
        {
          reference: 'balanceOf',
          methodName: 'balanceOf',
          methodParameters: [account]
        }
      ]
    }))
    const countResult = await multicall.call(countContext)
    const idContexts: ContractCallContext[] = []
    for (const addr in countResult.results) {
      const item = countResult.results[addr]
      const count = BigNumber.from(
        item.callsReturnContext[0].returnValues[0]
      ).toNumber()
      const calls: CallContext[] = []
      for (let i = 0; i < count; i++) {
        calls.push({
          reference: 'tokenOfOwnerByIndex',
          methodName: 'tokenOfOwnerByIndex',
          methodParameters: [account, i]
        })
      }
      idContexts.push({
        reference: addr,
        contractAddress: addr,
        abi: NFTABI,
        calls
      })
    }
    const idResult = await multicall.call(idContexts)
    const infoContexts: ContractCallContext[] = []
    const routerCalls: CallContext[] = []
    for (const addr in idResult.results) {
      const item = idResult.results[addr]
      const infoCalls: CallContext[] = []
      for (const row of item.callsReturnContext) {
        const id = row.returnValues[0]
        const idString = BigNumber.from(id).toString()
        infoCalls.push({
          reference: idString,
          methodName: 'tokenURI',
          methodParameters: [id]
        })
        infoCalls.push({
          reference: idString,
          methodName: 'getApproved',
          methodParameters: [id]
        })
        routerCalls.push({
          reference: idString,
          methodName: 'getNFTStatus',
          methodParameters: [addr, id]
        })
      }
      infoContexts.push({
        reference: addr,
        contractAddress: addr,
        abi: NFTABI,
        calls: infoCalls
      })
    }
    infoContexts.push({
      reference: currentRouter,
      contractAddress: currentRouter,
      abi: ROUTERABI,
      calls: routerCalls
    })
    const infoResult = await multicall.call(infoContexts)
    const items: Record<string, INFT> = {}
    for (const addr in infoResult.results) {
      if (addr === currentRouter) continue
      const item = infoResult.results[addr]
      for (const row of item.callsReturnContext) {
        if (!items[row.reference]) {
          items[row.reference] = {
            tokenId: Number(row.reference),
            uri: '',
            addr,
            isApproved: false,
            owner: account!,
            quote: 0,
            price: 0,
            depositExpire: 0,
            redeemExpire: 0,
            lastApplyTime: 0,
            timestamp: 0
          }
        }
      }
      for (const row of item.callsReturnContext) {
        const nft = items[row.reference]
        if (row.methodName === 'tokenURI') {
          nft.uri = row.returnValues[0]
        }
        if (row.methodName === 'getApproved') {
          nft.isApproved = row.returnValues[0] === currentRouter
        }
      }
    }
    for (const row of infoResult.results[currentRouter]?.callsReturnContext ||
      []) {
      const nft = items[row.reference]
      const [quote, value, depositExpire, redeemExpire, lastApply] =
        row.returnValues
      const depositExpireTime = BigNumber.from(depositExpire).toNumber() * 1000
      const redeemExpireTime = BigNumber.from(redeemExpire).toNumber() * 1000
      const lastApplyTime = BigNumber.from(lastApply).toNumber() * 1000
      nft.depositExpire = depositExpireTime
      nft.redeemExpire = redeemExpireTime
      nft.lastApplyTime = lastApplyTime
      nft.quote = Number(ethers.utils.formatUnits(BigNumber.from(quote)))
      nft.price = Number(ethers.utils.formatUnits(BigNumber.from(value)))
    }
    const nfts = Object.values(items).reverse()
    console.log('=============all nfts=============')
    console.log(nfts)
    setNfts(nfts)
    handle()
  }, [nftAddrs, setNfts, multicall, account])

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
    const infoActions = []
    for (const item of idResult) {
      infoActions.push(getNFT(item.id, item.token))
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
    async (tokenId: number, addr: string) => {
      const contract = new ethers.Contract(addr, NFTABI, library?.getSigner())
      const trans = await contract.approve(currentRouter, tokenId)
      await trans.wait(1)
    },
    [library]
  )

  const add = useCallback(
    async (tokenId: number, uri: string) => {
      const contract = new ethers.Contract(
        CONFIG.nftAddr,
        NFTABI,
        library?.getSigner()
      )
      const trans = await contract.mint(tokenId, uri)
      await trans.wait(1)
      listAllNFTs()
    },
    [library, listAllNFTs]
  )

  const applyValuation = useCallback(
    async (tokenId: number, quote: number, addr: string) => {
      const trans = await routerContract.applyValuation(
        addr,
        tokenId,
        ethers.utils.parseEther(quote.toString())
      )
      await trans.wait(1)
      listAllNFTs()
    },
    [routerContract, listAllNFTs]
  )

  const deposit = useCallback(
    async (tokenId: number, addr: string) => {
      const index = await getDepositIndex(tokenId, addr)
      console.log('=============deposit info=============')
      console.log('tokenId', tokenId, 'index', index.toNumber())
      const trans = await routerContract.deposit(addr, tokenId, index)
      await trans.wait(1)
      listAllNFTs()
    },
    [routerContract, getDepositIndex, listAllNFTs]
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
    async (tokenId: number, addr: string) => {
      const trans = await routerContract.redemption(addr, tokenId)
      await trans.wait(1)
      listDeposits()
      listAllNFTs()
    },
    [routerContract, listDeposits, listAllNFTs]
  )

  const importNFT = useCallback(
    async (addr: string) => {
      if (
        nftAddrs()
          .map(item => item.toLowerCase())
          .includes(addr.toLowerCase())
      ) {
        return false
      }
      const contract = new ethers.Contract(addr, NFTABI, library?.getSigner())
      let count = await contract.balanceOf(account)
      count = count.toNumber()
      const actions = []
      for (let i = 0; i < count; i++) {
        actions.push(contract.tokenOfOwnerByIndex(account, i))
      }
      const result = await Promise.all(actions)
      if (result.length > 0) {
        locals.unshift({
          addr,
          account: account!
        })
        setLocals([...locals])
        return true
      }
      return false
    },
    [account, library, nftAddrs, locals]
  )

  const delImport = useCallback(
    (addr: string) => {
      const addrs = locals.filter(item => item.addr !== addr)
      setLocals(addrs)
    },
    [locals]
  )

  useEffect(() => {
    localStorage.setItem('nfts', JSON.stringify(locals))
  }, [locals])

  return {
    nfts,
    deposits,
    locals,
    nftAddrs,
    depositApproved,
    listDeposits,
    approve,
    add,
    applyValuation,
    deposit,
    approveRedemption,
    redemption,
    listAllNFTs,
    importNFT,
    delImport
  }
}

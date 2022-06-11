import { useMemo, useCallback, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { ethers } from 'ethers'

import CONFIG, { currentDAO } from '@/config'
import DAOABI from '@/libs/abis/dao.json'
import ERC20ABI from '@/libs/abis/erc20.json'

export default function useDAO() {
  const { account, library } = useWeb3React<Web3Provider>()
  const [isMember, setIsMember] = useState(false)
  const [balance, setBalance] = useState(0)
  const [deposits, setDeposits] = useState(0)
  const [allowance, setAllowance] = useState(0)
  const [daoLimit, setDaoLimit] = useState(0)
  const [loading, setLoading] = useState(false)
  const [doing, setDoing] = useState<'deposit' | 'quit' | 'approve'>()

  const daoContract = useMemo(() => {
    return new ethers.Contract(currentDAO, DAOABI, library?.getSigner())
  }, [library])

  const tokenContract = useMemo(() => {
    return new ethers.Contract(CONFIG.e8tAddr, ERC20ABI, library?.getSigner())
  }, [library])

  // 是否为DAO成员
  const isDaoMember = useCallback(async () => {
    if (!account) return
    const result = await daoContract.isDaoMember(account)
    setIsMember(result)
  }, [account, daoContract])

  // E8T余额
  const balanceOf = useCallback(async () => {
    const result = await tokenContract.balanceOf(account)
    const value = Number(ethers.utils.formatUnits(result))
    setBalance(value)
  }, [tokenContract, account])

  // 我的抵押
  const myDeposit = useCallback(async () => {
    const result = await daoContract.balanceOf(account)
    const value = Number(ethers.utils.formatUnits(result))
    setDeposits(value)
  }, [account, daoContract])

  // 授权数量
  const myAllowance = useCallback(async () => {
    const result = await tokenContract.allowance(account, currentDAO)
    const value = Number(ethers.utils.formatUnits(result))
    setAllowance(value)
  }, [tokenContract, account])

  // dao member抵押数量
  const getDaoLimit = useCallback(async () => {
    const result = await daoContract.lastDaoMemberDepositCount()
    const value = Number(ethers.utils.formatUnits(result))
    setDaoLimit(value)
  }, [daoContract])

  const fetchData = useCallback(async () => {
    if (!account) return
    setLoading(true)
    try {
      await Promise.all([
        isDaoMember(),
        balanceOf(),
        myDeposit(),
        myAllowance(),
        getDaoLimit()
      ])
    } finally {
      setLoading(false)
    }
  }, [isDaoMember, balanceOf, myDeposit, myAllowance, getDaoLimit, account])

  // 抵押
  const deposit = useCallback(
    async (count: number) => {
      setDoing('deposit')
      try {
        const value = ethers.utils.parseEther(count.toString())
        const previous = await daoContract.findBalancePosition(count)
        console.log(value.toString(), previous, account)
        const trans = await daoContract.deposit(value, previous)
        await trans.wait(1)
        fetchData()
      } catch (error) {
        console.trace(error)
      } finally {
        setDoing(undefined)
      }
    },
    [daoContract, account, fetchData]
  )

  // 退出抵押
  const quit = useCallback(async () => {
    setDoing('quit')
    try {
      const previous = await daoContract.findPrevious(account)
      const trans = await daoContract.quit(previous)
      await trans.wait(1)
      fetchData()
    } catch (error) {
    } finally {
      setDoing(undefined)
    }
  }, [daoContract, account, fetchData])

  // 授权
  const approve = useCallback(async () => {
    setDoing('approve')
    try {
      const trans = await tokenContract.approve(
        currentDAO,
        ethers.constants.MaxUint256
      )
      await trans.wait(1)
      fetchData()
    } catch (error) {
    } finally {
      setDoing(undefined)
    }
  }, [tokenContract, fetchData])

  return {
    loading,
    isMember,
    balance,
    deposits,
    doing,
    daoLimit,
    allowance,
    isDaoMember,
    deposit,
    approve,
    quit,
    fetchData
  }
}

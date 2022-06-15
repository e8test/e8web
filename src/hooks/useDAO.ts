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
  const [members, setMembers] = useState<{ addr: string; value: number }[]>([])
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

  const getMembers = useCallback(async () => {
    const members: string[] = []
    const valid = (addr: string) => {
      return /^0x(0){40}$/.test(addr) === false
    }
    const first = await daoContract.first()
    if (valid(first)) {
      members.push(first)
      const second = await daoContract.next(first)
      if (valid(second)) {
        members.push(second)
        const third = await daoContract.next(second)
        if (valid(third)) members.push(third)
      }
    }
    const actions = members.map(item => daoContract.balanceOf(item))
    const result = await Promise.all(actions)
    const rows = members.map((item, i) => ({
      addr: item,
      value: Number(ethers.utils.formatUnits(result[i]))
    }))
    console.log('=========members=========')
    console.log(rows)
    setMembers(rows)
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
        getDaoLimit(),
        getMembers()
      ])
    } finally {
      setLoading(false)
    }
  }, [
    isDaoMember,
    balanceOf,
    myDeposit,
    myAllowance,
    getDaoLimit,
    getMembers,
    account
  ])

  // 抵押
  const deposit = useCallback(
    async (count: number, deposited: number) => {
      setDoing('deposit')
      try {
        const value = ethers.utils.parseEther((count + deposited).toString())
        const previous = await daoContract.findBalancePosition(value)
        console.log(value.toString(), previous, account)
        const trans = await daoContract.deposit(
          ethers.utils.parseEther(count.toString()),
          previous
        )
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
    members,
    isDaoMember,
    deposit,
    approve,
    quit,
    fetchData
  }
}

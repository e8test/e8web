import { useMemo, useCallback, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { Message } from '@arco-design/web-react'
import { ethers } from 'ethers'

import { currentRouter } from '@/config'
import NFTABI from '@/libs/abis/nft.json'
import ROUTERABI from '@/libs/abis/router.json'
import useMemoState from './useMemoState'

export default function useDowngrades() {
  const [downgrades, setDowngrades] = useMemoState<IDowngrade[]>(
    'downgrades',
    []
  )
  const { account, library } = useWeb3React<Web3Provider>()

  const routerContract = useMemo(() => {
    return new ethers.Contract(currentRouter, ROUTERABI, library?.getSigner())
  }, [library])

  const getNFT = useCallback(
    async (tokenId: number, addr: string) => {
      const contract = new ethers.Contract(
        addr,
        NFTABI,
        library?.getSigner()
      )
      const [uri, owner] = await Promise.all([
        contract.tokenURI(tokenId),
        contract.ownerOf(tokenId)
      ])
      return { uri, owner }
    },
    [library]
  )

  const listDowngrades = useCallback(async () => {
    const handle = Message.loading({
      content: 'Loading...',
      duration: 0
    })
    const count = await routerContract.lastDegradedIndex()
    const idActions = []
    for (let i = 1; i <= count.toNumber(); i++) {
      idActions.push(routerContract.getDegradedNFTByIndex(i))
    }
    const infos = await Promise.all(idActions)
    const nftActions = []
    for (const info of infos) {
      nftActions.push(getNFT(info[1], info[0]))
    }
    const nfts = await Promise.all(nftActions)
    const rows = infos
      .map((info, i) => ({
        tokenId: info[1].toNumber(),
        token: info[0],
        uri: nfts[i].uri,
        owner: nfts[i].owner
      }))
      .reverse()
    console.log('=============downgrades=============')
    console.log(rows)
    setDowngrades(rows)
    handle()
  }, [routerContract, setDowngrades, getNFT])

  const withdrawNFT = useCallback(
    async (tokenId: number, addr: string) => {
      const trans = await routerContract.withdrawNFT(
        account,
        addr,
        tokenId
      )
      await trans.wait(1)
      listDowngrades()
    },
    [account, listDowngrades, routerContract]
  )

  useEffect(() => {
    if (account) {
      listDowngrades()
    }
  }, [listDowngrades, account, routerContract])

  return {
    downgrades,
    listDowngrades,
    withdrawNFT
  }
}

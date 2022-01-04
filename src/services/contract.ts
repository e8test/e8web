import BN from 'bignumber.js'

import config from '../config'
import store from '../store'
import * as wallet from './wallet'

const decimals = Math.pow(10, 18)

export async function balanceOf() {
  const result = await wallet.nft.methods.balanceOf(store.account).call()
  return result
}

export async function getTokenId(index: number) {
  const result = await wallet.nft.methods
    .tokenOfOwnerByIndex(store.account, index)
    .call()
  return result
}

export async function loadNFT(tokenId: number) {
  const result = await wallet.nft.methods.tokenURI(tokenId).call()
  return result
}

export async function isApprovedForAll() {
  const result = await wallet.nft.methods
    .isApprovedForAll(store.account, config.routerAddr)
    .call()
  return result
}

export async function isApproved(tokenId: number) {
  const result = await wallet.nft.methods.getApproved(tokenId).call()
  return result === config.routerAddr
}

export async function getPrice(tokenId: number) {
  const { value, expire } = await wallet.router.methods
    .getPrice(config.nftAddr, tokenId)
    .call()
  const price = new BN(value).div(decimals).toNumber()
  return {
    value: price,
    expire: Number(expire)
  }
}

export async function getStatus(tokenId: number) {
  let { value, expire, deposited } = await wallet.router.methods.getNFTStatus(config.nftAddr, tokenId).call()
  value = new BN(value).div(decimals).toNumber()
  expire = Number(expire)
  return {
    price: value,
    expire,
    deposited
  }
}

export async function mint(tokenId: number, uri: string) {
  const result = await wallet.nft.methods
    .mint(tokenId, uri)
    .send({ from: store.account })
  return result
}

export async function approve(tokenId: number) {
  const result = await wallet.nft.methods
    .approve(config.routerAddr, tokenId)
    .send({ from: store.account })
  return result
}

export async function deposit(tokenId: number) {
  const result = await wallet.router.methods
    .deposit(config.nftAddr, tokenId)
    .send({ from: store.account })
  return result
}

export async function setPrice(
  tokenId: number,
  value: number,
  expires: number
) {
  const result = await wallet.router.methods
    .setPrice(config.nftAddr, tokenId, value, expires)
    .send({
      from: store.account
    })
  return result
}

export async function getNft(tokenId: number) {
  const [uri, approved, status] = await Promise.all([
    loadNFT(tokenId),
    isApproved(tokenId),
    getStatus(tokenId)
  ])
  return {
    tokenId,
    uri,
    approved,
    ...status
  }
}

export async function tokenInfo() {
  let reserve = await wallet.token.methods.balanceOf(config.routerAddr).call()
  let totalSupply = await wallet.token.methods.totalSupply().call()
  reserve = new BN(reserve).div(decimals).toNumber()
  totalSupply = new BN(totalSupply).div(decimals).toNumber()
  return {
    reserve,
    totalSupply
  }
}

export async function marketValue() {
  const current = await wallet.router.methods.marketValue().call()
  const value = new BN(current).div(decimals).toNumber()
  console.log('current', value)
  const blockNumber = await wallet.web3.eth.getBlockNumber()
  const logs = await wallet.web3.eth.getPastLogs({
    address: config.routerAddr,
    fromBlock: blockNumber - 4900,
    topics: [config.logAddr]
  })
  const items = []
  const now = Date.now()
  for (let i = 1; i <= 7; i++) {
    const item = {
      time: now - (now % (604800000 * i)) + 86400000,
      value: 0
    }
    for (const log of logs) {
      const data = new BN(log.data).div(decimals).toNumber()
      console.log(data)
    }
    if (i === 1) item.value = value
    items.unshift(item)
  }
  console.log(items)
  for (const log of logs) {
    const data = new BN(log.data).div(decimals).toNumber()
    console.log(data)
  }
  console.log(logs)
}

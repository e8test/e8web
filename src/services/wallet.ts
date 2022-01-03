import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
import { Message } from '@arco-design/web-react'

import config from '../config'
import NftABI from './abi/NftABI'
import ERC20ABI from './abi/ERC20ABI'
import RouterABI from './abi/RouterABI'
import store from '../store'
import * as util from '../libs/util'

export let web3: Web3
export let nft: Contract
export let router: Contract
export let token: Contract

export async function init() {
  if (!web3) {
    await util.sleep(300)
    let provider: any = config.rpc
    if (
      window.web3 &&
      window.web3.currentProvider &&
      window.ethereum &&
      parseInt(window.ethereum.chainId) === config.chainId
    ) {
      provider = window.web3.currentProvider
    }
    if (window.ethereum) {
      window.ethereum.once('chainChanged', () => window.location.reload())
      window.ethereum.once('accountsChanged', () => window.location.reload())
    }
    web3 = new Web3(provider)
    store.chainId = await web3.eth.getChainId()
    let accounts = await web3.eth.getAccounts()
    if (
      window.ethereum &&
      window.ethereum.chainId &&
      parseInt(window.ethereum.chainId) !== config.chainId
    ) {
      return Message.warning(`Please switch to the ${config.chainName}`)
    }
    store.account = accounts[0] || ''
    nft = new web3.eth.Contract(NftABI, config.nftAddr)
    router = new web3.eth.Contract(RouterABI, config.routerAddr)
    token = new web3.eth.Contract(ERC20ABI, config.tokenAddr)
  }
}

export async function connect() {
  if (typeof window.ethereum === 'undefined') {
    return Message.error('请安装MetaMask')
  }
  if (
    window.ethereum &&
    window.ethereum.chainId &&
    parseInt(window.ethereum.chainId) !== config.chainId
  ) {
    return Message.warning(`Please switch to the ${config.chainName}`)
  }
  ethereum.request({ method: 'eth_requestAccounts' })
}

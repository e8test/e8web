import { IConfig } from './models/types'

const config: IConfig = {
  chainId: 97, // 当前链
  options: {
    97: {
      network: 'binance-test', // binance | binance-test
      chainName: 'Binance Smart Chain Testnet',
      rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      nftAddr: '0xB6B83EFa0ac59d085562934a873d784D9BA2949e',
      routerAddr: '0x28BC21f7dE21465aa06A6ba0005ac56FD701A2e3',
      tokenAddr: '0xd7765F498B77d9C8F050BBD78620c33523E703b4'
    },
    56: {
      network: 'binance', // binance | binance-test
      chainName: 'Binance Smart Chain',
      rpc: 'https://bsc-dataseed1.defibit.io/',
      nftAddr: '',
      routerAddr: '',
      tokenAddr: ''
    }
  }
}

const cfg = {
  chainId: config.chainId,
  ...config.options[config.chainId]
}

export default cfg

import { IConfig } from './models/types'

const config: IConfig = {
  chainId: 97, // 当前链
  options: {
    97: {
      network: 'binance-test', // binance | binance-test
      chainName: 'Binance Smart Chain Testnet',
      rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      nftAddr: '0xB6B83EFa0ac59d085562934a873d784D9BA2949e',
      routerAddr: '0xfE16a7903153FD1B3Aa71BDa993BC5Ad7EAdb482',
      tokenAddr: '0xd7765F498B77d9C8F050BBD78620c33523E703b4',
      logAddr: '0x855fddac7e02437f0a70fb21886d84e258ce331cce8154890dd9d805089e60c8'
    },
    56: {
      network: 'binance', // binance | binance-test
      chainName: 'Binance Smart Chain',
      rpc: 'https://bsc-dataseed1.defibit.io/',
      nftAddr: '',
      routerAddr: '',
      tokenAddr: '',
      logAddr: ''
    }
  }
}

const cfg = {
  chainId: config.chainId,
  ...config.options[config.chainId]
}

export default cfg

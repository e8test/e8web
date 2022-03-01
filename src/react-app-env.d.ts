/// <reference types="react-scripts" />

declare interface IConfig {
  current: number
  networks: {
    [chainId: number]: {
      rpc: string
      ethscan: string
      nftAddr: string
      routerAddr: string
      tokenAddr: string
      logAddr: string
    }
  }
}

declare interface INFT {
  quote: number
  depositExpire: number
  redeemExpire: number
  isApproved: boolean
  price: number
  tokenId: number
  uri: string
  owner: string
}

declare interface IApply {
  tokenId: number
  quote: number
  timestamp: number
  token: string
  uri: string
}

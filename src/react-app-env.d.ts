/// <reference types="react-scripts" />

declare interface IConfig {
  current: number
  networks: {
    [chainId: number]: {
      rpc: string
      ethscan: string
      tokenName: string
      nftAddr: string
      auctions: string
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
  lastApplyTime: number
  timestamp: number
}

declare interface IApply {
  tokenId: number
  quote: number
  timestamp: number
  token: string
  uri: string
}

declare interface IAuction {
  index: number
  bidTimes: number
  lastPrice: number
  startingPrice: number
  status: number
  timeout: number
  token: string
  tokenId: number
  uri: string
  status: number
  lastBidder: string
}

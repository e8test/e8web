/// <reference types="react-scripts" />

declare const ethereum: import('@ethersproject/providers').ExternalProvider

declare interface IConfig {
  current: number
  networks: {
    [chainId: number]: {
      rpc: string
      ethscan: string
      tokenName: string
      e8tAddr: string
      nftAddr: string
      auctions: string[]
      pools: string[]
      daos: string[]
      tokenAddr: string
      logAddr: string
      whiteAddr: string
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
  addr: string
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
  quotes: {
    addr: string
    value: number
  }[]
  uri: string
}

declare interface IDowngrade {
  tokenId: number
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

declare interface IWhite {
  addr: string
}

declare interface LocalAddr {
  addr: string
  account: string
}

declare interface IDeposit {
  token: string
  tokenId: number
  uri: string
  owner: string
  timestamp: number
  redeemDeadline: number
  value: number
}

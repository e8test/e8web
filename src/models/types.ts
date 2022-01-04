export interface IBasicConfig {
  network: string
  chainName: string
  rpc: string
  tokenAddr: string
  nftAddr: string
  routerAddr: string
  logAddr: string
}

export interface IConfig {
  chainId: number
  options: {
    [chainId: number]: IBasicConfig
  }
}

export interface INft {
  tokenId: number
  uri: string
  approved: boolean,
  price: number
  expire: number
  deposited: boolean
}
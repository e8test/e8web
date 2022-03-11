const CONFIGS: IConfig = {
  current: 97,
  networks: {
    97: {
      rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      ethscan: 'https://testnet.bscscan.com',
      tokenName: 'E8INDEX',
      nftAddr: '0xB6B83EFa0ac59d085562934a873d784D9BA2949e',
      routerAddr: '0x3a2157E493F9A247345407013eCFF981f877aD1A',
      auctions: '0xd5765a40480d496cd08Caa17c5314EC96Fab4bA6',
      tokenAddr: '0xf8b2BA003C47c997e3ffa4ebb94cf17183c9e190',
      logAddr: '0x855fddac7e02437f0a70fb21886d84e258ce331cce8154890dd9d805089e60c8'
    }
  }
}

const CONFIG = {
  chainId: CONFIGS.current,
  ...CONFIGS.networks[CONFIGS.current]
}

const URLS: any = {}
for (const key in CONFIGS.networks) {
  URLS[key] = CONFIGS.networks[key].rpc
}
const CHAIN_IDS = Object.keys(CONFIGS.networks).map(key => Number(key))
export { CHAIN_IDS, URLS, CONFIGS }
export default CONFIG

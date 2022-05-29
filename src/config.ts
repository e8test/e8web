const CONFIGS: IConfig = {
  current: 97,
  networks: {
    97: {
      rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      ethscan: 'https://testnet.bscscan.com',
      tokenName: 'E8INDEX',
      nftAddr: '0xB6B83EFa0ac59d085562934a873d784D9BA2949e',
      auctions: [
        '0x131DeB28AA5FeD727F6cC339180C9e959662C1d0',
        '0xaA2Cf03c516e39Bf1D0ca5B2830e1F221e74C190',
        '0xc51Fde88dAF5B5673BFeb7212Cdef8f5438FF47a'
      ],
      pools: [
        '0x99ffdD6329D73263541BbE2ea9a48797B703491E',
        '0x57498a629F22246c569376B4a172dd68F1cEB56F',
        '0x11294F8Eae196d431b84438688fCAFb2925c483c'
      ],
      tokenAddr: '0xf8b2BA003C47c997e3ffa4ebb94cf17183c9e190',
      logAddr:
        '0x855fddac7e02437f0a70fb21886d84e258ce331cce8154890dd9d805089e60c8'
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
export const isMobile = window.outerWidth <= 768
export const level = sessionStorage.getItem('level')
  ? Number(sessionStorage.getItem('level'))
  : 3
export const currentRouter = CONFIG.pools[level - 1]
export const currentAuction = CONFIG.auctions[level - 1]
export default CONFIG

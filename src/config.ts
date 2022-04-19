const CONFIGS: IConfig = {
  current: 97,
  networks: {
    97: {
      rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      ethscan: 'https://testnet.bscscan.com',
      tokenName: 'E8INDEX',
      nftAddr: '0xB6B83EFa0ac59d085562934a873d784D9BA2949e',
      routerAddr: '0x8E6B9956F69A4A5DbaE6A50059Fc2C999519C42c',
      auctions: '0xbe9a81645d385468de755b45dcdfb87d9a98d297',
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

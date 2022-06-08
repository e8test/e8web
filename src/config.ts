const CONFIGS: IConfig = {
  current: 97,
  networks: {
    97: {
      rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      ethscan: 'https://testnet.bscscan.com',
      tokenName: 'E8INDEX',
      nftAddr: '0xB6B83EFa0ac59d085562934a873d784D9BA2949e',
      auctions: [
        '0x4380510fE182E34ec623357662f4535Fc8e6fa6D',
        '0x1556Cd3D10bcda130E4ad919E50F3bEe61F015e7',
        '0xB6a009dbDeB8C86Ee4cEd6AC8632ffc123ffCf56'
      ],
      pools: [
        '0x7F3bB4eC602324198380Fa8d5d8EA1D7dBD47b47',
        '0x11291eE28779238839E12DCA62Eb651afC97AC0c',
        '0xA8E9139ef060c86D00Ad8a47aB507d6D8995ED12'
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
  : 1
export const currentRouter = CONFIG.pools[level- 1]
export const currentAuction = CONFIG.auctions[level- 1]
export default CONFIG

const CONFIGS: IConfig = {
  current: 256,
  networks: {
    256: {
      rpc: 'https://http-testnet.hecochain.com/',
      ethscan: 'https://testnet.hecoinfo.com',
      tokenName: 'E8INDEX',
      nftAddr: '0x0E2a8B564114Fe87763c27b5fC8d0249DDe93C7a',
      auctions: [
        '0xA37F0948f5DE04F6603Ed302A84aBaC1Bc59D874',
        '0x1556Cd3D10bcda130E4ad919E50F3bEe61F015e7',
        '0xB6a009dbDeB8C86Ee4cEd6AC8632ffc123ffCf56'
      ],
      pools: [
        '0xd1f44e38ae2076241Ac1Eac0EA8c8135A8A9c279',
        '0x11291eE28779238839E12DCA62Eb651afC97AC0c',
        '0xA8E9139ef060c86D00Ad8a47aB507d6D8995ED12'
      ],
      daos: [
        '0xDb993B8F5c7f0c881285c0958961d9Ed6D799AED',
        '0xaebF1be0527F39a5446BaBa4cF6Cc2bbb8B18a02',
        '0xaebF1be0527F39a5446BaBa4cF6Cc2bbb8B18a02'
      ],
      e8tAddr: '0x90999769b724D70F73Bd4164f805f6D4Da2baebD',
      tokenAddr: '0xF7aC1C2A9B3054d7438D377C26fd41c368fe8807',
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
export const currentDAO = CONFIG.daos[level- 1]
export default CONFIG

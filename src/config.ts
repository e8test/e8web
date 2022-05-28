const CONFIGS: IConfig = {
  current: 97,
  networks: {
    97: {
      rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      ethscan: 'https://testnet.bscscan.com',
      tokenName: 'E8INDEX',
      nftAddr: '0xB6B83EFa0ac59d085562934a873d784D9BA2949e',
      auctions: [
        '0xdd71da7F76A733F918908677958C29c3A6EB5287',
        '0x2D898A485ace7497a61A31F11BC7af9d65029cD2',
        '0x92DCe5BCc7259b4e330e8261e482D2a260FC35Ae'
      ],
      pools: [
        '0x97320Ff0E504aA0dcB47e6C8E11e859f70bA03E5',
        '0x55b3FB9Eca28FaAba888199F12D30484947DC9f2',
        '0xAa250fA9f8d2b2EE9Aa3D4067Bd71c93CF77DfC5'
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
export const level = sessionStorage.getItem('level')
  ? Number(sessionStorage.getItem('level'))
  : 3
export const currentRouter = CONFIG.pools[level - 1]
export const currentAuction = CONFIG.auctions[level - 1]
export default CONFIG

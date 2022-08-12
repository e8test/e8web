const CONFIGS: IConfig = {
  current: 97,
  networks: {
    256: {
      rpc: 'https://http-testnet.hecochain.com/',
      ethscan: 'https://testnet.hecoinfo.com',
      tokenName: 'E8INDEX',
      nftAddr: '0x0E2a8B564114Fe87763c27b5fC8d0249DDe93C7a',
      auctions: [
        '0x5f5fd881Ac1D333109DA6A018DA7363f8eA5C83B',
        '0xa31D866d9639a9d12c590AbcA98C6518C37B7fef',
        '0x34218aEc421b5d882158684d5b92F328219c9FB9'
      ],
      pools: [
        '0x8DC918a0b0e187e4b71AcCeE1432B37D5559254B',
        '0xcC5de5D08b3d6B8Bc4649813586eee46A9791fc5',
        '0xD93bA1f0BF8A5F80D918C9C340872a3165EfE7d3'
      ],
      daos: [
        '0xECEf3d6A9CfD4dfE06Dc62404b219708a6aE5F4D',
        '0x8bD8521daCdDb4BC8723C6B9DAD1c717FCe04DeE',
        '0xcd8A3c196e9f1128a6995e9F5FE0a5292C3b2FeE'
      ],
      e8tAddr: '0x90999769b724D70F73Bd4164f805f6D4Da2baebD',
      tokenAddr: '0xF7aC1C2A9B3054d7438D377C26fd41c368fe8807',
      whiteAddr: '',
      logAddr:
        '0x855fddac7e02437f0a70fb21886d84e258ce331cce8154890dd9d805089e60c8'
    },
    97: {
      rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      ethscan: 'https://testnet.bscscan.com',
      tokenName: 'E8INDEX',
      nftAddr: '0xB6B83EFa0ac59d085562934a873d784D9BA2949e',
      auctions: [
        '0x2a4D64f351b1F35fAdc44795aE939533df999A22',
        '0xf193B450BEc48a748CcAef67501C3d804c98ebe0',
        '0xa67aDB599e86c05b3f118aE33CC8785b81Eb9352'
      ],
      pools: [
        '0x3CFc011ceE02CE7B1BD4cD72483Bf9E0017C507E',
        '0xecB6C00B7a990f770E249a36E4C415A2492c2169',
        '0x9727f6e175F0eF342Ec3459D926f73dB6C965a93'
      ],
      daos: [
        '0x4164EF5D28f0e0BD66cDFEbf874B6Fb007362955',
        '0x7a15213d86968592f320e503D77A27C2254a5987',
        '0x0fF2560cBcac886c8B326C677753259E4890007e'
      ],
      e8tAddr: '0x8Dd02fFafD4df297D2d5F7b35cbdb909F39D7f75',
      tokenAddr: '0xf8b2BA003C47c997e3ffa4ebb94cf17183c9e190',
      whiteAddr: '0xbDC20a62599FEa974dB61F39C01f71Ed547D66C1',
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
export const currentRouter = CONFIG.pools[level - 1]
export const currentAuction = CONFIG.auctions[level - 1]
export const currentDAO = CONFIG.daos[level - 1]
export default CONFIG

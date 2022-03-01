import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

import CONFIG, { CHAIN_IDS, URLS } from '@/config'

export const injected = new InjectedConnector({
  supportedChainIds: CHAIN_IDS
})

export const walletconnect = new WalletConnectConnector({
  rpc: URLS,
  chainId: CONFIG.chainId,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true
})

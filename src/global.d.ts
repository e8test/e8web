interface RequestArguments {
  method: string
  params?: unknown[] | object
}

interface Ethereum {
  selectedAddress: string
  chainId: string
  currentProvider: any
  request: <T>(args: RequestArguments) => Promise<T>
  once(event: 'accountsChanged', listener: (accounts: string[]) => void): void
  once(event: 'chainChanged', listener: (chainId: number) => void): void
}

interface Window {
  ethereum: Ethereum
  web3: import('web3').default
}

declare var ethereum: Ethereum

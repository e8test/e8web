import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import ReactDOM from 'react-dom'

import CONFIG, { URLS, CONFIGS } from '@/config'
import WalletModal from '@/components/WalletModal'
import { injected, walletconnect } from './connector'

export function useProvider() {
  const { chainId } = useWeb3React()
  const provider = useMemo(() => {
    return new ethers.providers.JsonRpcProvider(URLS[chainId || CONFIG.chainId])
  }, [chainId])
  return provider
}

export function useEagerConnect() {
  const { activate, active } = useWeb3React()
  const [tried, setTried] = useState(false)
  const setActivate = useRef(activate)

  useEffect(() => {
    injected.isAuthorized().then(result => {
      if (result) {
        setActivate.current(injected, undefined, true).catch(err => {
          console.trace(err)
          setTried(true)
        })
      } else {
        setTried(true)
      }
    })
  }, [])

  useEffect(() => {
    if (!tried && active) setTried(true)
  }, [tried, active])

  return tried
}

export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3React()

  useEffect(() => {
    const { ethereum } = window as any
    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleConnect = () => {
        console.log("Handling 'connect' event")
        activate(injected)
      }
      const handleChainChanged = (chainId: string | number) => {
        console.log("Handling 'chainChanged' event with payload", chainId)
        activate(injected)
        window.location.reload()
      }
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("Handling 'accountsChanged' event with payload", accounts)
        activate(injected)
      }
      const handleNetworkChanged = (networkId: string | number) => {
        console.log("Handling 'networkChanged' event with payload", networkId)
        activate(injected)
      }
      ethereum.on('connect', handleConnect)
      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('networkChanged', handleNetworkChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('connect', handleConnect)
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
          ethereum.removeListener('networkChanged', handleNetworkChanged)
        }
      }
    }
  }, [active, error, suppress, activate])
}

export function useConnect() {
  const { activate, deactivate } = useWeb3React()
  const connect: () => Promise<string | null> = () => {
    return new Promise((resolve, reject) => {
      const el = document.createElement('div')
      document.body.appendChild(el)
      const close = () => {
        ReactDOM.unmountComponentAtNode(el)
        document.body.removeChild(el)
      }
      ReactDOM.render(
        <WalletModal
          onClose={() => {
            close()
            reject()
          }}
          onSelect={async item => {
            if (item === 'MetaMask') {
              await activate(injected)
              const account = await injected.getAccount()
              resolve(account || null)
            }
            if (item === 'WalletConnect') {
              try {
                await activate(walletconnect, error => {
                  console.trace(error)
                  window.location.reload()
                })
                const account = await walletconnect.getAccount()
                resolve(account || null)
              } catch (error) {
                reject(error)
              }
            }
          }}
        />,
        el
      )
    })
  }
  const disconnect = () => {
    deactivate()
  }
  return { connect, disconnect }
}

export function useAccount() {
  const [balance, setBalance] = useState(0)
  const { account, chainId, library } = useWeb3React<Web3Provider>()

  const connected = useMemo(() => {
    return account && Object.keys(CONFIGS.networks).includes(chainId + '')
  }, [account, chainId])

  const getAccount = useCallback(async () => {
    if (account && library) {
      const result = await library?.getBalance(account!)
      const value = Number(ethers.utils.formatUnits(result))
      setBalance(value)
    }
  }, [account, library])

  useEffect(() => {
    getAccount()
  }, [getAccount])

  return {
    connected,
    balance
  }
}

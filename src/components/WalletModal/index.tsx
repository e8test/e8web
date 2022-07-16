import { useState, useEffect, useCallback } from 'react'
import { Modal } from '@arco-design/web-react'

import styles from './style.module.scss'
import metamaskBanner from './metamask.svg'
import walletconnectBanner from './walletconnect.svg'

type WalletType = 'MetaMask' | 'WalletConnect'

interface Props {
  onClose: () => void
  onSelect: (type: WalletType) => void
}

export default function WalletModal({ onClose, onSelect }: Props) {
  const { ethereum } = window as any
  const [visible, setVisible] = useState(false)

  const close = () => {
    setVisible(false)
  }

  const onItemSelect = useCallback(
    (item: WalletType) => {
      onSelect(item)
      close()
    },
    [onSelect]
  )

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <Modal
      visible={visible}
      title={null}
      closable={false}
      onCancel={close}
      afterClose={onClose}
      footer={null}
      maskClosable
    >
      <div className={styles.wrap}>
        {typeof ethereum !== 'undefined' ? (
          <div className={styles.item} onClick={() => onItemSelect('MetaMask')}>
            <div className={styles.logo}>
              <img src={metamaskBanner} alt="" />
            </div>
            <div className={styles.title}>MetaMask</div>
            <div className={styles.desc}>Connect to your MetaMask Wallet</div>
          </div>
        ) : (
          <a
            className={styles.item}
            href="https://metamask.io/"
            target="_blank"
            rel="noreferrer"
            onClick={() => setVisible(false)}
          >
            <div className={styles.logo}>
              <img src={metamaskBanner} alt="" />
            </div>
            <div className={styles.title}>Install MetaMask</div>
            <div className={styles.desc}>Connect to your MetaMask Wallet</div>
          </a>
        )}
        {navigator.userAgent.includes('Mobile') === false && (
          <div
            className={styles.item}
            onClick={() => onItemSelect('WalletConnect')}
          >
            <div className={styles.logo}>
              <img src={walletconnectBanner} alt="" />
            </div>
            <div className={styles.title}>WalletConnect</div>
            <div className={styles.desc}>
              Scan with WalletConnect to connect
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

import { Menu, Button, Space } from '@arco-design/web-react'
import { useLocation, Link } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'

import styles from '../Navbar/style.module.scss'
import { level, isMobile } from '@/config'
import LevelSwitch from '@/components/LevelSwitch'
import { useConnect } from '@/libs/wallet/hooks'

export default function ConsoleHeader() {
  const { connect, disconnect } = useConnect()
  const { pathname } = useLocation()
  const { account } = useWeb3React()

  const accountStr = () => {
    if (!account) return ''
    if (isMobile) {
      return account.slice(0, 3) + '..' + account.slice(-2)
    }
    return account.slice(0, 5) + '...' + account.slice(-3)
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.logo}>Console</div>
      <div className={styles.navs}>
        <Menu
          mode="horizontal"
          ellipsis={isMobile ? true : false}
          selectedKeys={[pathname]}
          className={styles.menu}
        >
          <Menu.Item key="/console" className={styles.menu_link}>
            <Link to="/console">Application</Link>
          </Menu.Item>
          <Menu.Item key="/console/expires" className={styles.menu_link}>
            <Link to="/console/expires">Expires</Link>
          </Menu.Item>
          <Menu.Item key="/console/auctions" className={styles.menu_link}>
            <Link to="/console/auctions">Auctions</Link>
          </Menu.Item>
          {level === 3 && (
            <Menu.Item key="/console/downgrades" className={styles.menu_link}>
              <Link to="/console/downgrades">Downgrades</Link>
            </Menu.Item>
          )}
          <Menu.Item key="/console/dashboard" className={styles.menu_link}>
            <Link to="/console/dashboard">Dashboard</Link>
          </Menu.Item>
        </Menu>
        <Space>
          {account ? (
            <Button
              size={isMobile ? 'small' : 'default'}
              type="primary"
              shape="round"
              onClick={disconnect}
            >
              {accountStr()}
            </Button>
          ) : (
            <Button type="primary" shape="round" onClick={connect}>
              Connect
            </Button>
          )}
          <LevelSwitch />
        </Space>
      </div>
    </header>
  )
}

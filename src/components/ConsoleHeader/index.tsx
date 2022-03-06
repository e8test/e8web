import { Menu, Button } from '@arco-design/web-react'
import { useLocation, Link } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'

import styles from '../Navbar/style.module.scss'
import { useConnect } from '@/libs/wallet/hooks'

export default function ConsoleHeader() {
  const { connect, disconnect } = useConnect()
  const { pathname } = useLocation()
  const { account } = useWeb3React()

  return (
    <header className={styles.navbar}>
      <div className={styles.logo}>Console</div>
      <div className={styles.navs}>
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          ellipsis={false}
          className={styles.menu}
        >
          <Menu.Item key="/console" className={styles.menu_link}>
            <Link to="/console">Applies</Link>
          </Menu.Item>
          <Menu.Item key="/console/expires" className={styles.menu_link}>
            <Link to="/console/expires">Expires</Link>
          </Menu.Item>
        </Menu>
        {account ? (
          <Button type="primary" shape="round" onClick={disconnect}>
            {account.slice(0, 5) + '...' + account.slice(-3)}
          </Button>
        ) : (
          <Button type="primary" shape="round" onClick={connect}>
            Connect
          </Button>
        )}
      </div>
    </header>
  )
}

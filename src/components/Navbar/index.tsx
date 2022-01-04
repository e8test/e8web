import { Button, Menu } from '@arco-design/web-react'
import { useState } from 'react'
import { IconMenu } from '@arco-design/web-react/icon'
import { Link, useLocation } from 'react-router-dom'

import styles from './style.module.scss'
import Dropmenu from './DropMenu'
import store from '../../store'
import * as wallet from '../../services/wallet'
import * as util from '../../libs/util'

export default function Navbar() {
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(false)

  return (
    <>
      <div className={styles.wrap}>
        <Button
          size="large"
          icon={<IconMenu />}
          iconOnly
          className={styles.icon}
          onClick={() => setVisible(!visible)}
        />
        <div className={styles.logo}>ETF & Liquidity</div>
        <Menu
          mode="horizontal"
          className={styles.menu}
          defaultSelectedKeys={[pathname]}
        >
          <Menu.Item key="/">
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="/bank">
            <Link to="/bank">Bank</Link>
          </Menu.Item>
          <Menu.Item key="/roadmap">
            <Link to="/roadmap">Roadmap</Link>
          </Menu.Item>
          <Menu.Item key="/dashboard">
            <Link to="/dashboard">Dashboard</Link>
          </Menu.Item>
        </Menu>
        <div className={styles.blank} />
        {store.valid ? (
          <span>{util.formatAccount(store.account)}</span>
        ) : (
          <Button onClick={wallet.connect} size="large" type="primary">
            Connect Wallet
          </Button>
        )}
      </div>
      {visible && (
        <Dropmenu active={pathname} onClose={() => setVisible(false)} />
      )}
    </>
  )
}

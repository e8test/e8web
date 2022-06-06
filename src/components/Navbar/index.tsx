import { Menu, Button, Dropdown, Space } from '@arco-design/web-react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { IconMenu } from '@arco-design/web-react/icon'

import styles from './style.module.scss'
import { isMobile } from '@/config'
import LevelSwitch from '@/components/LevelSwitch'
import { useConnect } from '@/libs/wallet/hooks'

export default function Navbar() {
  const navigate = useNavigate()
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
      <div className={styles.logo}>Index & Liquidity</div>
      <div className={styles.menus}>
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          ellipsis={false}
          className={styles.menu}
        >
          <Menu.Item key="/" className={styles.menu_link}>
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="/bank" className={styles.menu_link}>
            <Link to="/bank">Bank</Link>
          </Menu.Item>
          <Menu.Item key="/market" className={styles.menu_link}>
            <Link to="/market">Market</Link>
          </Menu.Item>
          <Menu.Item key="/roadmap" className={styles.menu_link}>
            <Link to="/roadmap">Roadmap</Link>
          </Menu.Item>
          <Menu.Item key="/dashboard" className={styles.menu_link}>
            <Link to="/dashboard">Dashboard</Link>
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
        <Dropdown
          droplist={
            <Menu onClickMenuItem={key => navigate(key)}>
              <Menu.Item key="/">Home</Menu.Item>
              <Menu.Item key="/bank">Bank</Menu.Item>
              <Menu.Item key="/market">Market</Menu.Item>
              <Menu.Item key="/roadmap">Roadmap</Menu.Item>
              <Menu.Item key="/dashboard">Dashboard</Menu.Item>
            </Menu>
          }
          trigger="click"
          position="br"
        >
          <Button
            size={isMobile ? 'small' : 'default'}
            icon={<IconMenu />}
            className={styles.menu_btn}
          />
        </Dropdown>
      </div>
    </header>
  )
}

import { useState, useEffect, useRef } from 'react'
import { Menu, Drawer } from '@arco-design/web-react'
import { Link } from 'react-router-dom'

import styles from './style.module.scss'

interface Props {
  active: string
  onClose: () => void
}

export default function Dropmenu({ active, onClose }: Props) {
  const wrapper = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <div className={styles.wrapper} ref={wrapper}>
      <Drawer
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        placement="top"
        closable={false}
        headerStyle={{ display: 'none' }}
        getPopupContainer={() => wrapper && wrapper.current!}
        afterClose={() => onClose()}
      >
        <Menu defaultSelectedKeys={[active]}>
          <Menu.Item key="/">
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="/bank">
            <Link to="/bank">Bank</Link>
          </Menu.Item>
          <Menu.Item key="/roadmap">
            <Link to="/roadmap">Raodmap</Link>
          </Menu.Item>
          <Menu.Item key="/dashboard">
            <Link to="/dashboard">Dashboard</Link>
          </Menu.Item>
        </Menu>
      </Drawer>
    </div>
  )
}

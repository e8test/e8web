import { Menu, Button, Dropdown } from '@arco-design/web-react'

import { level } from '@/config'

export default function LevelSwitch() {
  const levelName = () => {
    const isMobile = window.outerWidth <= 768

    switch (level) {
      case 3:
        return isMobile ? '#3' : '#3 Adverse Pool'
      case 2:
        return isMobile ? '#2' : '#2 NFT Pool'
      case 1:
        return isMobile ? '#1' : '#1 NFT Pool'
      default:
        return ''
    }
  }

  const switchPool = (level: string) => {
    sessionStorage.setItem('level', level)
    window.location.reload()
  }

  return (
    <Dropdown
      droplist={
        <Menu onClickMenuItem={key => switchPool(key)}>
          <Menu.Item key="3">#3 Adverse Pool</Menu.Item>
          <Menu.Item key="2">#2 NFT Pool</Menu.Item>
          <Menu.Item key="1">#1 NFT Pool</Menu.Item>
        </Menu>
      }
      trigger="click"
      position="br"
    >
      <Button shape="round" type="primary" status="success">
        {levelName()}
      </Button>
    </Dropdown>
  )
}

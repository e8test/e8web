import { Divider } from '@arco-design/web-react'

import styles from './style.module.scss'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Divider />
      <div className={styles.copyright}>
        Copyright 2022 Index & Liquidity System All Rights Reserved
      </div>
    </footer>
  )
}

import { Spin } from '@arco-design/web-react'
import styles from './styles.module.scss'

export default function Loading() {
  return (
    <Spin>
      <div className={styles.wrap} />
    </Spin>
  )
}
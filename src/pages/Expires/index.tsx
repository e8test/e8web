import { Breadcrumb } from '@arco-design/web-react'

import styles from '../Applies/style.module.scss'
import useExpires from '@/hooks/useExpires'

export default function Expires() {
  useExpires()

  return (
    <div className="page-main">
      <Breadcrumb className={styles.toolbar}>
        <Breadcrumb.Item>Console</Breadcrumb.Item>
        <Breadcrumb.Item>Expires</Breadcrumb.Item>
      </Breadcrumb>
    </div>
  )
}

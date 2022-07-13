import {
  Space,
  Table,
  Tooltip,
  Link,
  Breadcrumb,
  Button
} from '@arco-design/web-react'
import { ColumnProps } from '@arco-design/web-react/lib/Table'
import { IconRefresh } from '@arco-design/web-react/icon'

import styles from './style.module.scss'
import CONFIG, { isMobile } from '@/config'
import useApplies from '@/hooks/useApplies'
import * as util from '@/libs/util'

export default function Applies() {
  const { applies, listApplies } = useApplies()

  const columns: ColumnProps<IApply>[] = [
    {
      title: 'NFT',
      dataIndex: 'uri',
      width: 250,
      render: value => <img src={value} alt="" className={styles.cover} />
    },
    {
      title: 'Token',
      dataIndex: 'token',
      width: 150,
      render: value => (
        <Tooltip content={value}>
          <Link href={CONFIG.ethscan + '/address/' + value} target="_blank">
            {value.slice(0, 6)}...{value.slice(-4)}
          </Link>
        </Tooltip>
      )
    },
    {
      title: 'Token Id',
      dataIndex: 'tokenId',
      width: 120
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      width: 150,
      render: value => (
        <Tooltip content={value}>
          <Link href={CONFIG.ethscan + '/address/' + value} target="_blank">
            {value.slice(0, 6)}...{value.slice(-4)}
          </Link>
        </Tooltip>
      )
    },
    {
      title: 'Ask',
      dataIndex: 'quote',
      width: 120,
      render: value => `${value} ${CONFIG.tokenName}`
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      width: 150,
      render: value => util.timeFormat(value)
    },
    {
      title: 'Quotes',
      dataIndex: 'quotes',
      width: 250,
      render: (value, record) => {
        return (
          <Space direction="vertical">
            {record.quotes.map((item, i) => (
              <Space key={i} size="medium">
                <Tooltip content={item.addr}>
                  <Link
                    href={CONFIG.ethscan + '/address/' + item.addr}
                    target="_blank"
                  >
                    {item.addr.slice(0, 4)}...{item.addr.slice(-2)}
                  </Link>
                  :
                </Tooltip>
                <span>{item.value} E8INDEX</span>
              </Space>
            ))}
          </Space>
        )
      }
    }
  ]

  return (
    <div className="page-main">
      <div className="toolbar">
        <Breadcrumb>
          <Breadcrumb.Item>Console</Breadcrumb.Item>
          <Breadcrumb.Item>Application</Breadcrumb.Item>
        </Breadcrumb>
        <Button
          type="primary"
          icon={<IconRefresh />}
          size="large"
          onClick={listApplies}
        />
      </div>
      <div className={styles.main}>
        <Table
          columns={columns}
          data={applies}
          rowKey="tokenId"
          scroll={{ x: isMobile }}
        />
      </div>
    </div>
  )
}

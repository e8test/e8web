import {
  Table,
  Tooltip,
  Link,
  Breadcrumb,
  Button,
  Tag
} from '@arco-design/web-react'
import { ColumnProps } from '@arco-design/web-react/lib/Table'
import { IconRefresh } from '@arco-design/web-react/icon'

import styles from '../Applies/style.module.scss'
import CONFIG, { isMobile } from '@/config'
import useDeposits from '@/hooks/useDeposits'
import * as util from '@/libs/util'

export default function Deposits() {
  const { deposits, listDeposis } = useDeposits()

  const columns: ColumnProps<IDeposit>[] = [
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
      title: 'Price',
      dataIndex: 'value',
      width: 120,
      render: value => `${value} ${CONFIG.tokenName}`
    },
    {
      title: 'Deposit Time',
      dataIndex: 'timestamp',
      width: 150,
      render: value => util.timeFormat(value)
    },
    {
      title: 'Status',
      dataIndex: 'redeemDeadline',
      width: 150,
      render: value => {
        if (value > Date.now()) {
          return <Tag color="green">Normal</Tag>
        } else {
          return <Tag color="red">Expired</Tag>
        }
      }
    }
  ]

  return (
    <div className="page-main">
      <div className="toolbar">
        <Breadcrumb>
          <Breadcrumb.Item>Console</Breadcrumb.Item>
          <Breadcrumb.Item>Deposits</Breadcrumb.Item>
        </Breadcrumb>
        <Button
          type="primary"
          icon={<IconRefresh />}
          size="large"
          onClick={listDeposis}
        />
      </div>
      <div className={styles.main}>
        <Table
          columns={columns}
          data={deposits}
          rowKey="tokenId"
          scroll={{ x: isMobile }}
        />
      </div>
    </div>
  )
}

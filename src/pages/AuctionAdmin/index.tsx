import { useState } from 'react'
import {
  Button,
  Space,
  Table,
  Message,
  Tag,
  Breadcrumb,
  Statistic
} from '@arco-design/web-react'
import { ColumnProps } from '@arco-design/web-react/lib/Table'

import styles from '../Applies/style.module.scss'
import CONFIG from '@/config'
import useAuctions from '@/hooks/useAuctions'

export default function AuctionAdmin() {
  const [loading, setLoading] = useState(false)
  const { auctions, destroy } = useAuctions()

  const columns: ColumnProps<IAuction>[] = [
    {
      title: 'NFT',
      dataIndex: 'uri',
      width: 250,
      render: value => <img src={value} alt="" className={styles.cover} />
    },
    {
      title: 'Token Id',
      dataIndex: 'tokenId',
      width: 100
    },
    {
      title: 'Starting Price',
      dataIndex: 'startingPrice',
      width: 150,
      render: value => `${value} ${CONFIG.tokenName}`
    },
    {
      title: 'Last Price',
      dataIndex: 'lastPrice',
      width: 150,
      render: value => `${value} ${CONFIG.tokenName}`
    },
    {
      title: 'Timeout',
      dataIndex: 'timeout',
      width: 150,
      render: value => (
        <Statistic.Countdown
          className={styles.countdown}
          value={value}
          now={Date.now()}
        />
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (value, record) => {
        console.log(record.index)
        if (value < 200) return <Tag color="#0fc6c2">Ongoing</Tag>
        if (value === 200 || value === 201) return <Tag color="#00b42a">Successful</Tag>
        if (value === 300) return <Tag color="#f53f3f">Failed</Tag>
        if (value === 301) return <Tag color="#f53f3f">Destroyed</Tag>
      }
    },
    {
      title: 'Operation',
      dataIndex: 'opt',
      width: 250,
      render: (value, record) => {
        if (record.status === 300) {
          return (
            <Space>
              <Button
                type="primary"
                status="danger"
                disabled={loading}
                size="small"
                onClick={() => onDestroy(record.index)}
              >
                Destroy
              </Button>
              <Button type="primary" disabled={loading} size="small">
                Downgrade
              </Button>
            </Space>
          )
        }
        return null
      }
    }
  ]

  const onDestroy = async (index: number) => {
    try {
      setLoading(true)
      const handle = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      await destroy(index)
      handle()
      Message.success('Transaction successful')
    } catch (error) {
      console.trace(error)
      Message.clear()
      Message.warning('Transaction canceled')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-main">
      <Breadcrumb className={styles.toolbar}>
        <Breadcrumb.Item>Console</Breadcrumb.Item>
        <Breadcrumb.Item>Auctions</Breadcrumb.Item>
      </Breadcrumb>
      <Table columns={columns} data={auctions} rowKey="index" />
    </div>
  )
}

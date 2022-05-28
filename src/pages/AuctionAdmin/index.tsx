import { useState, useEffect } from 'react'
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
import { IconRefresh } from '@arco-design/web-react/icon'

import styles from '../Applies/style.module.scss'
import CONFIG, { level } from '@/config'
import useAuctions from '@/hooks/useAuctions'
import { useWeb3React } from '@web3-react/core'

export default function AuctionAdmin() {
  const [loading, setLoading] = useState(false)
  const { auctions, destroy, downgrade, listAll } = useAuctions()
  const { account } = useWeb3React()

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
        if (value === 1) {
          if (record.timeout > Date.now()) {
            return <Tag color="#0fc6c2">Ongoing</Tag>
          } else {
            if (record.bidTimes === 0) {
              return <Tag color="#f53f3f">Failed</Tag>
            } else {
              return <Tag color="#00b42a">Successful</Tag>
            }
          }
        }
        if (value === 2) return <Tag color="#00b42a">Successful</Tag>
        if (value === 3) return <Tag color="#f53f3f">Destroyed</Tag>
        if (value === 4) return <Tag color="#f53f3f">Downgraded</Tag>
      }
    },
    {
      title: 'Operation',
      dataIndex: 'opt',
      width: 250,
      render: (value, record) => {
        if (
          record.status === 1 &&
          record.bidTimes === 0 &&
          record.timeout < Date.now()
        ) {
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
              {level > 1 && (
                <Button
                  type="primary"
                  disabled={loading}
                  size="small"
                  onClick={() => onDowngrade(record.index)}
                >
                  Downgrade
                </Button>
              )}
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

  const onDowngrade = async (index: number) => {
    try {
      setLoading(true)
      const handle = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      await downgrade(index)
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

  useEffect(() => {
    if (account) listAll()
  }, [account, listAll])

  return (
    <div className="page-main">
      <div className="toolbar">
        <Breadcrumb className={styles.toolbar}>
          <Breadcrumb.Item>Console</Breadcrumb.Item>
          <Breadcrumb.Item>Auctions</Breadcrumb.Item>
        </Breadcrumb>
        <Button
          type="primary"
          icon={<IconRefresh />}
          size="large"
          onClick={listAll}
        />
      </div>
      <Table columns={columns} data={auctions} rowKey="index" />
    </div>
  )
}

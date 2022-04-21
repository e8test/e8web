import { useState } from 'react'
import {
  Button,
  Space,
  Table,
  Message,
  Breadcrumb,
  Tooltip,
  Link
} from '@arco-design/web-react'
import { ColumnProps } from '@arco-design/web-react/lib/Table'
import { IconRefresh } from '@arco-design/web-react/icon'

import styles from '../Applies/style.module.scss'
import CONFIG from '@/config'
import useExpires from '@/hooks/useExpires'
import * as util from '@/libs/util'

export default function Expires() {
  const [loading, setLoading] = useState(false)
  const { expires, redemption, listExpires } = useExpires()

  const columns: ColumnProps<INFT>[] = [
    {
      title: 'NFT',
      dataIndex: 'uri',
      width: 250,
      render: value => <img src={value} alt="" className={styles.cover} />
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
      dataIndex: 'price',
      width: 120,
      render: value => `${value} ${CONFIG.tokenName}`
    },
    {
      title: 'Expires',
      dataIndex: 'timestamp',
      render: (value, record) => util.timeFormat(value + record.redeemExpire)
    },
    {
      title: 'Operation',
      dataIndex: 'opt',
      width: 250,
      render: (value, record) => {
        return (
          <Space>
            <Button
              type="primary"
              onClick={() => onRedemption(record.tokenId)}
              disabled={loading}
            >
              Redeem & Auction
            </Button>
          </Space>
        )
      }
    }
  ]

  const onRedemption = async (tokenId: number) => {
    try {
      setLoading(true)
      const handle = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      await redemption(tokenId)
      handle()
      Message.success('Transaction confirmed')
    } catch (error) {
      Message.clear()
      Message.warning('Transaction canceled')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-main">
      <div className="toolbar">
        <Breadcrumb className={styles.toolbar}>
          <Breadcrumb.Item>Console</Breadcrumb.Item>
          <Breadcrumb.Item>Expires</Breadcrumb.Item>
        </Breadcrumb>
        <Button
          type="primary"
          icon={<IconRefresh />}
          size="large"
          onClick={listExpires}
        />
      </div>
      <Table columns={columns} data={expires} rowKey="tokenId" />
    </div>
  )
}

import { useState } from 'react'
import {
  Button,
  Table,
  Breadcrumb,
  Tooltip,
  Link,
  Message
} from '@arco-design/web-react'
import { IconRefresh } from '@arco-design/web-react/icon'
import { ColumnProps } from '@arco-design/web-react/lib/Table'

import styles from '../Applies/style.module.scss'
import CONFIG from '@/config'
import useDowngrades from '@/hooks/useDowngrades'

export default function Downgrades() {
  const [loading, setLoading] = useState(false)
  const { downgrades, listDowngrades, withdrawNFT } = useDowngrades()

  const onWithdraw = async (tokenId: number) => {
    try {
      setLoading(true)
      const handle = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      await withdrawNFT(tokenId)
      handle()
      Message.success('Transaction confirmed')
    } catch (error) {
      Message.clear()
      Message.warning('Transaction canceled')
    } finally {
      setLoading(false)
    }
  }

  const columns: ColumnProps<IDowngrade>[] = [
    {
      title: 'NFT',
      dataIndex: 'uri',
      width: 250,
      render: value => <img src={value} alt="" className={styles.cover} />
    },
    {
      title: 'Token Id',
      dataIndex: 'tokenId',
      width: 250
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      render: value => (
        <Tooltip content={value}>
          <Link href={CONFIG.ethscan + '/address/' + value} target="_blank">
            {value.slice(0, 6)}...{value.slice(-4)}
          </Link>
        </Tooltip>
      )
    },
    {
      title: 'Operation',
      dataIndex: 'opt',
      width: 200,
      render: (value, record) => {
        return (
          <Button
            type="primary"
            disabled={loading}
            onClick={() => onWithdraw(record.tokenId)}
          >
            Withdraw
          </Button>
        )
      }
    }
  ]

  return (
    <div className="page-main">
      <div className="toolbar">
        <Breadcrumb className={styles.toolbar}>
          <Breadcrumb.Item>Console</Breadcrumb.Item>
          <Breadcrumb.Item>Downgrades</Breadcrumb.Item>
        </Breadcrumb>
        <Button
          type="primary"
          icon={<IconRefresh />}
          size="large"
          onClick={listDowngrades}
        />
      </div>
      <Table columns={columns} data={downgrades} rowKey="tokenId" />
    </div>
  )
}

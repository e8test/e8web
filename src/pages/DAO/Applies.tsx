import { useState, useRef } from 'react'
import {
  Button,
  Space,
  Table,
  Modal,
  Form,
  InputNumber,
  Message,
  FormInstance,
  Tooltip,
  Link
} from '@arco-design/web-react'
import { useWeb3React } from '@web3-react/core'
import { useNavigate } from 'react-router-dom'
import { ColumnProps } from '@arco-design/web-react/lib/Table'
import dayjs from 'dayjs'

import styles from './style.module.scss'
import CONFIG, { isMobile } from '@/config'
import useApplies from '@/hooks/useApplies'
import ButtonTab from '@/components/ButtonTab'
import * as util from '@/libs/util'

export default function Applies() {
  const navigate = useNavigate()
  const formRef = useRef<FormInstance>(null)
  const { account } = useWeb3React()
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<IApply>()
  const { applies, pricing } = useApplies()

  const columns: ColumnProps<IApply>[] = [
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
    },
    {
      title: 'Operation',
      dataIndex: 'opt',
      width: 200,
      render: (value, record) => {
        const addrs = record.quotes.map(item => item.addr)
        if (!account || addrs.includes(account)) return null
        return (
          <Space>
            <Button
              type="primary"
              onClick={() => showQuote(record)}
              disabled={loading}
            >
              Quote
            </Button>
          </Space>
        )
      }
    }
  ]

  const showQuote = (item: IApply) => {
    setCurrent(item)
    setVisible(true)
  }

  const getForm = async () => {
    try {
      let { price, depositExpire, redeemExpire } =
        await formRef.current?.validate()
      depositExpire = dayjs(depositExpire).unix()
      redeemExpire = redeemExpire * 3600 * 24
      return { price, depositExpire, redeemExpire }
    } catch {
      return null
    }
  }

  const onQuote = async (reject = false, tokenId?: number) => {
    try {
      let form: any = {
        price: 0
      }
      if (!reject) {
        form = await getForm()
      }
      if (!form) return
      setLoading(true)
      const handle = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      setVisible(false)
      await pricing(tokenId || current!.tokenId, form.price)
      handle()
      setCurrent(undefined)
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
      <div className="toolbar">
        <ButtonTab
          value={1}
          onChange={value => {
            navigate(value === 0 ? '/dao' : '/dao/applies')
          }}
          tabs={['Deposit', 'Application']}
        />
      </div>
      <div className={styles.main}>
        <Table
          columns={columns}
          data={applies}
          rowKey="tokenId"
          scroll={{ x: isMobile }}
        />
        <Modal
          title={'Quote - #' + current?.tokenId}
          visible={visible}
          onCancel={() => setVisible(false)}
          style={{ maxWidth: '90%' }}
          unmountOnExit
          footer={[
            <Button key="cancel" onClick={() => setVisible(false)}>
              Cancel
            </Button>,
            <Button key="save" type="primary" onClick={() => onQuote(false)}>
              Submit
            </Button>
          ]}
        >
          <Form
            ref={formRef}
            layout="vertical"
            size="large"
            initialValues={{
              price: current?.quote
            }}
          >
            <Form.Item
              label="Price"
              field="price"
              rules={[
                {
                  required: true,
                  message: 'Please input price'
                }
              ]}
            >
              <InputNumber
                min={0}
                step={0.1}
                precision={2}
                placeholder="Price"
                suffix={CONFIG.tokenName}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  )
}

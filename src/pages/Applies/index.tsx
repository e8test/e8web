import { useState, useRef } from 'react'
import {
  Button,
  Space,
  Table,
  Modal,
  Form,
  InputNumber,
  Message,
  DatePicker,
  FormInstance,
  Breadcrumb,
  Tooltip,
  Link
} from '@arco-design/web-react'
import { ColumnProps } from '@arco-design/web-react/lib/Table'
import dayjs from 'dayjs'

import styles from './style.module.scss'
import CONFIG from '@/config'
import useApplies from '@/hooks/useApplies'
import * as util from '@/libs/util'

export default function Applies() {
  const formRef = useRef<FormInstance>(null)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<IApply>()
  const { applies, setPrice } = useApplies()

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
      render: value => `${value} E8T`
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      render: value => util.timeFormat(value)
    },
    {
      title: 'Operation',
      dataIndex: 'opt',
      width: 200,
      render: (value, record) => {
        return (
          <Space>
            <Button
              type="primary"
              onClick={() => showQuote(record)}
              disabled={loading}
            >
              Quote
            </Button>
            <Button
              type="primary"
              status="danger"
              disabled={loading}
              onClick={() => {
                onQuote(true, record.tokenId)
              }}
            >
              Reject
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
        price: 0,
        depositExpire: 0,
        redeemExpire: 0
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
      await setPrice(
        tokenId || current!.tokenId,
        form.price,
        form.depositExpire,
        form.redeemExpire
      )
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
      <Breadcrumb className={styles.toolbar}>
        <Breadcrumb.Item>Console</Breadcrumb.Item>
        <Breadcrumb.Item>Applies</Breadcrumb.Item>
      </Breadcrumb>
      <Table columns={columns} data={applies} rowKey="tokenId" />
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
        <Form ref={formRef} layout="vertical" size="large" initialValues={{
          price: current?.quote,
          depositExpire: dayjs().add(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
          redeemExpire: 60
        }}>
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
              suffix="E8T"
            />
          </Form.Item>
          <Form.Item
            label="Deposit Expire"
            field="depositExpire"
            rules={[
              {
                required: true,
                message: 'Please select deposit expire time'
              }
            ]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            label="Redeem Expire"
            field="redeemExpire"
            rules={[
              {
                required: true,
                message: 'Please select redeem expire time'
              }
            ]}
          >
            <InputNumber min={0.001} precision={3} step={1} suffix="Days" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

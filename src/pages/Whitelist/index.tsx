import { useRef, useState, useEffect } from 'react'
import {
  Button,
  Space,
  Table,
  Message,
  Breadcrumb,
  Input,
  Modal,
  Form,
  FormInstance
} from '@arco-design/web-react'
import { ColumnProps } from '@arco-design/web-react/lib/Table'
import { IconRefresh } from '@arco-design/web-react/icon'

import useWhite from '@/hooks/useWhite'
import { isMobile } from '@/config'

export default function Whitelist() {
  const form = useRef<FormInstance>(null)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const { whites, listWhites, addWhite, checkAddr, delWhite } = useWhite()
  const columns: ColumnProps<IWhite>[] = [
    {
      title: 'Address',
      dataIndex: 'addr'
    },
    {
      title: 'Operation',
      dataIndex: 'opt',
      width: 150,
      render: (value, record) => {
        return (
          <Button
            status="danger"
            size="small"
            type="primary"
            onClick={() => {
              Modal.confirm({
                title: 'Confirm',
                content: 'Are you sure you want to remove this address?',
                onOk: () => onDel(record.addr)
              })
            }}
          >
            Delete
          </Button>
        )
      }
    }
  ]

  const onDel = async (addr: string) => {
    try {
      const handle = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      await delWhite(addr)
      listWhites()
      handle()
      Message.success('Transaction confirmed')
    } catch (error) {
      Message.clear()
      Message.warning('Transaction canceled')
    } finally {
      setLoading(false)
    }
  }

  const onAdd = async () => {
    const value = await form.current?.validate()
    try {
      setLoading(true)
      const handle = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      const index = await checkAddr(value.addr)
      if (index > 0) {
        Message.warning('Address already exists')
        handle()
        return
      }
      await addWhite(value.addr)
      setVisible(false)
      listWhites()
      handle()
      Message.success('Transaction confirmed')
    } catch (error) {
      Message.clear()
      Message.warning('Transaction canceled')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listWhites()
  }, [listWhites])

  return (
    <div className="page-main">
      <div className="toolbar">
        <Breadcrumb>
          <Breadcrumb.Item>Console</Breadcrumb.Item>
          <Breadcrumb.Item>Whitelist</Breadcrumb.Item>
        </Breadcrumb>
        <Space>
          <Button type="primary" size="large" onClick={() => setVisible(true)}>
            Add Address
          </Button>
          <Button
            type="primary"
            icon={<IconRefresh />}
            size="large"
            onClick={listWhites}
          />
        </Space>
      </div>
      <Table
        columns={columns}
        data={whites}
        rowKey="addr"
        scroll={{ x: isMobile }}
      />
      <Modal
        visible={visible}
        onCancel={() => {
          setVisible(false)
        }}
        title="Add Address"
        maskClosable
        unmountOnExit
        onOk={onAdd}
        footer={[
          <Button key="cancel" onClick={() => setVisible(false)}>
            Cancel
          </Button>,
          <Button type="primary" key="ok" onClick={onAdd} loading={loading}>
            OK
          </Button>
        ]}
      >
        <Form layout="vertical" ref={form}>
          <Form.Item
            field="addr"
            rules={[
              {
                required: true,
                message: 'Please input address'
              },
              {
                validator: (value, callback) => {
                  if (/^0x([0-9a-f]{40})$/i.test(value) === false) {
                    callback('Invalid address')
                  } else {
                    callback()
                  }
                }
              }
            ]}
          >
            <Input placeholder="Address" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

import { useState, useRef } from 'react'
import {
  Button,
  InputNumber,
  Input,
  Breadcrumb,
  Form,
  FormInstance,
  Message,
  Modal
} from '@arco-design/web-react'

import styles from './style.module.scss'
import useNFTs from '@/hooks/useNFTs'
import CONFIG from '../../config'

export default function Status() {
  const form = useRef<FormInstance>(null)
  const [info, setInfo] = useState<INFT>()
  const [loading, setLoading] = useState(false)
  const { searchNFT } = useNFTs()

  const search = async () => {
    const value = await form.current?.validate()
    try {
      setLoading(true)
      const result = await searchNFT(value.addr, value.tokenId)
      console.log(result)
      setInfo(result)
    } catch (error) {
      console.trace(error)
      Message.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const status = () => {
    if (!info) return ''
    if (info.redeemExpire) {
      if (info.redeemExpire + info.timestamp < Date.now()) {
        return `Price ${info.price} ${CONFIG.tokenName}, Pledged, Redemption Timeout`
      } else {
        return `Pledged, price ${info.price}`
      }
    }
    if (info.quote > 0 && !info.price) return 'Waiting for pricing'
    if (info.price && info.depositExpire && info.depositExpire > Date.now()) {
      return `Price ${info.price} ${CONFIG.tokenName}, Waiting for pledging`
    }
    return 'N/A'
  }

  return (
    <div className="page-main">
      <div className="toolbar">
        <Breadcrumb>
          <Breadcrumb.Item>Console</Breadcrumb.Item>
          <Breadcrumb.Item>NFT status</Breadcrumb.Item>
        </Breadcrumb>
      </div>
      <div className={styles.main}>
        <div className={styles.form}>
          <Form layout="vertical" size="large" ref={form}>
            <Form.Item
              field="addr"
              label="NFT contract address"
              initialValue={CONFIG.nftAddr}
              rules={[
                {
                  required: true,
                  message: 'Please input address'
                },
                {
                  validator: (value, callback) => {
                    if (/^0x([0-9a-f]{40})$/i.test(value || '') === false) {
                      callback('Invalid address')
                    } else {
                      callback()
                    }
                  }
                }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="NFT token id"
              field="tokenId"
              rules={[
                {
                  required: true,
                  message: 'Please input tokenId'
                }
              ]}
            >
              <InputNumber />
            </Form.Item>
            <Form.Item>
              <Button type="primary" long loading={loading} onClick={search}>
                Search
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      <Modal
        title="NFT status"
        maskClosable
        visible={!!info}
        unmountOnExit
        onCancel={() => setInfo(undefined)}
        footer={[
          <Button type="primary" onClick={() => setInfo(undefined)} key="ok">
            OK
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="NFT">
            <img src={info?.uri} alt="" className={styles.pic} />
          </Form.Item>
          <Form.Item label="Status">
            <div>{status()}</div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

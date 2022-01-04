import { useState, useEffect, useRef } from 'react'
import {
  Divider,
  Message,
  Button,
  Modal,
  Form,
  Spin,
  Input,
  Empty,
  InputNumber,
  FormInstance
} from '@arco-design/web-react'
import { IconImage } from '@arco-design/web-react/icon'
import { observer } from 'mobx-react'

import styles from './styles.module.scss'
import store from '../../store'
import { INft } from '../../models/types'
import * as wallet from '../../services/wallet'
import * as contract from '../../services/contract'
import * as util from '../../libs/util'

function Bank() {
  const formRef = useRef<FormInstance>(null)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [rows, setRows] = useState<INft[]>([])

  const loadNfts = async () => {
    const loading = Message.loading({
      content: 'Loading...',
      duration: 0
    })
    const count = await contract.balanceOf()
    if (count === 0) return
    const actions = []
    for (let i = 0; i < count; i++) {
      const tokenId = await contract.getTokenId(i)
      actions.push(contract.getNft(tokenId))
    }
    const result = await Promise.all(actions.reverse())
    setRows(result)
    loading()
  }

  const approve = async (tokenId: number) => {
    try {
      setLoading(true)
      const loading = Message.loading({
        content: '正在发送交易...',
        duration: 0
      })
      await contract.approve(tokenId)
      loading()
      loadNfts()
    } catch (error) {
      Message.clear()
      Message.warning('交易已取消')
    } finally {
      setLoading(false)
    }
  }

  const add = async (tokenId: number, uri: string) => {
    try {
      const valid = await util.checkImg(uri)
      if (valid !== true) return Message.error('无效的图片')
      const loading = Message.loading({
        content: '正在发送交易...',
        duration: 0
      })
      await contract.mint(tokenId, uri)
      setVisible(false)
      loading()
      Message.success('交易已确认')
      loadNfts()
    } catch (error) {
      Message.clear()
      Message.warning('交易已取消')
    }
  }

  const onAdd = async () => {
    try {
      const { tokenId, uri } = await formRef.current?.validate()
      await add(tokenId, uri)
    } catch (error) {}
  }

  const deposit = async (tokenId: number) => {
    try {
      setLoading(true)
      const loading = Message.loading({
        content: '正在发送交易...',
        duration: 0
      })
      await contract.deposit(tokenId)
      loading()
      loadNfts()
      Message.success('交易已确认')
    } catch (error) {
      Message.clear()
      Message.warning('交易已取消')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    formRef.current?.resetFields()
  }, [visible])

  useEffect(() => {
    if (store.valid) loadNfts()
  }, [])

  const renderBtn = (nft: INft) => {
    if (!nft.approved) {
      return (
        <Button
          long
          size="large"
          className={styles.btn}
          onClick={() => approve(nft.tokenId)}
        >
          授权
        </Button>
      )
    }
    if (nft.price.value && nft.price.expire) {
      return (
        <Button
          long
          size="large"
          type="outline"
          className={styles.btn}
          onClick={() => deposit(nft.tokenId)}
        >
          已定价 {nft.price.value} E8T，抵押
        </Button>
      )
    }
    return <span className={styles.btn}>等待定价</span>
  }

  return (
    <>
      <div className="page-main">
        <Spin loading={loading} style={{ display: 'block', width: '100%' }}>
          {store.valid && (
            <>
              <div>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => setVisible(true)}
                  icon={<IconImage />}
                >
                  添加NFT
                </Button>
              </div>
              <Divider />
              {rows.length > 0 ? (
                <div className={styles.nfts}>
                  {rows.map(item => (
                    <div key={item.tokenId} className={styles.nft}>
                      <div className={styles.imgbox}>
                        <img src={item.uri} alt="" className={styles.img} />
                      </div>
                      {renderBtn(item)}
                    </div>
                  ))}
                </div>
              ) : (
                <Empty />
              )}
            </>
          )}
          {!store.valid && (
            <div className={styles.empty}>
              <Button type="primary" size="large" onClick={wallet.connect}>
                Connect Wallet
              </Button>
            </div>
          )}
        </Spin>
      </div>
      <Modal
        title="添加NFT"
        visible={visible}
        onOk={onAdd}
        onCancel={() => setVisible(false)}
        style={{ maxWidth: '90%' }}
      >
        <Form ref={formRef} layout="vertical" size="large">
          <Form.Item
            label="TokenId"
            field="tokenId"
            rules={[
              {
                required: true,
                message: '请输入TokenId'
              }
            ]}
          >
            <InputNumber min={1} placeholder="Token ID" />
          </Form.Item>
          <Form.Item
            label="NFT Uri"
            field="uri"
            rules={[
              {
                required: true,
                message: '请输入NFT Uri'
              }
            ]}
          >
            <Input placeholder="NFT Uri" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default observer(Bank)

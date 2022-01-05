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
  FormInstance,
  Space,
  Notification
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
  const priceFormRef = useRef<FormInstance>(null)
  const formRef = useRef<FormInstance>(null)
  const [tab, setTab] = useState<'deposited' | 'undeposited'>('undeposited')
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<INft>()
  const [priceModalVisible, setPriceModalVisible] = useState(false)
  const [rows, setRows] = useState<INft[]>([])
  const [deposited, setDeposited] = useState<INft[]>()
  const [depositedApproved, setDepositedApproved] = useState(false)

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
    console.log(result)
    setRows(result)
    loading()
  }

  const loadDeposited = async () => {
    const loading = Message.loading({
      content: 'Loading...',
      duration: 0
    })
    const count = await contract.depositedCount()
    if (count === 0) return
    const actions = []
    const approved = await contract.isDepositedApproved()
    setDepositedApproved(approved)
    for (let i = 0; i < count; i++) {
      const tokenId = await contract.getDepositedTokenId(i)
      actions.push(contract.getDeposited(tokenId))
    }
    const result = await Promise.all(actions.reverse())
    console.log(result)
    setDeposited(result)
    loading()
  }

  const showPriceModal = (nft: INft) => {
    setCurrent(nft)
    setPriceModalVisible(true)
  }

  const onApprove = async () => {
    try {
      await priceFormRef.current?.validate()
      setPriceModalVisible(false)
      await approve()
      setCurrent(undefined)
    } catch (error) {}
  }

  const approve = async () => {
    try {
      setLoading(true)
      const loading = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      await contract.approve(current!.tokenId)
      loading()
      loadNfts()
    } catch (error) {
      Message.clear()
      Message.warning('Transaction canceled')
    } finally {
      setLoading(false)
    }
  }

  const add = async (tokenId: number, uri: string) => {
    try {
      setVisible(false)
      setLoading(true)
      const loading = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      const valid = await util.checkImg(uri)
      if (valid !== true) return Message.error('Invalid picture')
      await contract.mint(tokenId, uri)
      setVisible(false)
      loading()
      Message.success('Transaction confirmed')
      loadNfts()
    } catch (error) {
      Message.clear()
      Message.warning('Transaction canceled')
    } finally {
      setLoading(false)
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
        content: 'Sending transaction...',
        duration: 0
      })
      await contract.deposit(tokenId)
      loading()
      loadNfts()
      loadDeposited()
      Message.success('Transaction confirmed')
    } catch (error) {
      Message.clear()
      Message.warning('Transaction canceled')
    } finally {
      setLoading(false)
    }
  }

  const redemption = async (tokenId: number) => {
    try {
      setLoading(true)
      const loading = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      await contract.redemption(tokenId)
      loading()
      loadDeposited()
      loadNfts()
      Message.success('Transaction confirmed')
    } catch (error) {
      Message.clear()
      Message.warning('Transaction canceled')
    } finally {
      setLoading(false)
    }
  }

  const approveRedemption = async () => {
    try {
      setLoading(true)
      const loading = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      await contract.approveRedemption()
      loading()
      loadDeposited()
    } catch (error) {
      Message.clear()
      Message.warning('Transaction canceled')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'deposited' && !deposited) {
      setDeposited([])
      loadDeposited()
    }
  }, [tab])

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
          onClick={() => showPriceModal(nft)}
        >
          Approve & Quote
        </Button>
      )
    }
    if (nft.price && nft.expire) {
      return (
        <Button
          long
          size="large"
          type="outline"
          className={styles.btn}
          onClick={() => deposit(nft.tokenId)}
        >
          Price {nft.price} E8T, Pledge
        </Button>
      )
    }
    return <span className={styles.btn}>waiting for pricing</span>
  }

  const renderDepositedBtn = (nft: INft) => {
    if (depositedApproved) {
      return (
        <Button
          long
          size="large"
          type="outline"
          className={styles.btn}
          onClick={() => redemption(nft.tokenId)}
        >
          Price {nft.price} E8T，Redeem
        </Button>
      )
    }
    return (
      <Button
        long
        size="large"
        className={styles.btn}
        onClick={approveRedemption}
      >
        Approve & Redeem
      </Button>
    )
  }

  const renderList = () => {
    if (tab === 'undeposited') {
      return rows.length > 0 ? (
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
        <Empty description="No Data" />
      )
    }
    if (!deposited || deposited.length === 0) return <Empty description="No Data" />
    return (
      <div className={styles.nfts}>
        {deposited?.map(item => (
          <div key={item.tokenId} className={styles.nft}>
            <div className={styles.imgbox}>
              <img src={item.uri} alt="" className={styles.img} />
            </div>
            {renderDepositedBtn(item)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="page-main">
        <div className="hidden-btn" onClick={() => {
          Notification.warning({
            title: 'Warning',
            content: 'There\'s NFT asset soon to be overdue.'
          })
        }} />
        <Spin loading={loading} style={{ display: 'block', width: '100%' }}>
          {store.valid && (
            <>
              <div>
                <Space>
                  <Button.Group>
                    <Button
                      type={tab === 'undeposited' ? 'primary' : 'outline'}
                      onClick={() => setTab('undeposited')}
                      size="large"
                    >
                      NFTs
                    </Button>
                    <Button
                      type={tab === 'deposited' ? 'primary' : 'outline'}
                      onClick={() => setTab('deposited')}
                      size="large"
                    >
                      mortgaged
                    </Button>
                  </Button.Group>
                  {tab === 'undeposited' && (
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => setVisible(true)}
                      icon={<IconImage />}
                    >
                      Import NFT
                    </Button>
                  )}
                </Space>
              </div>
              <Divider />
              {renderList()}
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
        title="estimate price"
        visible={priceModalVisible}
        onCancel={() => setPriceModalVisible(false)}
        style={{ maxWidth: '90%' }}
        footer={[
          <Button key="cancel" onClick={() => setPriceModalVisible(false)}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={onApprove}>Submit</Button>
        ]}
      >
        <Form layout="vertical" size="large" ref={priceFormRef}>
          <Form.Item
            label="estimate price"
            field="price"
            rules={[
              {
                required: true,
                message: 'Please input estimate price'
              }
            ]}
          >
            <InputNumber placeholder="Please input estimate price" min={1} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Import NFT"
        visible={visible}
        onCancel={() => setVisible(false)}
        style={{ maxWidth: '90%' }}
        footer={[
          <Button key="cancel" onClick={() => setVisible(false)}>Cancel</Button>,
          <Button key="save" type="primary" onClick={onAdd}>Submit</Button>
        ]}
      >
        <Form ref={formRef} layout="vertical" size="large">
          <Form.Item
            label="TokenId"
            field="tokenId"
            rules={[
              {
                required: true,
                message: 'Please input TokenId'
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
                message: 'Please input NFT Uri'
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

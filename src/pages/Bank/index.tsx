import { useState, useEffect, useRef } from 'react'
import {
  Notification,
  Button,
  Space,
  Divider,
  Empty,
  Modal,
  Form,
  Input,
  Message,
  InputNumber,
  FormInstance
} from '@arco-design/web-react'
import { IconImage, IconRefresh } from '@arco-design/web-react/icon'
import { useWeb3React } from '@web3-react/core'
import classNames from 'classnames'

import styles from './style.module.scss'
import CONFIG from '@/config'
import ButtonTab from '@/components/ButtonTab'
import useNFTs from '@/hooks/useNFTs'
import { useConnect } from '@/libs/wallet/hooks'
import * as util from '@/libs/util'

export default function Bank() {
  const {
    nfts,
    deposits,
    listNFTs,
    listDeposits,
    depositApproved,
    approve,
    add,
    applyValuation,
    deposit,
    approveRedemption,
    redemption
  } = useNFTs()
  const { connect } = useConnect()
  const { account } = useWeb3React()
  const [tab, setTab] = useState(0)
  const [current, setCurrent] = useState<INFT>()
  const priceFormRef = useRef<FormInstance>(null)
  const formRef = useRef<FormInstance>(null)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [priceModalVisible, setPriceModalVisible] = useState(false)

  const showPriceModal = (nft: INFT) => {
    setCurrent(nft)
    setPriceModalVisible(true)
  }

  const renderNFTBtn = (nft: INFT) => {
    if (
      !nft.isApproved ||
      (nft.depositExpire > 0 && nft.depositExpire < Date.now())
    ) {
      return (
        <Button
          long
          size="large"
          className={styles.btn}
          disabled={loading}
          onClick={() => showPriceModal(nft)}
        >
          #{nft.tokenId}, Approve & Quote
        </Button>
      )
    }
    if (nft.isApproved && !nft.quote && !nft.price) {
      if (
        !nft.lastApplyTime ||
        Date.now() - nft.lastApplyTime > 72 * 3600 * 1000
      ) {
        return (
          <Button
            long
            size="large"
            className={styles.btn}
            disabled={loading}
            onClick={() => showPriceModal(nft)}
          >
            #{nft.tokenId}, Quote
          </Button>
        )
      } else {
        return (
          <Button
            long
            size="large"
            status="danger"
            className={styles.btn}
            disabled
          >
            #{nft.tokenId}, Quote Rejected
          </Button>
        )
      }
    }
    if (nft.price && nft.depositExpire && nft.depositExpire > Date.now()) {
      return (
        <Button
          long
          size="large"
          type="outline"
          className={styles.btn}
          disabled={loading}
          onClick={() => depositConfirm(nft)}
        >
          #{nft.tokenId}, Price {nft.price} {CONFIG.tokenName}, Pledge
        </Button>
      )
    }
    return (
      <span className={styles.btn}>#{nft.tokenId}, Waiting for pricing</span>
    )
  }

  const renderDepositBtn = (nft: INFT) => {
    if (nft.redeemExpire + nft.timestamp < Date.now()) {
      return (
        <Button
          className={styles.btn}
          status="danger"
          size="large"
          long
          disabled
        >
          #{nft.tokenId}, Redemption Timeout
        </Button>
      )
    }
    if (depositApproved) {
      return (
        <Button
          long
          size="large"
          type="outline"
          className={styles.btn}
          onClick={() => onRedemption(nft.tokenId)}
        >
          #{nft.tokenId}, Price {nft.price} {CONFIG.tokenName}, Redeem
        </Button>
      )
    }
    return (
      <Button
        long
        size="large"
        className={styles.btn}
        onClick={onApproveRedemption}
      >
        Approve & Redeem
      </Button>
    )
  }

  const renderNFTS = () => {
    if (tab === 0 && !nfts.length) {
      return (
        <div className="page-empty">
          <Empty />
        </div>
      )
    }
    return (
      <div
        className={classNames(styles.nfts, {
          [styles.hide]: tab !== 0
        })}
      >
        {nfts.map(item => (
          <div key={item.tokenId} className={styles.nft}>
            <div className={styles.imgbox}>
              <img src={item.uri} alt="" className={styles.img} />
            </div>
            {renderNFTBtn(item)}
          </div>
        ))}
      </div>
    )
  }

  const renderDeposits = () => {
    if (tab === 1 && (!deposits || deposits.length === 0)) {
      return (
        <div className="page-empty">
          <Empty />
        </div>
      )
    }
    const rows = deposits || []
    return (
      <div
        className={classNames(styles.nfts, {
          [styles.hide]: tab !== 1
        })}
      >
        {rows.map(item => (
          <div key={item.tokenId} className={styles.nft}>
            <div className={styles.imgbox}>
              <img src={item.uri} alt="" className={styles.img} />
            </div>
            {renderDepositBtn(item)}
          </div>
        ))}
      </div>
    )
  }

  const onApprove = async () => {
    try {
      const { price } = await priceFormRef.current?.validate()
      setLoading(true)
      const loading = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      setPriceModalVisible(false)
      if (current!.isApproved !== true) {
        await approve(current!.tokenId)
      }
      await applyValuation(current!.tokenId, price)
      loading()
      setCurrent(undefined)
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
      setVisible(false)
      setLoading(true)
      const handle = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      const valid = await util.checkImg(uri)
      if (valid !== true) {
        handle()
        return Message.error('Invalid picture')
      }
      await add(tokenId, uri)
      setVisible(false)
      handle()
      Message.success('Transaction confirmed')
    } catch (error) {
      Message.warning('Transaction canceled')
    } finally {
      setLoading(false)
    }
  }

  const onDeposit = async (tokenId: number) => {
    try {
      setLoading(true)
      const handle = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      await deposit(tokenId)
      handle()
      Message.success('Transaction confirmed')
    } catch (error) {
      console.trace(error)
      Message.warning('Transaction canceled')
    } finally {
      setLoading(false)
      Message.clear()
    }
  }

  const depositConfirm = (item: INFT) => {
    Modal.confirm({
      title: 'Pledge #' + item.tokenId,
      content: (
        <div>
          <div className={styles.row}>
            <span>Pledge Expire:</span>
            <span>{util.timeFormat(item.depositExpire)}</span>
          </div>
          <div className={styles.row}>
            <span>Redeem Expire:</span>
            <span>
              {Number((item.redeemExpire / 3600 / 24 / 1000).toFixed(3))} days
            </span>
          </div>
        </div>
      ),
      onOk: async () => {
        onDeposit(item.tokenId)
      }
    })
  }

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

  const onApproveRedemption = async () => {
    try {
      setLoading(true)
      const handle = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      await approveRedemption()
      handle()
    } catch (error) {
      Message.clear()
      Message.warning('Transaction canceled')
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    if (tab === 0) listNFTs()
    else listDeposits()
  }

  useEffect(() => {
    if (!account) return
    if (tab === 0) listNFTs()
    if (tab === 1) listDeposits()
  }, [tab, account, listNFTs, listDeposits])

  if (!account) {
    return (
      <div className="page-empty">
        <Button size="large" type="primary" shape="round" onClick={connect}>
          Connect Wallet
        </Button>
      </div>
    )
  }

  return (
    <div className="page-main">
      <div
        className="hidden-btn"
        onClick={() => {
          Notification.warning({
            title: 'Warning',
            content: "There's NFT asset soon to be overdue."
          })
        }}
      />
      <div className="toolbar">
        <Space>
          <ButtonTab
            value={tab}
            onChange={value => setTab(value)}
            tabs={['NFTs', 'Pledge']}
          />
          {tab === 0 && (
            <Button
              type="primary"
              size="large"
              icon={<IconImage />}
              disabled={loading}
              onClick={() => setVisible(true)}
            >
              Import NFT
            </Button>
          )}
        </Space>
        <Button
          type="primary"
          icon={<IconRefresh />}
          size="large"
          onClick={refresh}
        />
      </div>
      <Divider />
      {renderNFTS()}
      {renderDeposits()}
      <Modal
        title="estimate price"
        visible={priceModalVisible}
        onCancel={() => setPriceModalVisible(false)}
        style={{ maxWidth: '90%' }}
        unmountOnExit
        footer={[
          <Button key="cancel" onClick={() => setPriceModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={onApprove}>
            Submit
          </Button>
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
        unmountOnExit
        footer={[
          <Button key="cancel" onClick={() => setVisible(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={onAdd}>
            Submit
          </Button>
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
    </div>
  )
}

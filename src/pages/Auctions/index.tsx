import { useState, useRef } from 'react'
import {
  Button,
  Empty,
  Modal,
  Form,
  Message,
  Statistic,
  InputNumber,
  FormInstance
} from '@arco-design/web-react'

import CONFIG from '@/config'
import styles from './style.module.scss'
import useAuctions from '@/hooks/useAuctions'
import { useWeb3React } from '@web3-react/core'

export default function Auctions() {
  const formRef = useRef<FormInstance>(null)
  const [visible, setVisible] = useState(false)
  const {
    auctions,
    balance,
    allowance,
    owner,
    approve,
    bid,
    list,
    takeAway,
    destroy
  } = useAuctions()
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState<IAuction>()
  const { account } = useWeb3React()

  const renderBtn = (nft: IAuction) => {
    if (nft.status === 300) {
      if (owner === account) {
        return (
          <Button
            type="primary"
            status="danger"
            long
            size="large"
            loading={loading}
            onClick={() => onDestroy(nft.index)}
          >
            Auction Failed, Destroy
          </Button>
        )
      }
      return (
        <Button type="primary" status="danger" long size="large" disabled>
          Auction Failed
        </Button>
      )
    }
    if (nft.status === 301) {
      return (
        <Button type="primary" status="danger" long size="large" disabled>
          Destroyed
        </Button>
      )
    }
    if (nft.status < 200) {
      return (
        <Button
          type="outline"
          long
          size="large"
          onClick={() => onBid(nft)}
          loading={loading}
          disabled={nft.timeout < Date.now()}
        >
          <span className={styles.countdown}>Bidding countdown:</span>
          <Statistic.Countdown
            now={Date.now()}
            value={nft.timeout}
            style={{ fontSize: '12px' }}
            onFinish={list}
          ></Statistic.Countdown>
        </Button>
      )
    }
    if (nft.status === 201) {
      return (
        <Button type="outline" status="success" long size="large" disabled>
          Auction Successful
        </Button>
      )
    }
    if (nft.status === 200) {
      if (nft.winner === account) {
        return (
          <Button
            type="primary"
            long
            status="success"
            size="large"
            onClick={() => onTakeAway(nft.index)}
            loading={loading}
          >
            Auction Successful, Take Away
          </Button>
        )
      } else {
        return (
          <Button type="outline" status="success" long size="large" disabled>
            Auction Successful
          </Button>
        )
      }
    }
  }

  const renderStatus = (nft: IAuction) => {
    return (
      <div className={styles.status}>
        <div className={styles.row}>
          <span>Token ID</span>
          <span>{nft.tokenId}</span>
        </div>
        <div className={styles.row}>
          <span>Starting Price</span>
          <span>
            {nft.startingPrice} {CONFIG.tokenName}
          </span>
        </div>
        <div className={styles.row}>
          <span>Last Price</span>
          <span>
            {nft.lastPrice} {CONFIG.tokenName}
          </span>
        </div>
        <div className={styles.btn}>{renderBtn(nft)}</div>
      </div>
    )
  }

  const renderNFTS = () => {
    if (!auctions.length) {
      return (
        <div className="page-empty">
          <Empty />
        </div>
      )
    }
    return (
      <div className={styles.nfts}>
        {auctions.map(item => (
          <div key={item.tokenId} className={styles.nft}>
            <div className={styles.imgbox}>
              <img src={item.uri} alt="" className={styles.img} />
            </div>
            {renderStatus(item)}
          </div>
        ))}
      </div>
    )
  }

  const onBid = async (item: IAuction) => {
    setCurrent(item)
    setVisible(true)
    formRef.current?.setFieldValue('price', item.lastPrice)
  }

  const onSubmit = async () => {
    const { price } = await formRef.current?.validate()
    if (price <= current!.lastPrice) {
      return Message.error('Bid must be largger than the last price')
    }
    try {
      setVisible(false)
      setLoading(true)
      const handle = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      if (allowance <= 0) await approve()
      await bid(current!.index, price)
      handle()
      Message.success('Bid successful')
    } catch (error) {
      Message.clear()
      Message.warning('Transaction canceled')
    } finally {
      setLoading(false)
    }
  }

  const onTakeAway = async (index: number) => {
    try {
      setLoading(true)
      const handle = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      await takeAway(index)
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

  return (
    <div className="page-main">
      {renderNFTS()}
      <Modal
        title={'Balance: ' + balance.toFixed(0) + ' ' + CONFIG.tokenName}
        visible={visible}
        onCancel={() => setVisible(false)}
        style={{ maxWidth: '90%' }}
        unmountOnExit
        footer={[
          <Button
            key="cancel"
            onClick={() => setVisible(false)}
            disabled={loading}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={onSubmit}
            loading={loading}
          >
            Bid
          </Button>
        ]}
      >
        <Form layout="vertical" size="large" ref={formRef}>
          <Form.Item
            label="Bid price"
            field="price"
            rules={[
              {
                required: true,
                message: 'Please input bid price'
              }
            ]}
          >
            <InputNumber
              placeholder="Please input bid price"
              min={current?.lastPrice}
              max={balance}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

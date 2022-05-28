import { useState, useRef, useEffect } from 'react'
import {
  Button,
  Empty,
  Modal,
  Form,
  Divider,
  Message,
  Statistic,
  InputNumber,
  FormInstance
} from '@arco-design/web-react'
import { IconRefresh } from '@arco-design/web-react/icon'

import CONFIG from '@/config'
import styles from './style.module.scss'
import ButtonTab from '@/components/ButtonTab'
import useAuctions from '@/hooks/useAuctions'
import { useWeb3React } from '@web3-react/core'

export default function Auctions() {
  const formRef = useRef<FormInstance>(null)
  const [tab, setTab] = useState(0)
  const [visible, setVisible] = useState(false)
  const {
    auctions,
    balance,
    allowance,
    mine,
    approve,
    bid,
    listAll,
    takeAway,
    listMine
  } = useAuctions()
  const [loading, setLoading] = useState(-1)
  const [current, setCurrent] = useState<IAuction>()
  const { account } = useWeb3React()

  const renderBtn = (nft: IAuction) => {
    if (nft.status === 1) {
      if (nft.timeout > Date.now()) {
        return (
          <Button
            type="outline"
            long
            size="large"
            onClick={() => onBid(nft)}
            loading={loading === nft.tokenId}
            disabled={nft.timeout < Date.now() || loading >= 0}
          >
            <span className={styles.countdown}>Bidding countdown:</span>
            <Statistic.Countdown
              now={Date.now()}
              value={nft.timeout}
              style={{ fontSize: '12px' }}
              onFinish={listAll}
            ></Statistic.Countdown>
          </Button>
        )
      } else if (nft.lastBidder === account) {
        return (
          <Button
            type="outline"
            long
            status="success"
            size="large"
            onClick={() => onTakeAway(nft)}
            loading={loading === nft.tokenId}
            disabled={loading >= 0}
          >
            Auction Successful, Take Away
          </Button>
        )
      } else if (nft.bidTimes > 0) {
        return (
          <Button type="outline" long status="success" size="large" disabled>
            Auction Finished
          </Button>
        )
      } else {
        return (
          <Button type="outline" status="danger" long size="large" disabled>
            Auction Failed
          </Button>
        )
      }
    }
    if (nft.status === 2) {
      if (nft.lastBidder === account) {
        return (
          <Button type="primary" status="success" long size="large" disabled>
            Taken Away
          </Button>
        )
      } else {
        return (
          <Button type="outline" status="success" long size="large" disabled>
            Auction Finished
          </Button>
        )
      }
    }
    if (nft.status === 3 || nft.status === 4) {
      return (
        <Button type="primary" status="danger" long size="large" disabled>
          Auction Failed
        </Button>
      )
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
          <span>Bid Times</span>
          <span>{nft.bidTimes}</span>
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
    const rows = tab === 0 ? auctions : mine
    if (!rows.length) {
      return (
        <div className="page-empty">
          <Empty />
        </div>
      )
    }
    return (
      <div className={styles.nfts}>
        {rows.map(item => (
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
    if (item.timeout < Date.now()) return
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
      setLoading(current!.tokenId)
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
      setLoading(-1)
    }
  }

  const onTakeAway = async (nft: IAuction) => {
    try {
      setLoading(nft.tokenId)
      const handle = Message.loading({
        content: 'Sending transaction...',
        duration: 0
      })
      await takeAway(nft.index)
      handle()
      Message.success('Transaction successful')
    } catch (error) {
      console.trace(error)
      Message.clear()
      Message.warning('Transaction canceled')
    } finally {
      setLoading(-1)
    }
  }

  const refresh = () => {
    if (tab === 0) listAll()
    else listMine()
  }

  useEffect(() => {
    if (!account) return
    if (tab === 0) listAll()
    if (tab === 1) listMine()
  }, [tab, account, listAll, listMine])

  return (
    <div className="page-main">
      <div className="toolbar">
        <ButtonTab
          value={tab}
          onChange={value => setTab(value)}
          tabs={['All auctions', 'My auctions']}
        />
        <Button
          type="primary"
          icon={<IconRefresh />}
          size="large"
          onClick={refresh}
        />
      </div>
      <Divider />
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
            disabled={loading >= 0}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={onSubmit}
            loading={loading >= 0}
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

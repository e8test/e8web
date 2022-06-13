import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import {
  Form,
  InputNumber,
  Button,
  Message,
  Tooltip,
  Link
} from '@arco-design/web-react'
import { useNavigate } from 'react-router-dom'

import CONFIG from '@/config'
import styles from './style.module.scss'
import { useConnect } from '@/libs/wallet/hooks'
import ButtonTab from '@/components/ButtonTab'
import useDAO from '@/hooks/useDAO'

export default function Deposit() {
  const navigate = useNavigate()
  const { connect } = useConnect()
  const { account } = useWeb3React()
  const [value, setValue] = useState<number>()
  const {
    balance,
    deposits,
    loading,
    doing,
    allowance,
    daoLimit,
    isMember,
    members,
    isDaoMember,
    deposit,
    approve,
    quit,
    fetchData
  } = useDAO()

  useEffect(() => {
    if (loading) {
      Message.loading({
        content: 'Loading...',
        duration: 0
      })
    } else {
      Message.clear()
    }
  }, [loading])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    isDaoMember()
  }, [isDaoMember])

  const onDepost = async () => {
    const close = Message.loading({
      content: 'Sending transaction...',
      duration: 0
    })
    try {
      await deposit(value!, deposits)
    } catch (error) {
      Message.warning('Transaction canceled')
    } finally {
      close()
      isDaoMember()
    }
  }

  const onQuit = async () => {
    const close = Message.loading({
      content: 'Sending transaction...',
      duration: 0
    })
    try {
      await quit()
    } catch (error) {
      Message.warning('Transaction canceled')
    } finally {
      close()
      isDaoMember()
    }
  }

  const onApprove = async () => {
    const close = Message.loading({
      content: 'Sending transaction...',
      duration: 0
    })
    try {
      await approve()
    } catch (error) {
      Message.warning('Transaction canceled')
    } finally {
      close()
    }
  }

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
      {isMember && (
        <div className="toolbar">
          <ButtonTab
            value={0}
            onChange={value => {
              navigate(value === 0 ? '/dao' : '/dao/applies')
            }}
            tabs={['Deposit', 'Application']}
          />
        </div>
      )}
      <div className={styles.main}>
        <div className={styles.form}>
          <Form layout="vertical" size="large">
            <Form.Item>
              <div className={styles.line}>
                <span>My deposit</span>
                <span>{deposits} E8T</span>
              </div>
              <div className={styles.line}>
                <span>My balance</span>
                <span>{balance} E8T</span>
              </div>
              <div className={styles.line}>
                <span>DAO member need</span>
                <span>{daoLimit} E8T</span>
              </div>
            </Form.Item>
            <Form.Item>
              <InputNumber
                placeholder="Enter an amount"
                value={value}
                min={0}
                max={balance}
                onChange={val => setValue(val)}
              />
            </Form.Item>
            <Form.Item>
              <Button long disabled={loading} onClick={() => setValue(balance)}>
                MAX
              </Button>
            </Form.Item>
            <Form.Item>
              {allowance < balance ? (
                <Button
                  type="primary"
                  long
                  loading={doing === 'approve'}
                  disabled={loading || !!doing}
                  onClick={onApprove}
                >
                  Approve
                </Button>
              ) : (
                <Button
                  type="primary"
                  long
                  loading={doing === 'deposit'}
                  disabled={
                    loading || value === undefined || value <= 0 || !!doing
                  }
                  onClick={onDepost}
                >
                  Deposit
                </Button>
              )}
            </Form.Item>
            {deposits > 0 && (
              <Form.Item>
                <Button
                  long
                  status="danger"
                  disabled={loading}
                  loading={doing === 'quit'}
                  onClick={onQuit}
                >
                  Quit
                </Button>
              </Form.Item>
            )}
            {members.length > 0 && (
              <Form.Item>
                <div className={styles.line}>
                  <div className={styles.title}>DAO members</div>
                </div>
                {members.map(item => (
                  <div className={styles.line} key={item.addr}>
                    <Tooltip content={item.addr}>
                      <Link
                        href={CONFIG.ethscan + '/address/' + item.addr}
                        target="_blank"
                      >
                        {item.addr.slice(0, 10)}...{item.addr.slice(-8)}
                      </Link>
                    </Tooltip>
                    <span>{item.value} E8T</span>
                  </div>
                ))}
              </Form.Item>
            )}
          </Form>
        </div>
      </div>
    </div>
  )
}

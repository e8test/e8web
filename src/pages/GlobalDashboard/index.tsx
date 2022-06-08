import { useRef, useEffect, useCallback } from 'react'
import { PieChart, LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import * as echarts from 'echarts/core'

import styles from './style.module.scss'
import useDashboard from '@/hooks/useDashboard'
import { Message } from '@arco-design/web-react'

echarts.use([
  PieChart,
  LineChart,
  BarChart,
  TitleComponent,
  GridComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  TooltipComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent
])

export default function GlobalDashboard() {
  const { markets, balances, tokens, getTokens, marketValues, getBalances } =
    useDashboard()
  const chart1 = useRef<HTMLDivElement>(null)
  const chart2 = useRef<HTMLDivElement>(null)
  const chart3 = useRef<HTMLDivElement>(null)
  const chart4 = useRef<HTMLDivElement>(null)
  const chart5 = useRef<HTMLDivElement>(null)
  const myChart1 = useRef<echarts.ECharts>()
  const myChart2 = useRef<echarts.ECharts>()
  const myChart3 = useRef<echarts.ECharts>()
  const myChart4 = useRef<echarts.ECharts>()
  const myChart5 = useRef<echarts.ECharts>()

  const load = useCallback(async () => {
    Message.loading({
      content: 'Loading...',
      duration: 0
    })
    try {
      await Promise.all([marketValues(), getBalances(), getTokens()])
    } finally {
      Message.clear()
    }
  }, [marketValues, getBalances, getTokens])

  useEffect(() => {
    load()
  }, [load])

  const initChart1 = useCallback(async () => {
    const [reserve, , , totalSupply] = tokens
    myChart1.current!.setOption({
      title: {
        text: '#1 - Index Token Pool',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: [
            { value: reserve, name: 'Reserve' },
            { value: totalSupply - reserve, name: 'circulation' }
          ],
          label: {
            formatter: '{b}: {c}'
          }
        }
      ]
    })
  }, [tokens])

  const initChart2 = useCallback(async () => {
    const [, reserve, , totalSupply] = tokens
    myChart2.current!.setOption({
      title: {
        text: '#2 - Index Token Pool',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: [
            { value: reserve, name: 'Reserve' },
            { value: totalSupply - reserve, name: 'circulation' }
          ],
          label: {
            formatter: '{b}: {c}'
          }
        }
      ]
    })
  }, [tokens])

  const initChart3 = useCallback(async () => {
    const [, , reserve, totalSupply] = tokens
    myChart3.current!.setOption({
      title: {
        text: '#3 - Index Token Pool',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: [
            { value: reserve, name: 'Reserve' },
            { value: totalSupply - reserve, name: 'circulation' }
          ],
          label: {
            formatter: '{b}: {c}'
          }
        }
      ]
    })
  }, [tokens])

  const initChart4 = useCallback(async () => {
    if (markets.length === 0) return
    const data = [
      {
        value: markets[0],
        name: '#1 NFT Pool'
      },
      {
        value: markets[1],
        name: '#2 NFT Pool'
      },
      {
        value: markets[2],
        name: '#3 Adverse Pool'
      }
    ]
    myChart4.current!.setOption({
      title: {
        text: 'NFT Market Value',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      xAxis: {
        type: 'category',
        data: ['#1 NFT Pool', '#2 NFT Pool', '#3 Adverse Pool']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'bar',
          data: data,
          label: {
            formatter: '{b}: {c}'
          }
        }
      ]
    })
  }, [markets])

  const initChart5 = useCallback(async () => {
    if (balances.length === 0) return
    const data = [
      {
        value: balances[0],
        name: '#1 NFT Pool'
      },
      {
        value: balances[1],
        name: '#2 NFT Pool'
      },
      {
        value: balances[2],
        name: '#3 Adverse Pool'
      }
    ]
    myChart5.current!.setOption({
      title: {
        text: 'Token balance',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      xAxis: {
        type: 'category',
        data: ['#1 NFT Pool', '#2 NFT Pool', '#3 Adverse Pool']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'bar',
          data: data,
          label: {
            formatter: '{b}: {c}'
          }
        }
      ]
    })
  }, [balances])

  useEffect(() => {
    if (myChart1.current) initChart1()
  }, [initChart1])

  useEffect(() => {
    if (myChart2.current) initChart2()
  }, [initChart2])

  useEffect(() => {
    if (myChart3.current) initChart3()
  }, [initChart3])

  useEffect(() => {
    if (myChart4.current) initChart4()
  }, [initChart4])

  useEffect(() => {
    if (myChart5.current) initChart5()
  }, [initChart5])

  useEffect(() => {
    myChart1.current = echarts.init(chart1.current!)
    myChart2.current = echarts.init(chart2.current!)
    myChart3.current = echarts.init(chart3.current!)
    myChart4.current = echarts.init(chart4.current!)
    myChart5.current = echarts.init(chart5.current!)

    window.onresize = () => {
      myChart1.current?.resize()
      myChart2.current?.resize()
      myChart3.current?.resize()
      myChart4.current?.resize()
      myChart5.current?.resize()
    }
    return () => {
      myChart1.current?.dispose()
      myChart2.current?.dispose()
      myChart3.current?.dispose()
      myChart4.current?.dispose()
      myChart5.current?.dispose()
      window.onresize = null
    }
  }, [])

  return (
    <div className={styles.wrap}>
      <div className={styles.chart} ref={chart1} />
      <div className={styles.chart} ref={chart2} />
      <div className={styles.chart} ref={chart3} />
      <div className={styles.chart} ref={chart4} />
      <div className={styles.chart} ref={chart5} />
    </div>
  )
}

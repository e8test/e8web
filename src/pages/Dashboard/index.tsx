import { useRef, useEffect } from 'react'
import { PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent
} from 'echarts/components'
import { Message } from '@arco-design/web-react'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import * as echarts from 'echarts/core'

import styles from './styles.module.scss'
import * as util from '../../libs/util'
import * as contract from '../../services/contract'

echarts.use([
  PieChart,
  LineChart,
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

export default function Dashboard() {
  const chart1 = useRef<HTMLDivElement>(null)
  const chart2 = useRef<HTMLDivElement>(null)
  const chart3 = useRef<HTMLDivElement>(null)
  const chart4 = useRef<HTMLDivElement>(null)
  const chart5 = useRef<HTMLDivElement>(null)
  const chart6 = useRef<HTMLDivElement>(null)
  const chart7 = useRef<HTMLDivElement>(null)
  const myChart1 = useRef<echarts.ECharts>()
  const myChart2 = useRef<echarts.ECharts>()
  const myChart3 = useRef<echarts.ECharts>()
  const myChart4 = useRef<echarts.ECharts>()
  const myChart5 = useRef<echarts.ECharts>()
  const myChart6 = useRef<echarts.ECharts>()
  const myChart7 = useRef<echarts.ECharts>()

  const initChart1 = async () => {
    myChart1.current = echarts.init(chart1.current!)
    const loading = Message.loading({
      content: 'Loading...',
      duration: 0
    })
    const { reserve, totalSupply } = await contract.tokenInfo()
    loading()
    myChart1.current.setOption({
      title: {
        text: 'ETF Token Pool',
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
  }

  const initChart2 = async () => {
    const data = await contract.marketValue()
    const times = data.map(item => util.timeFormat(item.time))
    const values = data.map(item => item.value)
    myChart2.current = echarts.init(chart2.current!)
    myChart2.current.setOption({
      title: {
        text: 'NFT Market Value Tracking',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: times
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: values,
          type: 'line'
        }
      ]
    })
  }

  const initChart3 = async () => {
    myChart3.current = echarts.init(chart3.current!)
    myChart3.current.setOption({
      title: {
        text: 'E8T Price Tracking',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [0.2, 0.26, 0.28, 0.37, 0.42, 0.41, 0.4],
          type: 'line'
        }
      ]
    })
  }

  const initChart4 = async () => {
    myChart4.current = echarts.init(chart4.current!)
    myChart4.current.setOption({
      title: {
        text: 'Sales / Revenue',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: 'line'
        },
        {
          data: [150, 232, 201, 154, 190, 330, 410],
          type: 'line'
        }
      ]
    })
  }

  const initChart5 = async () => {
    myChart5.current = echarts.init(chart5.current!)
    myChart5.current.setOption({
      title: {
        text: 'Pledge/Redeem Times',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [220, 182, 191, 234, 290, 330, 310],
          type: 'line'
        },
        {
          data: [320, 332, 301, 334, 390, 330, 320],
          type: 'line'
        }
      ]
    })
  }

  const initChart6 = async () => {
    myChart6.current = echarts.init(chart6.current!)
    myChart6.current.setOption({
      title: {
        text: 'Transaction Volume of Members',
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
            { value: 945, name: 'Platform A' },
            { value: 328, name: 'Platform B' },
            { value: 473, name: 'Platform C' }
          ],
          label: {
            formatter: '{b}: {c}'
          }
        }
      ]
    })
  }

  const initChart7 = async () => {
    myChart7.current = echarts.init(chart7.current!)
    myChart7.current.setOption({
      title: {
        text: 'Market Value of Members',
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
            { value: 9098, name: 'Platform A' },
            { value: 3488, name: 'Platform B' },
            { value: 18203, name: 'Platform C' }
          ],
          label: {
            formatter: '{b}: {c}'
          }
        }
      ]
    })
  }

  useEffect(() => {
    initChart1()
    initChart2()
    initChart3()
    initChart4()
    initChart5()
    initChart6()
    initChart7()

    window.onresize = () => {
      myChart1.current?.resize()
      myChart2.current?.resize()
      myChart3.current?.resize()
      myChart4.current?.resize()
      myChart5.current?.resize()
      myChart6.current?.resize()
      myChart7.current?.resize()
    }
    return () => {
      myChart1.current?.dispose()
      myChart2.current?.dispose()
      myChart3.current?.dispose()
      myChart4.current?.dispose()
      myChart5.current?.dispose()
      myChart6.current?.dispose()
      myChart7.current?.dispose()
      window.onresize = null
    }
  }, [])

  return (
    <>
      <div
        className="hidden-btn"
        onClick={() => {
          myChart3.current?.setOption({
            xAxis: {
              type: 'category',
              data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon']
            },
            series: [
              {
                data: [0.2, 0.26, 0.28, 0.37, 0.42, 0.41, 0.40, 0.45],
                type: 'line'
              }
            ]
          })
        }}
      />
      <div className={styles.wrap}>
        <div className={styles.chart} ref={chart1} />
        <div className={styles.chart} ref={chart2} />
        <div className={styles.chart} ref={chart3} />
        <div className={styles.chart} ref={chart4} />
        <div className={styles.chart} ref={chart5} />
        <div className={styles.chart} ref={chart6} />
        <div className={styles.chart} ref={chart7} />
      </div>
    </>
  )
}

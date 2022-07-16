import ReactDOM from 'react-dom'
import { ConfigProvider } from '@arco-design/web-react'
import enUS from '@arco-design/web-react/es/locale/en-US'
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import '@arco-design/web-react/dist/css/arco.css'
import './assets/styles/global.scss'

import App from './pages/App'

function getLibrary(provider: any) {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

setTimeout(() => {
  ReactDOM.render(
    <ConfigProvider locale={enUS}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <App />
      </Web3ReactProvider>
    </ConfigProvider>,
    document.getElementById('root')
  )
}, 200)

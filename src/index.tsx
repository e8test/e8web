import ReactDOM from 'react-dom'
import '@arco-design/web-react/dist/css/arco.css'
import './assets/styles/global.scss'
import App from './pages/App'
import * as wallet from './services/wallet'

wallet.init().then(() => {
  ReactDOM.render(<App />, document.getElementById('root'))
})

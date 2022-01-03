import { makeAutoObservable } from 'mobx'

class Store {
  chainId = 0
  account = ''
  get valid() {
    return this.chainId && this.account
  }

  constructor() {
    makeAutoObservable(this)
  }
}

let store = new Store()
export default store

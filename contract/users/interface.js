
import abi from './abi.json'
import deploy from './deploy.json'
import {isStrEmpty} from '@/common'
import Istore from '@/store'
// import {setting as Iglobal} from '@/utils/common'
// import web3 from 'web3'

// 需将MetaMask网络设为rpc

// const address = '0x00f91550ECA84EC7b7b897293fE2F036ae6b26b5' // tts
// arbitrum tts: 0xB53ccaE82fE11D900Ad3F3A1b583dA7b0578dD26

// let Web3 = require('web3')
// var web3Provider = new Web3('http://localhost:8545')
// var web3Provider = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

// let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

let UsersABI = null

const methods = {

  init(contractAddress) {
    let valid = false
    for (let i = 0; i < deploy.length; i++) {
      if (deploy[i].address === contractAddress) {
        valid = true
      }
    }

    if (!valid) {
      console.log('USERS invalid', contractAddress)
      return null
    } else {

      // window.web3 = new Iweb3(Iweb3.givenProvider)
      //
      // UsersABI = new window.web3.eth.Contract(abi, contractAddress)

      UsersABI = new window.web3js.eth.Contract(abi, contractAddress)

      return UsersABI
    }
  },

  name() {
    return new Promise(resolve => {
      UsersABI.methods.name().call()
          .then(function (response) {
            resolve(response.toString())
          })
          .catch(error => {
            console.log('name error', error)
            resolve('')
          })
    })
  },

  isAdmin(account) {
    return new Promise(resolve => {
      UsersABI.methods.isAdmin(account).call()
          .then(function (response) {
            resolve(response.toString())
          })
          .catch(error => {
            console.log('isAdmin error', error)
            resolve(false)
          })
    })
  },

  // 获取合约静态属性
  async getStaticData() {
    if (UsersABI === null) {
      console.log('invalid contract object')
      return null
    }
    const makerProperty = {}

    makerProperty.name = await this.name()

    return makerProperty

  },

  /**
   * @desc  解锁用户账号
   * @param fromAccount 代币持有者
   * @param account 帐号
   * @param key
   * @param container 容器账号
   * @return Promise bool
  * */
  addUser(fromAccount,account, key,container) {
    // console.log('adduser', fromAccount, account, container)
    if (UsersABI === null) {
      console.log('invalid contract object')
      return false
    }
    return new Promise((resolve) => {
      UsersABI.methods.addUser(account.toString(), key.toString(), container.toString())
          .send({from: fromAccount, gasLimit:Istore.state.gasDef.high})
          .on("receipt", receipt => {
            console.log('user adduser receipt', receipt)
            resolve(true)
          })
          .on('error', (error)=> {
            resolve(false)
            console.log('user adduser error', error)
          })
    })
  },

  /**
   * @desc  取账号信息
   * @param fromAccount 代币持有者
   * @return Promise string
   * */
  getMyAccount(fromAccount) {
    if (UsersABI === null) {
      console.log('invalid users contract object')
      return ''
    }
    return new Promise((resolve) => {
      UsersABI.methods.getMyAccount()
          .call({from: fromAccount, gasLimit: Istore.state.gasDef.low})
          .then(function (response) {
            if (isStrEmpty(response.key)){
              resolve('')
            } else {
              let item = {
                date: response.date,
                owner: fromAccount,
                address: response.account,
                key: response.key,
                container: response.container
              }
              resolve(item)
            }
          })
          .catch(error => {
            console.log('getMyAccount error', {error: error})
            resolve('')
          })
    })
  },

  /**
   * @desc  取账号信息
   * @param fromAccount 代币持有者
   * @param account 帐号
   * @return Promise string
  * */
  getAccount(fromAccount,account) {
    if (UsersABI === null) {
      console.log('invalid contract object')
      return ''
    }
    console.log('getAccount', fromAccount, account)
    return new Promise((resolve) => {
      UsersABI.methods.getAccount(account).call({from:fromAccount,gas:Istore.state.gasDef.low})
          .then(function (response) {
            let item={
              date:response.date,
              address:response.outAccount,
              key:response.key,
              container:response.container
            }
            resolve(item)

          })
          .catch(error => {
            console.log('getAccount error', {error: error})
            resolve('')
          })
    })
  }
}

export default {methods}

import abi from './abi.json'
import deploy from './deploy.json'
import IWeb3 from 'web3'

let deployItem = {
  address: '',
  owner: '',
  network: '',
  chainID: '',
  symbol: ''
}
let ERC20Contract = null

// function init(_tokenAddress) {
//   for (let i = 0; i < deploy.length; i++) {
//     if (deploy[i].address === _tokenAddress) {
//       contractObject = window.web3.eth.Contract(abi, deploy[i].owner).at(deploy[i].address)
//       console.log('init1', contractObject.getAddress(), deploy[i].address, contractObject.getOwner())
//       return contractObject
//     }
//   }
//   console.log('init2', contractObject.getAddress(), contractObject.getOwner())
//   return contractObject
// }

// const TransactionOverrides = {nonce: BigNumberish, gasLimit: BigNumberish, gasPrice: BigNumberish, value: BigNumberish, chainId:42}

const ABI = {

  init(contractAddress) {

    // 在token列表中查找 本次加载的token是否存在
    let isToken = false
    for (let i = 0; i < deploy.length; i++) {
      if (deploy[i].address === contractAddress) {
        isToken = true
        deployItem = deploy[i]
      }
    }

    if (!isToken) {
      console.log('ERC20 invalid token', contractAddress)
      return null
    } else {

      // 设置最大监听器数量，否则出现warning
      // window.web3.currentProvider.setMaxListeners(300)

      // 初始化Web3
      // window.web3 = new Iweb3(window.web3.currentProvider)

      window.web3js = new IWeb3(IWeb3.givenProvider)

      ERC20Contract = new window.web3js.eth.Contract(abi, contractAddress)

      // console.log('address', contractAddress, 'erc20 contract', ERC20Contract )

      return ERC20Contract
    }
  },

  totalSupply() {
    return new Promise((resolve) => {

      ERC20Contract.methods.totalSupply().call()
          .then(function (response) {
            resolve(response.toString())
          })
          .catch(error => {
            console.log('TotalSupply error', error)
            resolve('')
          })
    })
  },

  // 获取合约公开属性
  getProperty() {
    if (ERC20Contract !== null) {
      return new Promise((resolve) => {
        const makerProperty = {}

        ERC20Contract.methods.symbol().call().then(function(response) {
          makerProperty.symbol = response.toString()
        })
        ERC20Contract.methods.name().call().then(function(response) {
          makerProperty.name = response.toString()
        })
        ERC20Contract.methods.totalSupply().call().then(function(response) {
          makerProperty.totalSupply = response.toString()
        })
        resolve(makerProperty)
      })
    } else {
      console.log('invalid contract object')
    }
  },

  balanceOf(token) {

    return new Promise((resolve) => {
      ERC20Contract.methods.balanceOf(token).call()
          .then(function (response) {
            resolve(response.toString())
          })
    })
  },

  approve(from,spender,value) {

    return new Promise((resolve) => {

      ERC20Contract.methods.approve(spender, value)
          .send({from: from})
          .then(function (response) {
            console.log('approve', response.status)
            resolve(response.status)
          })
          .catch(error=>{
            console.log('approve error', error)
            resolve(false)
          })

    })
  },

  allowance(owner, spender) {

    return new Promise((resolve) => {

      ERC20Contract.methods.allowance(owner, spender).call()
          .then(function (response) {
            console.log('allowance', response.toString())
            resolve(response.toString())
          })

    })
  }
}

export default {ABI,deployItem}

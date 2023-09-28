import Istore from '@/store'

import abi from './abi.json'
import deploy from './deploy.json'

let routerObject = null
let deployItem = {
  address: '',
  owner: '',
  network: '',
  chainID: '',
  symbol: ''
}

const methods = {

  init(contractAddress) {

    let isToken = false
    for (let i = 0; i < deploy.length; i++) {
      if (deploy[i].address === contractAddress) {
        isToken = true
        deployItem=deploy[i]
        break
      }
    }
    // console.log('deployItem22', deployItem)
    if (!isToken) {
      console.log('router invalid token', contractAddress)
      return null
    } else {
      Istore.commit('setCurrentRouter', contractAddress)

      routerObject = new window.web3js.eth.Contract(abi, contractAddress)

      return routerObject
    }
  },

  factory() {
    return new Promise((resolve) => {
      routerObject.methods.factory().call()
          .then(function (response) {
            resolve(response.toString())
          })
          .catch(error => {
            resolve('')
            console.log('factory error', error)
          })
    })
  },

  WETH() {
    return new Promise((resolve) => {
      routerObject.methods.WETH().call()
          .then(function (response) {
            resolve(response.toString())
          })
          .catch(error => {
            resolve('')
            console.log('WETH error', error)
          })
    })
  },

  PairTotalSupply(pair) {

    return new Promise((resolve) => {
      routerObject.methods.PairTotalSupply(pair)
          .call()
          .then(function (response) {
            console.log('PairTotalSupply', response)
            resolve(response.toString())
          })
          .catch(error => {
            resolve('')
            console.log('PairTotalSupply error', error)
          })
    })
  },

  getUserLiquidity(user,pair) {

    return new Promise((resolve) => {
      routerObject.methods.userLiquidity(user,pair)
          .call()
          .then(function (response) {
            resolve(response.toString())
          })
          .catch(error => {
            resolve('')
            console.log('userLiquidity error', error)
          })
    })
  },

  // 获取合约静态属性
  async getStaticData() {
    if (routerObject === null) {
      console.log('invalid contract object')
      return null
    }
    const makerProperty = {}

    makerProperty.factory = await this.factory()
    makerProperty.WETH = await this.WETH()

    return makerProperty

  },

  /**
   * @dev 添加流动性方法
   * @param tokenA tokenA地址
   * @param tokenB tokenB地址
   * @param amountADesired 期望数量A
   * @param amountBDesired 期望数量B
   * @param amountAMin 最小数量A
   * @param amountBMin 最小数量B
   * @param to to地址
   * @param deadline 最后期限
   * @return amountA   数量A
   * @return amountB   数量B
   * @return liquidity   流动性数量
   */
  addLiquidity(_tokenA, _tokenB, _amountADesired, _amountBDesired, _amountAMin, _amountBMin, _to) {
    return new Promise((resolve, reject) => {
      let nowTime = parseInt((new Date().getTime() / 1000).toString())
      let deadline = nowTime + Istore.state.ensure

      let amountADesired = _amountADesired * 10 ** Istore.state.decimals
      let amountBDesired = _amountBDesired * 10 ** Istore.state.decimals
      let amountAMin = _amountAMin * 10 ** Istore.state.decimals
      let amountBMin = _amountBMin * 10 ** Istore.state.decimals

      // console.log('addLiquidity', _tokenA, _tokenB, amountADesired, amountBDesired, deadline, window.defaultAccount)

      window.MyContract.methods.addLiquidity(_tokenA, _tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, _to, deadline)
          .send({from: window.defaultAccount})
          .on('confirmation', function(confirmationNumber, receipt) {
            console.log('confirmation', {confirmationNumber: confirmationNumber, receipt: receipt})
          })
          .on('receipt', function(receipt) {
            console.log({receipt: receipt})
          })
          .on('error', function(error, receipt) {
            console.log({error: error, receipt: receipt})
            reject(new Error({error: error, receipt: receipt}))
          })
    })
  },

  /**
   * @dev 添加ETH流动性方法
   * @param fromAccount 发起账号
   * @param token token地址
   * @param amountTokenDesired Token期望数量
   * @param amountTokenMin Token最小数量
   * @param amountETHMin ETH最小数量
   * @param to 地址
   * @param ethValue 地址
   * @return amountToken   Token数量
   * @return amountETH   ETH数量
   * @return liquidity   流动性数量
   */
  addLiquidityETH(fromAccount, token, amountTokenDesired, amountTokenMin, amountETHMin, to, ethValue) {
    // console.log('addLiquidityETH', fromAccount, token, amountTokenDesired, amountTokenMin, amountETHMin, to, ethValue)
    return new Promise((resolve) => {
      let nowTime = parseInt((new Date().getTime() / 1000).toString())
      let deadline = nowTime + Istore.state.ensure

      routerObject.methods.addLiquidityETH(token, amountTokenDesired.toString(), amountTokenMin, amountETHMin, to, deadline)
          .send({from: fromAccount, value: ethValue})
          .on("receipt", receipt => {
            console.log('router addLiquidityETH receipt', receipt)
            resolve(true)
          })
          .on('error', (error)=> {
            console.log('router addLiquidityETH error', error)
            resolve(false)
          })
    })
  },

  getPair(tokenA, tokenB) {
      return new Promise((resolve) => {
          routerObject.methods.getPair(tokenA, tokenB)
              .call()
              .then(function (response) {
                  // console.log('getPair ', response)
                  resolve(response.toString())
              })
              .catch(error => {
                  console.log('getPair error', error)
                  resolve('')
              })
      })
  },

  pairReserves(pair) {
      return new Promise((resolve) => {
          routerObject.methods.pairReserves(pair)
              .call()
              .then(function (response) {
                  resolve(response)
              })
      })
  },

  /**
   * @dev 移除ETH流动性
   * @param token token地址
   * @param liquidity 流动性数量
   * @param amountTokenMin token最小数量
   * @param amountETHMin ETH最小数量
   * @param to to地址
   * @return amountToken   token数量
   * @return amountETH   ETH数量
   */
  removeLiquidityETH(fromAccount, token, liquidity, amountTokenMin, amountETHMin, to) {
      return new Promise((resolve) => {
          let nowTime = parseInt((new Date().getTime() / 1000).toString())
          let deadline = nowTime + Istore.state.ensure

          // console.log('removeLiquidity', token, liquidity, amountTokenMin, amountETHMin, to, routerObject)

          routerObject.methods.removeLiquidityETH(token, liquidity, amountTokenMin, amountETHMin, to, deadline)
              .send({from: fromAccount})
              .on('receipt', function (receipt) {
                  console.log({receipt: receipt})
                  resolve(true)
              })
              .on('error', (error) => {
                  console.log({error: error})
                  resolve(false)
              })
      })
  },

  pairTransferFrom(fromAccount, to, liquidity) {
    return new Promise((resolve, reject) => {
      console.log('pairTransferFrom', fromAccount, to, liquidity)

      routerObject.methods.PairTransferFrom(to, liquidity)
          .send({from: fromAccount})
          .on('receipt', function(receipt) {
            resolve(receipt)
            console.log({receipt: receipt})
          })
          .on('error', (error)=> {
            console.log({error: error})
            reject(error)
          })
    })
  },

  /**
   * @dev 移除流动性
   * @param tokenA tokenA地址
   * @param tokenB tokenB地址
   * @param liquidity 流动性数量
   * @param amountAMin 最小数量A
   * @param amountBMin 最小数量B
   * @param to to地址
   * @param deadline 最后期限
   * @return amountA   数量A
   * @return amountB   数量B
   */
  removeLiquidity(_tokenA, _tokenB, _liquidity, _amountAMin, _amountBMin, _to) {
    return new Promise((resolve, reject) => {
      let nowTime = parseInt((new Date().getTime() / 1000).toString())
      let deadline = nowTime + Istore.state.ensure

      let liquidity = (_liquidity * 10 ** Istore.state.decimals).toString()
      let amountAMin = _amountAMin * 10 ** Istore.state.decimals
      let amountBMin = _amountBMin * 10 ** Istore.state.decimals

      // console.log('removeLiquidity', _tokenA, _tokenB, liquidity, deadline, window.defaultAccount)

      routerObject.methods.removeLiquidity(_tokenA, _tokenB, liquidity, amountAMin, amountBMin, _to, deadline)
          .send({from: window.defaultAccount})
          .on('transactionHash', function(transactionHash) {
            console.log('transactionHash', transactionHash)
          })
          .on('confirmation', function(confirmationNumber, receipt) {
            console.log('confirmation', {confirmationNumber: confirmationNumber, receipt: receipt})
          })
          .on('receipt', function(receipt) {
            console.log({receipt: receipt})
            resolve(receipt)
            // window.location.reload()
          })
          .on('error', function(error, receipt) {
            console.log({error: error, receipt: receipt})
            reject(new Error({error: error, receipt: receipt}))
          })
    })
  },

  /**
   * @dev 带签名移除流动性
   * @param tokenA tokenA地址
   * @param tokenB tokenB地址
   * @param liquidity 流动性数量
   * @param amountAMin 最小数量A
   * @param amountBMin 最小数量B
   * @param to to地址
   * @param deadline 最后期限
   * @param approveMax 全部批准
   * @param v v
   * @param r r
   * @param s s
   * @return amountA   数量A
   * @return amountB   数量B
   */
  removeLiquidityWithPermit() {

  },

  /**
   * @dev 带签名移除ETH流动性
   * @param token token地址
   * @param liquidity 流动性数量
   * @param amountTokenMin token最小数量
   * @param amountETHMin ETH最小数量
   * @param to to地址
   * @param deadline 最后期限
   * @param approveMax 全部批准
   * @param v v
   * @param r r
   * @param s s
   * @return amountToken   token数量
   * @return amountETH   ETH数量
   */
  removeLiquidityETHWithPermit() {

  },

  /**
   * @dev 根据精确的token交换尽量多的token
   * @param amountIn 精确输入数额
   * @param amountOutMin 最小输出数额
   * @param path 路径数组
   * @param to to地址
   * @param deadline 最后期限
   * @return amounts[]  数额数组
   */
  swapExactTokensForTokens() {

  },

  /**
   * @dev 使用尽量少的token交换精确的token
   * @param amountOut 精确输出数额
   * @param amountInMax 最大输入数额
   * @param path 路径数组
   * @param to to地址
   * @param deadline 最后期限
   * @return amounts[]  数额数组
   */
  swapTokensForExactTokens() {

  },

  /**
   * @dev 使用尽量少的ETH交换精确的token
   * @param amountOut 精确输出数额
   * @param path 路径数组
   * @param to to地址
   * @param deadline 最后期限
   * @return amounts[]  数额数组
   */
  swapETHForExactTokens(_amountOut, _pathArray, _to, _value) {
    return new Promise((resolve, reject) => {
      let nowTime = parseInt((new Date().getTime() / 1000).toString())
      let deadline = nowTime + Istore.state.ensure

      let amountOut = _amountOut * 10 ** Istore.state.decimals

      // console.log('swapETHForExactTokens', amountOut, _pathArray, _to, deadline, window.defaultAccount, _value)

      let ethValue = _value * 10 ** Istore.state.decimals
      routerObject.methods.swapETHForExactTokens(amountOut, _pathArray, _to, deadline)
          .send({from: window.defaultAccount, value: ethValue})
          .on('transactionHash', function(transactionHash) {
            console.log('transactionHash', transactionHash)
            resolve(transactionHash)
          })
          .on('confirmation', function(confirmationNumber, receipt) {
            console.log('confirmation', {confirmationNumber: confirmationNumber, receipt: receipt})
          })
          .on('receipt', function(receipt) {
            console.log({receipt: receipt})
            // window.location.reload()
          })
          .on('error', function(error, receipt) {
            console.log({error: error, receipt: receipt})
            reject(new Error({error: error, receipt: receipt}))
          })
    })
  },

  /**
   * @dev 开空仓 平多仓 根据精确的ETH交换尽量多的token
   * @param fromAccount 交易账号
   * @param amountOutMin 最小输出数额
   * @param path 路径数组
   * @param to to地址
   * @param sellWei 卖ETH数量
   * @return Promise bool
   */
  swapExactETHForTokens(fromAccount, amountOutMin, path, to, sellWei) {

    return new Promise((resolve) => {

      let nowTime = parseInt((new Date().getTime() / 1000).toString())
      let deadline = nowTime + Istore.state.ensure
      let to = fromAccount

      // console.log('swapExactETHForTokens', amountOutMin, path, to, deadline, sellWei)

      routerObject.methods.swapExactETHForTokens(amountOutMin, path, to, deadline)
          .send({from: fromAccount, value: sellWei})
          .on("receipt", receipt => {
            console.log('swapExactETHForTokens receipt', receipt)
            resolve(true)
          })
          .on('error', (error)=> {
            console.log('swapExactETHForTokens error', error)
            resolve(false)
          })
    })
  },

  /**
   * @dev 开空仓 平多仓 根据精确的ETH交换尽量多的token 签名交易
   * @param fromAccount 交易账号
   * @param key
   * @param amountOutMin 最小输出数额
   * @param path 路径数组
   * @param to to地址
   * @param sellWei 卖ETH数量
   * @return Promise bool
   */
  swapExactETHForTokensSign(fromAccount, key, amountOutMin, path, to, sellWei) {
    if (routerObject === null) {
      console.log('invalid contract object')
      return false
    }

    return new Promise((resolve) => {

      let nowTime = parseInt((new Date().getTime() / 1000).toString())
      let deadline = nowTime + Istore.state.ensure

      // console.log('swapExactETHForTokensSign',fromAccount, amountOutMin, path, to, deadline, sellWei)

      let rawTx = {
          from: fromAccount,
          to: deployItem.address.toString(),
          value: sellWei,
          gasLimit: Istore.state.gasDef.middle,
          data: routerObject.methods.swapExactETHForTokens(amountOutMin, path, to, deadline).encodeABI()
      }

      // 用Key签名解锁账号
      window.web3js.eth.accounts.signTransaction(rawTx, key)
          .then((signedTx) => {
            window.web3js.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
                .on("receipt", receipt => {
                  console.log('swapExactETHForTokensSign receipt', receipt)
                  resolve(true)
                })
                .on('error', (err)=> {
                  console.log('swapExactETHForTokensSign error', err)
                  resolve(false)
                })
          })
          .catch(error => {
              console.log('swapExactETHForTokensSign signTransaction error', error)
              resolve(false)
          })
    })
  },

  /**
   * @dev 开多仓 平空仓 使用尽量少的token交换精确的ETH
   * @param fromAccount 当前账号
   * @param amountOut 精确ETH输出数额
   * @param amountInMax 最大输入USDT数额
   * @param path 路径数组
   * @param to to地址
   * @return promise bool
   */
  swapTokensForExactETH(fromAccount, amountOut, amountInMax, path, to) {
    return new Promise((resolve) => {

      let nowTime = parseInt((new Date().getTime() / 1000).toString())
      let deadline = nowTime + Istore.state.ensure

      // console.log('swapTokensForExactETH', fromAccount, amountOut, amountInMax, path, to, deadline, routerObject)

      routerObject.methods.swapTokensForExactETH(amountOut.toString(), amountInMax.toString(), path, to, deadline)
          .send({from: fromAccount})
          .on("receipt", receipt => {
            console.log('swapTokensForExactETH receipt', receipt)
            resolve(true)
          })
          .on('error', (err)=> {
            console.log('swapTokensForExactETH error', err)
            resolve(false)
          })

    })
  },

  /**
   * @dev 开多仓 平空仓 使用尽量少的token交换精确的ETH 签名交易
   * @param fromAccount 当前账号
   * @param key
   * @param amountOut 精确ETH输出数额
   * @param amountInMax 最大输入USDT数额
   * @param path 路径数组
   * @param to to地址
   * @return promise bool
   */
  swapTokensForExactETHSign(fromAccount, key, amountOut, amountInMax, path, to) {
    // console.log('swapTokensForExactETHSign', fromAccount, amountOut, amountInMax, path, to, deployItem.address.toString())

    if (routerObject === null) {
      console.log('invalid contract object')
      return false
    }

    return new Promise((resolve) => {
      let nowTime = parseInt((new Date().getTime() / 1000).toString())
      let deadline = nowTime + Istore.state.ensure

      let rawTx = {
        from: fromAccount,
        to: deployItem.address.toString(),
        gas: Istore.state.gasDef.middle,
        data: routerObject.methods.swapTokensForExactETH(amountOut.toString(), amountInMax.toString(), path, to, deadline).encodeABI()
      }

      // 用Key签名解锁账号
      window.web3js.eth.accounts.signTransaction(rawTx, key)
          .then((signedTx) => {
            window.web3js.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
                .on("receipt", receipt => {
                  console.log('swapTokensForExactETHSign receipt', receipt)
                  resolve(true)
                })
                .on('error', (err)=> {
                  console.log('swapTokensForExactETHSign error', err)
                  resolve(false)
                })
          })
          .catch(error => {
              console.log('swapTokensForExactETHSign signTransaction error', error)
              resolve(false)
          })
    })
  },

  /**
   * @dev 根据精确的token交换尽量多的ETH
   * @param fromAccount
   * @param amountIn 精确输入数额
   * @param amountOutMin 最小输出数额
   * @param path 路径数组
   * @param to to地址
   * @return Promise bool
   */
  swapExactTokensForETH(fromAccount, amountIn, amountOutMin, path, to) {
    return new Promise(resolve => {
      let nowTime = parseInt((new Date().getTime() / 1000).toString())
      let deadline = nowTime + Istore.state.ensure
      // console.log('swapExactTokensForETH', fromAccount, amountIn, amountOutMin, path, to, routerObject)
      routerObject.methods.swapExactTokensForETH(amountIn.toString(), amountOutMin, path, to, deadline)
          .send({from: fromAccount})
          .on("receipt", receipt => {
            console.log('swapExactTokensForETH receipt', receipt)
            resolve(true)
          })
          .on('error', (err)=> {
            console.log('swapExactTokensForETH error', err)
            resolve(false)
          })
    })
  },

  quote(amountA, reserveA, reserveB) {
      return new Promise((resolve) => {
          routerObject.methods.quote(amountA, reserveA, reserveB)
              .call()
              .then(function (response) {
                  resolve(response.toString())
              })
              .catch(error => {
                  console.log('quote error', error)
                  resolve('')
              })
      })
  },

  // 取储备量
  getReserves(tokenA, tokenB) {
    // console.log('getreserves', tokenA, tokenB)
    return new Promise((resolve) => {
      routerObject.methods.getReserves(tokenA.toString(), tokenB.toString())
          .call()
          .then(function (response) {
            resolve(response)
          })
          .catch(error => {
            console.log('router getReserves', error)
            resolve('')
          })
    })
  },

  // 求输出
  getAmountOut(amountIn, reserveIn, reserveOut) {
      // console.log('getAmountOut', amountIn, reserveIn, reserveOut)
    return new Promise((resolve) => {
      routerObject.methods.getAmountOut(amountIn, reserveIn, reserveOut)
          .call()
          .then(function (response) {
            resolve(response)
          })
          .catch(error => {
            console.log('getAmountOut', error)
            resolve('')
          })
    })
  },

  // 求输入
  getAmountIn(amountOut, reserveIn, reserveOut) {
    return new Promise((resolve) => {
      routerObject.methods.getAmountIn(amountOut, reserveIn, reserveOut)
          .call()
          .then(function (response) {
            resolve(response)
          })
          .catch(error => {
            console.log('getAmountIn', error)
            resolve('')
          })
    })
  },

  // 交换中的输出值,用于指定输入数量取交换值
  getAmountsOut(amountIn, pathArray) {
    return new Promise((resolve) => {
      routerObject.methods.getAmountsOut(amountIn.toString(), pathArray)
          .call()
          .then(function (response) {
            resolve(response)
          })
          .catch(error => {
            console.log('getAmountsOut error', error)
            resolve('')
          })
    })
  },

  // 交换中的输入值,用于指定交换数量取输入值
  getAmountsIn(amountOut, pathArray) {
    return new Promise((resolve) => {
      routerObject.methods.getAmountsIn(amountOut, pathArray)
          .call()
          .then(function (response) {
            resolve(response)
          })
          .catch(error => {
            console.log('getAmountsIn error', error)
            resolve([])
          })
    })
  },

  // 所有事件
  allEvents() {
    routerObject.events.allEvents({fromBlock: 0}, function(error, event) {
      console.log({allEvents: event, error: error})
    }).on('connected', function(subscriptionId) {
      console.log({connected_subscriptionId: subscriptionId})
    }).on('data', function(event) {
      console.log({event_data: event})
    }).on('changed', function(event) {
      console.log({event_changed: event})
    }).on('error', function(error, receipt) {
      console.log({event_error: error, receipt: receipt})
    })
  }
}

export default {methods}

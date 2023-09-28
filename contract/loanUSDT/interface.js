import abi from './abi.json'
import deploy from './deploy.json'
import Istore from "@/store"
import {ellipsisString, formateTime, containerUnPack, tradeTypeUnPack} from "@/common"

let deployItem = {
  address: '',
  owner: '',
  network: '',
  chainID: '',
  symbol: ''
}

let loanUSDTObject = null

const methods = {

    init(contractAddress) {
        let isToken = false
        for (let i = 0; i < deploy.length; i++) {
            if (deploy[i].address === contractAddress) {
                isToken = true
                deployItem = deploy[i]
            }
        }

        if (!isToken) {
            console.log('loanUSDT invalid token', contractAddress)
            return null
        } else {
            // 设置最大监听器数量，否则出现warning
            // window.web3.currentProvider.setMaxListeners(300)

            // 初始化Web3
            // window.web3 = new Iweb3(window.web3.currentProvider)

            // window.web3 = new Iweb3(Iweb3.givenProvider)

            loanUSDTObject = new window.web3js.eth.Contract(abi, contractAddress)

            return loanUSDTObject
        }
    },

    name() {
        return new Promise(resolve => {
            loanUSDTObject.methods.name().call()
                .then(function (response) {
                    console.log('name', response.toString())
                    resolve(response.toString())
                })
                .catch(error => {
                    console.log('name error', error)
                    resolve('')
                })
        })
    },

    rateDenominator() {
        return new Promise(resolve => {
            loanUSDTObject.methods.rateDenominator()
                .call({from: Istore.state.metamask.account, gasLimit: Istore.state.gasDef.middle})
                .then(function (response) {
                    resolve(response.toString())
                })
                .catch(error => {
                    console.log('usdt rateDenominator error', error)
                    resolve('')
                })
        })
    },

    // 借款利率
    borrowDailyRate(rateDenominator) {
        return new Promise(resolve => {
            loanUSDTObject.methods.borrowDailyRate()
                .call({from: Istore.state.metamask.account, gasLimit: Istore.state.gasDef.middle})
                .then(function (response) {
                    resolve(response.toString() / rateDenominator)
                })
                .catch(error => {
                    console.log('usdt borrowDailyRate error', error)
                    resolve('')
                })
        })
    },

    taxRate(rateDenominator) {
        return new Promise(resolve => {
            loanUSDTObject.methods.taxRate().call()
                .then(function (response) {
                    resolve(response.toString() / rateDenominator)
                })
                .catch(error => {
                    console.log('taxRate error', error)
                    resolve('')
                })
        })
    },

    taxTotal() {
        return new Promise(resolve => {
            loanUSDTObject.methods.taxTotal().call()
                .then(function (response) {
                    resolve(response.toString())
                })
                .catch(error => {
                    console.log('taxTotal error', error)
                    resolve('')
                })
        })
    },

    // 获取合约静态属性
    async getStaticData() {
        if (loanUSDTObject === null) {
            console.log('invalid contract object')
            return null
        }

        const makerProperty = {}

        let rateDenominator = await this.rateDenominator()
        if (rateDenominator !== '') {
            makerProperty.borrowDailyRate = await this.borrowDailyRate(rateDenominator)
        }

        //
        // await loadUSDTObject.methods.rateDenominator().call()
        //     .then(function (response) {
        //       makerProperty.rateDenominator = response.toString()
        //
        //       loadUSDTObject.methods.borrowDailyRate().call()
        //           .then(function (response) {
        //             makerProperty.borrowDailyRate = response.toString() / makerProperty.rateDenominator
        //           })
        //           .catch(error => {
        //             console.log('getStaticData borrowDailyRate', error)
        //             makerProperty.borrowDailyRate = ''
        //           })
        //
        //       loadUSDTObject.methods.taxRate().call()
        //           .then(function (response) {
        //             makerProperty.taxRate = response.toString() / makerProperty.rateDenominator
        //           })
        //           .catch(error => {
        //             console.log('getStaticData taxRate', error)
        //             makerProperty.taxRate = ''
        //           })
        //
        //     })
        //     .catch(error => {
        //       console.log('getStaticData rateDenominator', error)
        //       makerProperty.rateDenominator = ''
        //     })
        //
        // await loadUSDTObject.methods.taxTotal().call()
        //     .then(function (response) {
        //       makerProperty.taxTotal = response.toString()
        //     })
        //     .catch(error => {
        //       console.log('getStaticData taxTotal', error)
        //       makerProperty.taxTotal = ''
        //     })

        return makerProperty
    },

    // 取借款记录
    getBorrowerRecord(account) {
        return new Promise((resolve) => {
            loanUSDTObject.methods.borrowers(account.toString())
                .call({from: Istore.state.metamask.account, gasLimit: Istore.state.gasDef.low})
                .then(function (response) {

                    if (response !== null && response.wad > 0) {

                        let containerAnalytic=containerUnPack(response.container.toString())

                        let resPrice = window.web3js.utils.fromWei(response.price.toString())
                        let priceValue = Math.floor(resPrice * 10000) / 10000

                        let resCost = window.web3js.utils.fromWei(response.cost.toString())
                        let costValue = Math.floor(resCost * 10000) / 10000

                        let resWad = window.web3js.utils.fromWei(response.wad.toString())
                        let wadValue = Math.floor(resWad * 10000) / 10000

                        let resRepay = window.web3js.utils.fromWei(response.repay.toString())
                        let repayValue = Math.floor(resRepay * 10000) / 10000

                        let wadNetMeta = BigInt(response.wad.toString()) - BigInt(response.repay.toString())
                        let wadNetValue = Math.floor(window.web3js.utils.fromWei(wadNetMeta.toString()) * 10000) / 10000

                        // 对手币持仓
                        let positionMeta = response.position.toString()
                        let resPosition = window.web3js.utils.fromWei(positionMeta.toString())
                        let positionDecimal4 = Math.floor(resPosition * 10000) / 10000

                        // 时间戳转换
                        let fmDate = formateTime(parseInt(response.date.toString()) * 1000)
                        let fmUpDate = formateTime(parseInt(response.update.toString()) * 1000)
                        // 小于2020年则表示无效日期
                        if (response.update < 1610211661) {
                            fmUpDate = fmDate
                        }

                        let item = {
                            symbol: deployItem.symbol,
                            user: account,
                            userShort: ellipsisString(account.toString(), 7, 5),
                            date: fmDate,
                            lever: containerAnalytic.leveraged,
                            tradeType: tradeTypeUnPack(containerAnalytic.tradeType),
                            price: priceValue,
                            cost: costValue,
                            wad: wadValue,
                            repay: repayValue,
                            wadNetMeta: wadNetMeta, // 原数据 未缩减的
                            wadNet: wadNetValue,
                            position: positionDecimal4,
                            positionMeta: positionMeta,
                            update: fmUpDate
                        }
                        resolve(item)
                        // console.log('usdt getBorrowerRecord', item)
                        // let borrowQty = wadValue - repayValue
                        // that.MyBorrowerRateCount(that.defaultAccount, window.web3.utils.toWei(borrowQty.toString()))
                    } else {
                        resolve('')
                    }
                })
                .catch(error => {
                    resolve('')
                    console.log('loanUSDT getBorrowerRecord error', error)
                })
        })
    },

    // 取存款记录
    getDeposit(fromUser) {
        if (loanUSDTObject === null) {
            console.log('invalid contract object')
            return
        }
        return new Promise((resolve) => {

            loanUSDTObject.methods.deposits(fromUser).call({from: Istore.state.metamask.account, gasLimit: Istore.state.gasDef.low})
                .then(function (response) {
                    let resWad = window.web3js.utils.fromWei(response.wad)
                    let wadValue = Math.floor(resWad * 10000) / 10000

                    let resInterest = window.web3js.utils.fromWei(response.interest)
                    let interestValue = Math.floor(resInterest * 10000) / 10000

                    let fmDate = formateTime(parseInt(response.date.toString()) * 1000)
                    let fmUpDate = formateTime(parseInt(response.update.toString()) * 1000)

                    if (response.update < 1610211661) {
                        fmUpDate = fmDate
                    }

                    let item = {
                        userShow: ellipsisString(fromUser, 8, 5),
                        date: fmDate,
                        interest: interestValue,
                        wad: wadValue,
                        update: fmUpDate
                    }
                    resolve(item)
                })
                .catch(error => {
                    console.log('getDeposits', error)
                })
        })
    },

    depositTotal() {
        if (loanUSDTObject === null) {
            console.log('invalid contract object')
            return null
        }
        return new Promise((resolve) => {
            // 用户存款总额
            loanUSDTObject.methods.depositTotal().call({from: Istore.state.metamask.account, gas: Istore.state.gasDef.low})
                .then(function (response) {
                    let res = window.web3js.utils.fromWei(response.toString())
                    let res1 = Math.floor(res * 10000) / 10000
                    resolve(res1)
                })
                .catch(Error => {
                    console.log('usdt depositTotal error', Error)
                    resolve(0)
                })
        })
    },

    getTokenBalance() {
        if (loanUSDTObject === null) {
            console.log('invalid contract object')
            return ''
        }
        return new Promise((resolve) => {
            // 用户存款总额
            loanUSDTObject.methods.getTokenBalance()
                .call({from: Istore.state.metamask.account, gasLimit: Istore.state.gasDef.low})
                .then(function (response) {
                    let res = window.web3js.utils.fromWei(response.toString())
                    let res1 = Math.floor(res * 10000) / 10000
                    // console.log('getTokenBalance', res1, response.toString())
                    resolve(res1)
                })
                .catch(Error => {
                    console.log('getTokenBalance error', Error)
                    resolve('')
                })
        })
    },

    balanceOf(token) {
        // const owner = '0x379F025b37E04d9d5ec4e3198b36717FA54C513c'
        // let token = '0xed0Baccf4505dEC2A97477F16b2A008a7e377440'
        if (deployItem.owner !== '') {
            return new Promise((resolve) => {
                const makerProperty = {}
                loanUSDTObject.methods.balanceOf(token).call({from: Istore.state.metamask.account, gas: Istore.state.gasDef.low}).then(function (response) {
                    makerProperty.balanceOf = response.toString()
                })
                resolve(makerProperty)
            })
        } else {
            console.log('invalid token owner')
        }
    },

    // 存款
    deposit(from, value) {
        if (loanUSDTObject === null) {
            console.log('invalid contract object')
            return null
        }
        return new Promise((resolve) => {

            loanUSDTObject.methods.addDeposit(from, value)
                .send({from: from})
                .on('transactionHash', function (hash) {
                    console.log(hash);
                })
                .then(function (response) {
                    console.log('deposit', response)
                    resolve(true)

                })
                .catch(error => {
                    console.log({error: error})
                    resolve(false)
                })
        })
    },

    // 取款
    withdraw(fromAccount, inputValue) {
        if (loanUSDTObject === null) {
            console.log('invalid contract object')
            return null
        }
        return new Promise((resolve) => {

            loanUSDTObject.methods.withdraw(inputValue)
                .send({from: fromAccount})
                .on('transactionHash', function (hash) {
                    console.log(hash);
                })
                .then(function (response) {
                    console.log('withdraw', response)
                    resolve(true)

                })
                .catch(error => {
                    console.log({error: error})
                    resolve(false)
                })
        })
    },

    // 借款
    /**
     * @desc USDT 用户融资
     * @param fromAccount 发出账号
     * @param cost 本次借款占用本金
     * @param value 借出数量
     * @param position 对手币仓位
     * @param to 借款接收账号
     * @param price
     * @param container 容器字段*/
    borrow(fromAccount, cost, value, position, to, price, container) {
        if (loanUSDTObject === null) {
            console.log('invalid contract object')
            return ''
        }
        return new Promise((resolve) => {
            loanUSDTObject.methods.borrow(cost, value, position, to, price, container)
                .send({
                    from: fromAccount
                })
                .on("receipt", receipt => {
                    let mytime=new Date()
                    console.log('loadUsdt borrow receipt', mytime.getTime(), receipt)
                    resolve(value)
                })
                .on('error', (error)=> {
                    console.log('loadUsdt borrow error', error)
                    resolve('')
                })
        })
    },

    // 还款 (还USDT)
    repay(fromAccount, value, price, position) {
        console.log('repay', fromAccount, value, price,position)
        return new Promise((resolve) => {
            loanUSDTObject.methods.repay(value, price, position)
                .send({
                    from: fromAccount
                })
                .on("receipt", receipt => {
                    console.log('loadUsdt repay receipt', receipt)
                    resolve(value)
                })
                .on('error', (error)=> {
                    console.log('loadUsdt repay error', error)
                    resolve('')
                })
        })
    },

    // 还款 (还USDT)
    repaySign(fromAccount, key, repayCount, price, position) {
        console.log('repaySign', fromAccount, repayCount, price, position, deployItem.address)

        // repaySign 0xaC8cbc537BF1a68D077631D00aF77ED7D1bf229e
        // 3312832981286370496903 2084181925000000300000 1500000000000000000

        return new Promise((resolve) => {

            let rawTx = {
                from: fromAccount,
                to: deployItem.address.toString(),
                gas: Istore.state.gasDef.middle,
                data: loanUSDTObject.methods.repay(repayCount.toString(),price.toString(),position.toString()).encodeABI()
            }

            // 用Key签名解锁账号
            window.web3js.eth.accounts.signTransaction(rawTx, key)
                .then((signedTx) => {
                    window.web3js.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
                        .on("receipt", receipt => {
                            console.log('loadUsdt repay receipt', receipt)
                            resolve(true)
                        })
                        .on('error', (error)=> {
                            console.log('loadUsdt repay error', error)
                            resolve(false)
                        })
                })
                .catch(error => {
                    console.log('loadUsdt repay sign error', error)
                    resolve(false)
                })
        })
    },

    // 统计借款利息
    MyBorrowerRateCount(fromAccount, qty) {
        if (loanUSDTObject === null) {
            console.log('invalid contract object')
            return ''
        }
        return new Promise((resolve) => {
            loanUSDTObject.methods.MyBorrowerRateCount(fromAccount, qty.toString())
                .call({from: Istore.state.metamask.account, gasLimit: Istore.state.gasDef.low})
                .then(function (response) {
                    resolve(response.toString())
                })
                .catch(error=>{
                    resolve('')
                    console.log('loanUsdt MyBorrowerRateCount error', error)
                })
        })
    },
}

export default {methods}

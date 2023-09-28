import abi from './abi.json'
import deploy from './deploy.json'
import Istore from '@/store'
import {containerUnPack, ellipsisString, formateTime, tradeTypeUnPack} from "@/common"

// import {setting as Iglobal} from '@/utils/common'
// import web3 from 'web3'

// 需将MetaMask网络设为rpc

// const address = '0x00f91550ECA84EC7b7b897293fE2F036ae6b26b5' // tts
// arbitrum tts: 0xB53ccaE82fE11D900Ad3F3A1b583dA7b0578dD26

// let Web3 = require('web3')
// var web3Provider = new Web3('http://localhost:8545')
// var web3Provider = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

// let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
let deployItem = {
    address: '',
    owner: '',
    network: '',
    chainID: '',
    symbol: ''
}

let loanETHObject = null

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
            console.log('loanETH invalid token', contractAddress)
            return null
        } else {

            // window.web3 = new Iweb3(Iweb3.givenProvider)

            loanETHObject = new window.web3js.eth.Contract(abi, contractAddress)

            return loanETHObject
        }
    },

    name() {
        return new Promise(resolve => {
            loanETHObject.methods.name().call()
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
            loanETHObject.methods.rateDenominator()
                .call({from: Istore.state.metamask.account, gasLimit: Istore.state.gasDef.middle})
                .then(function (response) {
                    resolve(response.toString())
                })
                .catch(error => {
                    console.log('eth rateDenominator error', error)
                    resolve('')
                })
        })
    },

    borrowDailyRate(rateDenominator) {
        return new Promise(resolve => {
            loanETHObject.methods.borrowDailyRate().call()
                .then(function (response) {
                    resolve(response.toString() / rateDenominator)
                })
                .catch(error => {
                    console.log('ETH borrowDailyRate error', error)
                    resolve('')
                })
        })
    },

    taxRate(rateDenominator) {
        return new Promise(resolve => {
            loanETHObject.methods.taxRate().call()
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
            loanETHObject.methods.taxTotal().call()
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
        if (loanETHObject === null) {
            console.log('invalid contract object')
            return null
        }
        const makerProperty = {}

        let rateDenominator = await this.rateDenominator()
        if (rateDenominator !== '') {
            makerProperty.borrowDailyRate = await this.borrowDailyRate(rateDenominator)
        }
        return makerProperty
    },

    // 获取合约动态属性
    async getDynamicData2() {
        if (loanETHObject === null) {
            console.log('invalid contract object')
            return null
        }
        const makerProperty = {}

        // 合约代币余额
        await loanETHObject.methods.getBalance().call({from: Istore.state.metamask.account, gas: Istore.state.gasDef.low}).then(function (response) {
            let res = window.web3.utils.fromWei(response.toString())
            makerProperty.getBalance = Math.floor(res * 10000) / 10000
        })

        // 税收总额
        await loanETHObject.methods.taxTotal().call({from: Istore.state.metamask.account, gas: Istore.state.gasDef.low}).then(function (response) {
            let res = window.web3.utils.fromWei(response.toString())
            makerProperty.taxTotal = Math.floor(res * 10000) / 10000
        })

        // 存款总额
        await loanETHObject.methods.depositTotal().call({from: Istore.state.metamask.account, gas: Istore.state.gasDef.low}).then(function (response) {
            let res = window.web3.utils.fromWei(response.toString())
            makerProperty.depositTotal = Math.floor(res * 10000) / 10000
        })

        return makerProperty
    },

    depositTotal() {
        if (loanETHObject === null) {
            console.log('invalid contract object')
            return null
        }
        return new Promise((resolve) => {
            // 用户存款总额
            loanETHObject.methods.depositTotal().call({from: Istore.state.metamask.account, gas: Istore.state.gasDef.low})
                .then(function (response) {
                    let res = window.web3js.utils.fromWei(response.toString())
                    let res1 = Math.floor(res * 10000) / 10000
                    resolve(res1)
                })
                .catch(Error => {
                    console.log('depositTotal error', Error)
                    resolve(0)
                })
        })
    },

    getBalance() {
        if (loanETHObject === null) {
            console.log('invalid contract object')
            return null
        }
        return new Promise((resolve) => {
            // 用户存款总额
            loanETHObject.methods.getBalance()
                .call({from: Istore.state.metamask.account, gasLimit: Istore.state.gasDef.middle})
                .then(function (response) {
                    let res = window.web3js.utils.fromWei(response.toString())
                    let res1 = Math.floor(res * 10000) / 10000
                    resolve(res1)
                })
                .catch(Error => {
                    console.log('loanETH  getBalance error', Error)
                    resolve('')
                })
        })
    },

    // 取存款记录
    getDeposit(fromUser) {
        if (loanETHObject === null) {
            console.log('invalid contract object')
            return
        }
        return new Promise((resolve) => {

            loanETHObject.methods.deposits(fromUser).call({from: Istore.state.metamask.account, gas: Istore.state.gasDef.low})
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
                    console.log('getDepositers error', error)
                })
        })
    },

    // 取借款记录
    getBorrowerRecord(fromUser) {
        if (loanETHObject === null) {
            console.log('invalid contract object')
            return ''
        }
        return new Promise((resolve) => {

            loanETHObject.methods.borrowers(fromUser)
                .call({from: Istore.state.metamask.account, gasLimit: Istore.state.gasDef.low})
                .then(function (response) {

                    if (response !== null && response.wad > 0) {

                        let containerUn = containerUnPack(response.container.toString())

                        let resOwner = response.owner.toString()

                        let resPrice = window.web3js.utils.fromWei(response.price.toString())
                        let priceValue = Math.floor(resPrice * 10000) / 10000

                        let resCost = window.web3js.utils.fromWei(response.cost.toString())
                        let costValue = Math.floor(resCost * 10000) / 10000

                        let resWad = window.web3js.utils.fromWei(response.wad.toString())
                        let wadValue = Math.floor(resWad * 10000) / 10000

                        let resRepay = window.web3js.utils.fromWei(response.repay.toString())
                        let repayValue = Math.floor(resRepay * 10000) / 10000

                        let wadNet = BigInt(response.wad.toString()) - BigInt(response.repay.toString())
                        let wadNetDecimal4 = Math.floor(window.web3js.utils.fromWei(wadNet.toString()) * 10000) / 10000

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
                            user: fromUser,
                            userShow: ellipsisString(fromUser, 8, 5),
                            date: fmDate,
                            owner: resOwner,
                            price: priceValue,
                            lever: containerUn.leveraged,
                            tradeType: tradeTypeUnPack(containerUn.tradeType),
                            cost: costValue,
                            wad: wadValue,
                            wadNetMeta: wadNet, // 减去还款后的净借款
                            wadNet: wadNetDecimal4, // 截取4位小数
                            repay: repayValue,
                            position: positionDecimal4,
                            positionMeta: positionMeta,
                            update: fmUpDate
                        }
                        // console.log('getBorrowerRecord eth', item)
                        resolve(item)
                    } else {
                        console.log('getBorrowerRecord empty')
                        resolve('')
                    }

                })
                .catch(function (error) {
                    console.log('loanETH getBorrowerRecord error', error)
                    resolve('')
                })
        })
    },

    /**
     * @desc ETH 用户融资
     * @param fromAccount 发出账号
     * @param cost 本次借款占用本金
     * @param value 借出数量
     * @param position 对手币仓位
     * @param to 借款接收账号
     * @param price
     * @param container 容器字段*/
    borrow(fromAccount, cost, value, position, to, price, container) {
        if (loanETHObject === null) {
            console.log('invalid contract object')
            return
        }
        // console.log('eth borrow', fromAccount, value, position, to, price, container)
        return new Promise((resolve) => {
            loanETHObject.methods.borrow(cost, value, position, to, price, container)
                .send({
                    from: fromAccount,
                    gasLimit: Istore.state.gasDef.middle
                })
                .on("receipt", receipt => {
                    console.log('loanETH borrow receipt', receipt)
                    resolve(true)
                })
                .on('error', (error)=> {
                    console.log('loanETH borrow error', error)
                    resolve(false)
                })
        })
    },

    // 统计借款利息
    MyBorrowerRateCount(fromAccount, borrowerQty) {
        if (loanETHObject === null) {
            console.log('invalid contract object')
            return ''
        }
        return new Promise((resolve) => {
            loanETHObject.methods.MyBorrowerRateCount(fromAccount, borrowerQty.toString())
                .call({from: Istore.state.metamask.account, gas: Istore.state.gasDef.low})
                .then(function (response) {
                    resolve(response.toString())
                })
                .catch(function (error) {
                    console.log('loanETH MyBorrowerRateCount', error)
                    resolve('')
                })
        })
    },

    // 空头还款(还ETH)
    repaySign(fromAccount, key, repayCount, price, position) {
        if (loanETHObject === null) {
            console.log('invalid contract object')
            return false
        }
        console.log('repaySign eth pm', repayCount.toString(), price, position)
        return new Promise((resolve) => {

            let rawTx = {
                from: fromAccount,
                to: deployItem.address.toString(),
                gasLimit: Istore.state.gasDef.high,
                value: repayCount.toString(),
                data: loanETHObject.methods.repay(repayCount.toString(), price, position).encodeABI()
            }

            // 用Key签名解锁账号
            window.web3js.eth.accounts.signTransaction(rawTx, key)
                .then((signedTx) => {
                    window.web3js.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
                        .on("receipt", receipt => {
                            console.log('loanETH repaySign receipt', receipt)
                            resolve(true)
                        })
                        .on('error', (error) => {
                            console.log('loanETH repaySign error', error)
                            resolve(false)
                        })
                })
                .catch(error => {
                    console.log('loanETH repaySign error', error)
                    resolve(false)
                })
        })
    },

    // 空头还款(还ETH)
    repay(fromUser, value, price, rate) {
        let repayCount = BigInt(value.toString()) + BigInt(rate.toString())
        console.log('repay eth pm', fromUser, value, price, rate, repayCount.toString())
        return new Promise((resolve) => {
            loanETHObject.methods.repay(value, rate)
                .send({
                    from: fromUser,
                    value: repayCount.toString()
                })
                .on("receipt", receipt => {
                    console.log('loadETH repay receipt', receipt)
                    resolve(value)
                })
                .on('error', (error)=> {
                    console.log('loadETH repay error', error)
                    resolve('')
                })
        })
    },

    deposit(fromAccount, value) {
        return new Promise(resolve => {

            loanETHObject.methods.addDeposit()
                .send({from: fromAccount, value: value})
                .on("receipt", receipt => {
                    console.log('loadETH deposit receipt', receipt)
                    resolve(true)
                })
                .on('error', (error)=> {
                    console.log('loadETH deposit error', error)
                    resolve(false)
                })
        })
    },

    withdraw(fromAccount, inputValue) {
        return new Promise((resolve) => {

            loanETHObject.methods.withdraw(inputValue)
                .send({from: fromAccount})
                .on("receipt", receipt => {
                    console.log('loadETH withdraw receipt', receipt)
                    resolve(true)
                })
                .on('error', (error)=> {
                    console.log('loadETH withdraw error', error)
                    resolve(false)
                })
        })
    }

}

export default {methods}

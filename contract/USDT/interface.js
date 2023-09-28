
import abi from './abi.json'
import deploy from './deploy.json'
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

let USDTObject = null
let thisContractAddress = ''

const methods = {

    init(contractAddress) {
        let isToken = false
        for (let i = 0; i < deploy.length; i++) {
            if (deploy[i].address === contractAddress) {
                thisContractAddress = contractAddress
                isToken = true
            }
        }

        if (!isToken) {
            console.log('USDT invalid token', contractAddress)
            return null
        } else {

            // 设置最大监听器数量，否则出现warning
            // window.web3.currentProvider.setMaxListeners(300)

            // 初始化Web3
            // window.web3 = new Iweb3(window.web3.currentProvider)
            // window.web3 = new Iweb3(Iweb3.givenProvider)

            USDTObject = new window.web3js.eth.Contract(abi, contractAddress)

            return USDTObject
        }
    },

    symbol() {
        console.log('usdt symbol')
        return new Promise(resolve => {
            USDTObject.methods.symbol().call()
                .then(function (response) {
                    resolve(response.toString())
                })
                .catch(error => {
                    console.log('symbol error', error)
                    resolve('')
                })
        })
    },

    totalSupply() {
        return new Promise(resolve => {
            USDTObject.methods.totalSupply().call()
                .then(function (response) {
                    resolve(response.toString())
                })
                .catch(error => {
                    console.log('totalSupply error', error)
                    resolve('')
                })
        })
    },

    // 获取合约静态属性
    async getStaticData() {
        if (USDTObject === null) {
            console.log('invalid contract object')
            return null
        }
        const makerProperty = {}

        makerProperty.symbol = await this.symbol()
        makerProperty.totalSupply = await this.totalSupply()

        return makerProperty

    },

    // 获取合约动态属性
    async getDynamicData() {
        if (USDTObject === null) {
            console.log('invalid contract object')
            return null
        }
        const makerProperty = {}

        //........

        return makerProperty

    },

    transfer2(from, to, value) {
        if (USDTObject === null) {
            console.log('invalid contract object')
            return false
        }
        console.log('transfer usdt', from, to, value)
        return new Promise((resolve) => {
            USDTObject.methods.transfer(to, value)
                .send({from: from})
                .on("receipt", receipt => {
                    console.log('usdt transfer receipt', receipt)
                    resolve(true)
                })
                .on('error', (error) => {
                    console.log('usdt transfer error', error)
                    resolve(false)
                })
        })
    },

    transfer(from, to, value) {
        if (USDTObject === null) {
            console.log('invalid contract object')
            return false
        }
        console.log('transfer usdt', from, to, value)
        return new Promise((resolve) => {
            USDTObject.methods.transfer(to, value)
                .send({from: from})
                .then(function(receipt){
                    console.log('usdt transfer receipt', receipt)
                    resolve(true)
                })
                .catch(error=>{
                    console.log('usdt transfer error', error)
                    resolve(false)
                })
        })
    },

    async transfer4(from, to, value) {
        if (USDTObject === null) {
            console.log('invalid contract object')
            return false
        }

        console.log('transfer2 usdt', from, to, value)

        let transr = await USDTObject.methods.transfer(to, value).send({from: from, gas: Istore.state.gasDef.middle})
        console.log('transfer2 res', transr)
        return transr

    },

    /**
     * @desc  从当前from账号转出
     * @param from 代币持有者
     * @param to 要转到对象地址
     * @param value 发送值(wei)
     * @return Promise bool
     * */
    transferSign(from, key, to, value) {
        if (USDTObject === null) {
            console.log('invalid contract object')
            return false
        }
        console.log('transferSign', from, to, value, thisContractAddress)
        return new Promise((resolve) => {
            let rawTx = {
            from: from,
            to: thisContractAddress,
            gas: Istore.state.gasDef.low,
            data: USDTObject.methods.transfer(to, value).encodeABI()
            }

            // 用Key签名解锁账号
            window.web3js.eth.accounts.signTransaction(rawTx, key)
                .then((signedTx) => {
                    window.web3js.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
                        .on("receipt", receipt => {
                            console.log('usdt transferSign receipt', receipt)
                            resolve(true)
                        })
                        .on('error', (err) => {
                            console.log('usdt transferSign error', err)
                            resolve(false)
                        })

                })
                .catch(error => {
                    console.log('usdt signTransaction error', error)
                    resolve(false)
                })
        })
    },

    // 签名交易返回字符串hash
    transferSignHash(from, key, to, value) {
        if (USDTObject === null) {
            console.log('invalid contract object')
            return ''
        }
        console.log('transferSign', to, value, thisContractAddress)
        return new Promise((resolve) => {
            let rawTx = {
                from: from,
                to: thisContractAddress,
                gas: Istore.state.gasDef.low,
                data: USDTObject.methods.transfer(to, value).encodeABI()
            }

            // 用Key签名解锁账号
            window.web3js.eth.accounts.signTransaction(rawTx, key)
                .then((signedTx) => {
                    window.web3js.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
                        .on("receipt", receipt => {
                            console.log('usdt transferSign receipt', receipt)
                            resolve(receipt)
                        })
                        .on('error', (err) => {
                            console.log('usdt transferSign error', err)
                            resolve('')
                        })

                })
                .catch(error => {
                    console.log('usdt signTransaction error', error)
                    resolve('')
                })
        })
    },

    // 从from转账到to
    // 需先批准
    transferFrom(GasFrom, from, to, value) {
        console.log('transferFrom', GasFrom, from, to, value)
        if (USDTObject === null) {
            console.log('invalid contract object')
            return false
        }
        return new Promise((resolve) => {
            USDTObject.methods.transferFrom(from, to, value)
                .send({from: GasFrom, gas: Istore.state.gasDef.low})
                .on("receipt", receipt => {
                    console.log('usdt transferFrom receipt', receipt)
                    resolve(true)
                })
                .on('error', (err) => {
                    resolve(false)
                    console.log('usdt transferFrom error', err)
                })
        })
    },

    balanceOf(fromAccount) {
        if (USDTObject === null) {
            console.log('invalid contract object')
            return ''
        }
        return new Promise((resolve) => {
            USDTObject.methods.balanceOf(fromAccount)
                .call({from: Istore.state.metamask.account, gasLimit: Istore.state.gasDef.low})
                .then(function (response) {
                    let res = window.web3js.utils.fromWei(response.toString())
                    res = Math.floor(res * 10000) / 10000
                    resolve({meta: response.toString(), format: res.toString()})
                })
                .catch(Error => {
                    console.log('usdt balanceOf error', fromAccount, Error)
                    resolve('')
                })
        })
    },

    approveSign(from, key, spender, value) {
        if (USDTObject === null) {
            console.log('invalid contract object')
            return false
        }

        return new Promise((resolve) => {
            let rawTx = {
                from: from,
                to: thisContractAddress,
                gasLimit: Istore.state.gasDef.middle,
                data: USDTObject.methods.approve(spender, value).encodeABI()
            }

            // 用Key签名解锁账号
            window.web3js.eth.accounts.signTransaction(rawTx, key)
                .then((signedTx) => {
                    window.web3js.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
                        .on("receipt", receipt => {
                            console.log('usdt approveSign receipt', value, receipt)
                            resolve(true)
                        })
                        .on('error', (err) => {
                            console.log('usdt approveSign error', err)
                            resolve(false)
                        })

                })
                .catch(error => {
                    console.log('usdt approveSign error', error)
                    resolve(false)
                })
        })
    },

    /**
     * @desc  仅批准当前交易值 再次添加前需将原有的allowance清0
     * @param fromAccount 代币持有者
     * @param spender 为要批准的对象地址
     * @param value 批准值(wei)
     * @return Promise bool
     * */
    approve(fromAccount, spender, value) {
        if (USDTObject === null) {
            console.log('invalid contract object')
            return false
        }
        // console.log('usdt approve', fromAccount, value, spender)
        return new Promise((resolve) => {
            USDTObject.methods.approve(spender, value)
                .send({from: fromAccount})
                .on("receipt", receipt => {
                    console.log('usdt approve receipt', receipt)
                    resolve(true)
                })
                .on('error', (err) => {
                    resolve(false)
                    console.log('usdt approve error', err)
                })
        })
    },

    allowance(owner, spender) {
        if (USDTObject === null) {
            console.log('invalid contract object')
            return ''
        }

        return new Promise((resolve) => {
            USDTObject.methods.allowance(owner.toString(), spender.toString())
                .call({from: Istore.state.metamask.account, gasLimit: Istore.state.gasDef.low})
                .then(function (response) {
                    resolve(response.toString())
                })
                .catch(error => {
                    console.log('usdt allowance error', error)
                    resolve('')
                })
        })
    }
}

export default {methods}

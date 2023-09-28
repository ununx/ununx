import Iweb3 from 'web3'
import Istore from '@/store'
import Ierc20Set from "@/contract/ERC20/deploy.json"
import axios from "axios"

// solidity struct tuple[]类型传参 [["a1",1],["a2",2]], ["title0","type0","desp0"]

// 合约区块链相关函数
const Icontract = {

    // 检查浏览器
    checkExpress() {
        let ok = ''
        if (navigator.userAgent.indexOf('Firefox') >= 0) {
            ok = 'Firefox'
        } else if (navigator.userAgent.indexOf('Opera') >= 0) {
            ok = 'Opera'
        } else if (navigator.userAgent.indexOf('Chrome') >= 0) {
            ok = 'Chrome'
        }
        console.log('express:' + ok)
        if (ok === '') {
            // if (confirm('以太坊metamask不支持当前浏览器及移动设备 \n您可以使用chrome firefox opera brave \n不能正常访问google的用户可使用firefox\n详情可查看https://metamask.io')) {
            //   window.open('https://metamask.io')
            // }

            alert('以太坊metamask不支持当前浏览器 \n您可以使用Chrome, Firefox, Opera, Brave \n不能正常访问google的用户  可使用Firefox或Opera\n详情可查看https://metamask.io')
        }
        return ok
    },

    // 检查当前metamask强制选择arbitrum网络
    async checkMetaMask() {
        // if (this.checkExpress() === 0) {
        //     return
        // }

        let networkID = 0
        // console.log('metamask', !window.ethereum, typeof window.ethereum === 'undefined', window.ethereum===undefined)
        if (typeof window.ethereum === 'undefined' || window.ethereum===undefined || !window.ethereum) {
            // alert('error.NotMetaMask')
            console.log('invalid Metamask')
            return networkID

        } else {

            const metamaskProvider = window.ethereum

            window.web3js = new Iweb3(metamaskProvider) // 全局web3js实例

            // metamask网络切换自动刷新
            metamaskProvider.autoRefreshOnNetworkChange = false
            // 检查当前网络是否正确
            // await this.checkArbitrum()

            let requestAccounts = await metamaskProvider.request({method: 'eth_requestAccounts'})

            if (requestAccounts) {

                Istore.state.metamask.account = requestAccounts[0]
                Istore.state.metamask.chainID = await metamaskProvider.request({method: 'net_version'})

                // 注册事件
                // reload on network change
                // networkChanged事件只有当你禁用ethereum.autoRefreshOnNetworkChange属性时才有用
                metamaskProvider.on('chainChanged', chain => {
                    Istore.state.metamask.chainID = chain
                    window.location.reload()
                    console.log('chainID: ', chain)

                })
                // reload on account change
                metamaskProvider.on('accountsChanged', accounts => {
                    Istore.state.metamask.account = accounts[0]
                    window.location.reload()
                })

                networkID = Istore.state.metamask.chainID
            } else {
                console.log('requestAccounts', requestAccounts)
            }
        }

        return networkID
    },

    // 仅取当前metamask信息
    async getMetaMask() {
        // if (this.checkExpress() === 0) {
        //     return
        // }

        let networkID = 0
        // console.log('metamask', !window.ethereum, typeof window.ethereum === 'undefined', window.ethereum===undefined)
        if (typeof window.ethereum === 'undefined' || window.ethereum===undefined || !window.ethereum) {
            // alert('error.NotMetaMask')
            console.log('invalid Metamask')
            return networkID

        } else {

            const metamaskProvider = window.ethereum

            window.web3js = new Iweb3(metamaskProvider) // 全局web3js实例

            // metamask网络切换自动刷新
            metamaskProvider.autoRefreshOnNetworkChange = false

            let requestAccounts = await metamaskProvider.request({method: 'eth_requestAccounts'})

            if (requestAccounts) {

                Istore.state.metamask.account = requestAccounts[0]
                Istore.state.metamask.chainID = await metamaskProvider.request({method: 'net_version'})

                // 注册事件
                // reload on network change
                // networkChanged事件只有当你禁用ethereum.autoRefreshOnNetworkChange属性时才有用
                metamaskProvider.on('chainChanged', chain => {
                    Istore.state.metamask.chainID = chain
                    window.location.reload()
                    console.log('chainID: ', chain)
                })
                // reload on account change
                metamaskProvider.on('accountsChanged', accounts => {
                    Istore.state.metamask.account = accounts[0]
                    window.location.reload()
                })

                networkID = Istore.state.metamask.chainID
            } else {
                console.log('requestAccounts', requestAccounts)
            }
        }

        return networkID
    },

    // 检查当前网络是否为arbitrum测试网 没有则添加
    // 火币 添加和切换网络
    async checkArbitrum() {
        let id = window.ethereum.chainId
        console.log('current chainID', window.web3js.utils.hexToNumber(id))

        let paramData = {
            chainName: 'Arbitrum Test',
            chainId: window.web3js.utils.numberToHex(421611),
            rpcUrls: ['https://rinkeby.arbitrum.io/rpc'],
            blockExplorerUrls: ['https://rinkeby-explorer.arbitrum.io/#/'],
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH', // 2-6 characters long
                decimals: 18,
            }
        }

        // 有则选之无则加之
        await this.switchChain(paramData)
    },

    async addChain(data) {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [data],
            })
        } catch (addError) {
            console.log('add chain error', addError)
        }
    },

    async switchChain(data) {
        try {
            let {chainId} = data
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{chainId}],
            })
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            console.log('switch chain error', switchError)
            if (switchError.code === 4902) {
                await this.addChain(data)
            }
        }
    },

    initContract(address, abi) {
        /*
        '1': Ethereum Main Network
        '2': Morden Test network
        '3': Ropsten Test Network
        '4': Rinkeby Test Network
        '5': Goerli Test Network
        */

        return new Promise((resolve, reject) => {
            // let currentChainId = parseInt(window.ethereum.chainId, 16)

            // 初始化provider
            // let provider = window.web3.currentProvider
            // 初始化Web3
            // window.web3 = new Iweb3(provider)
            // window.web3 = new Iweb3(Iweb3.givenProvider)
            // 获取到当前以太坊网络id
            window.web3js.eth.net.getId().then(function (result) {
                // 设置最大监听器数量，否则出现warning
                // window.web3.currentProvider.setMaxListeners(300)

                if (abi !== undefined) {
                    // 实例化合约
                    window.MyContract = new window.web3js.eth.Contract(abi, address)
                    console.log('address', address, 'contract', window.MyContract)
                    // that.allEvents(window.MyContract)
                    resolve(window.MyContract)
                } else {
                    reject(new Error('Unknow Your ChainId:' + result))
                }
            })
        })
    },

    // 取当前网络已发布的token组成列表
    getTokenSymbolArray(chainID) {
        let res = []
        for (let i = 0; i < Ierc20Set.length; i++) {
            if (Ierc20Set[i].chainID === chainID && Ierc20Set[i].symbol !== '') {
                res.push(Ierc20Set[i].symbol)
            }
        }
        return res
    },

    // 根据选择的symbol和所在网络查找token发布数据
    getSelectToken(symbol, chainID) {
        let tokenItem = ''
        for (let i = 0; i < Ierc20Set.length; i++) {
            if (Ierc20Set[i].symbol === symbol && Ierc20Set[i].chainID === chainID) {
                tokenItem = Ierc20Set[i]
            }
        }
        return tokenItem
    },

    // 取我当前metamask账号的ETH余额
    getBalanceOf(fromAccount) {
        return new Promise(resolve => {
            window.web3js.eth.getBalance(fromAccount)
                .then(function (response) {

                    let res = window.web3js.utils.fromWei(response.toString())
                    res = Math.floor(res * 10000) / 10000

                    // console.log('eth getBalance', fromAccount, response.toString(), res.toString() )
                    resolve({meta: response.toString(), format: res.toString()})
                })
                .catch(error => {
                    console.log('eth getBalance error', error)
                    resolve('')
                })
        })
    },

    // 从当前from账号转出
    ETHTransfer(fromAccount, toAccount, sendValue) {
        // console.log('ETHTransfer',fromAccount,toAccount,sendValue)
        return new Promise(resolve => {
            window.web3js.eth.sendTransaction({
                from: fromAccount,
                to: toAccount,
                gasLimit: Istore.state.gasDef.middle,
                value: sendValue
            })
                .on("receipt", receipt => {
                    console.log('ETH Transfer receipt', receipt)
                    resolve(true)
                })
                .on('error', (error) => {
                    console.log('ETH Transfer error', error)
                    resolve(false)
                })
        })
    },

    // 签名转账从from账号转到to账号, 需提供账号密钥
    ETHTransferSign(fromAccount, key, toAccount, sendValue) {
        console.log('ETHTransferSign', toAccount, sendValue)
        return new Promise(resolve => {
            let rawTx = {
                from: fromAccount,
                to: toAccount,
                gas: Istore.state.gasDef.middle,
                value: sendValue,
            }
            // 用Key签名解锁账号
            window.web3js.eth.accounts.signTransaction(rawTx, key)
                .then((signedTx) => {
                    window.web3js.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
                        .on("receipt", receipt => {
                            console.log('ETHTransferSign receipt', receipt)
                            resolve(true)
                        })
                        .on('error', (err) => {
                            console.log('ETHTransferSign error', err)
                            resolve(false)
                        })

                })
                .catch(error=>{
                    console.log('ETH signTransaction error', error)
                    resolve(false)
                })
        })
    },

    // 从合约中取已有配对及token数据
    allPairs() {
        let that = this
        if (this.factory !== '') {
            this.factoryContract.methods.allPairsLength().call().then(function (response) {
                console.log('allPairsLength', response.toString())
                let _allPairsLength = parseInt(response.toString())
                for (let i = 0; i < _allPairsLength; i++) {
                    that.factoryContract.methods.allPairs(i).call().then(function (response) {
                        let pairAddress = response.toString()
                        if (pairAddress !== '') {
                            that.routerContract.methods.getPropertyfromPair(pairAddress).call().then(function (response) {
                                let token0 = response[1].toString()
                                let token1 = response[2].toString()
                                let pairItem = {}
                                let token0set = {}
                                let token1set = {}
                                for (let i2 = 0; i2 < Ierc20Set.length; i2++) {
                                    if (Ierc20Set[i2].address === token0) {
                                        token0set = Ierc20Set[i2]
                                    }

                                    if (Ierc20Set[i2].address === token1) {
                                        token1set = Ierc20Set[i2]
                                    }
                                }

                                pairItem.pairAddress = pairAddress
                                pairItem.token0 = token0set
                                pairItem.token1 = token1set

                                // 以基础单位1取兑换价格 默认从token0 到 token1
                                that.routerContract.methods.getReserves(token0set.address, token1set.address).call().then(function (response) {
                                    let token0_reserves = response[0].toString()
                                    let token1_reserves = response[1].toString()
                                    let token0_reservesfix = Math.floor(window.web3js.utils.fromWei(token0_reserves.toString()) * 10000) / 10000

                                    if (token0_reservesfix > 0) {
                                        let token_from_valueWei = window.web3js.utils.toWei('1')
                                        that.routerContract.methods.getAmountOut(token_from_valueWei.toString(), token0_reserves.toString(), token1_reserves.toString()).call().then(function (response) {
                                            let res = window.web3js.utils.toBN(response.toString()) / (10 ** 18)
                                            pairItem.Price01 = Math.floor(res * 10000) / 10000
                                            that.pairToken.unshift(pairItem)
                                        })
                                    } else {
                                        pairItem.Price01 = 0
                                        that.pairToken.unshift(pairItem)
                                    }
                                })
                            })
                        }
                    })
                }
                console.log('allPairItem', that.pairToken)
            })
        } else {
            console.log('contract invalid')
        }
    },

    // 取ETH兑美元汇率
    getETHRate2() {
        // let mainNet = 'https://apiv2.bitz.com/Market/currencyCoinRate?coins=eth,usdt'// 墙
        let mainNet = 'https://api.coindog.com/api/v1/tick/HUOBIPRO:ETHUSDT?unit=usd'
        return new Promise(resolve => {
            axios.get(mainNet)
                .then(function (Response) {
                    console.log('response', Response)
                    // let dataEth = JSON.stringify(Response.data.data.eth)
                    let dataEthJson = JSON.parse(Response.toString())
                    console.log('response22', dataEthJson)
                    resolve(dataEthJson)
                })
        })
    },
}
// 合约区块链相关函数
export {Icontract}


// 公用函数

// https://pv.sohu.com/cityjson?ie=utf-8

/**
 * 为字符串插入字符 其中soure为原字符串,start为将要插入字符的位置，newStr为要插入的字符
 * 可用于转换长int数字为小数
 * 可在没有web3的页面替代fromWei
 * */
export function getLocalIp() {
    let mainNet = 'https://pv.sohu.com/cityjson?ie=utf-8'
    return new Promise(resolve => {
        axios.get(mainNet)
            .then(function (Response) {
                // let dataEth = JSON.stringify(Response.data.data.eth)
                let dataEthJson = JSON.parse(Response.toString())
                resolve(dataEthJson)
            })
    })
}

/**
 * 为字符串插入字符 其中soure为原字符串,start为将要插入字符的位置，newStr为要插入的字符
 * 可用于转换长int数字为小数
 * 可在没有web3的页面替代fromWei
 * */
export function strFromWei(str){
    str= str.toString()
    let strLen = str.length
    let wei = 19
    if (strLen<wei){
      str = strCompletion(str, wei)
    }

    let start = str.length - (wei-1)
    let addStr = '.'

    return str.slice(0, start) + addStr + str.slice(start)
}

/**
 * 字串安指定长度位数前置补0
 * @param {string} str
 * @param {number} Digits
 * */
export function strCompletion(str,Digits) {
    let diff = Digits - str.toString().length
    let completion = ''
    if (diff > 0) {
        for (let i = 0; i < diff; i++) {
           completion = completion + '0'
        }
    }

    return completion + str
}

// 交易类型封装 10开多 11平多 20开空 21平空
export const tradeType={loan:'10',loanClose:'11',short:'20',shortClose:'21'}
// 融资记录状态 1正常 0非正常 后续可加2,3 4
export const recordStatus={normal:'1',abnormal:'0'}

/**
 * 杠杆合约借款容器字段打包
 *  container为包括多个短字段的容器字段 在前端打包和还原(后期可叠加内容)
 *  以1开头1位为状态 3位表示杠杆倍数(001) 2位为交易类型 10开多 11平多 20开空 21平空
 * @param {string} status
 * @param {string} leveraged
 * @param {string} tradeType
 * */
export function containerPack(status,leveraged, tradeType) {
    // 以1开头 3位表示杠杆倍数(10杠杆010) 2位交易类型 10开多 11平多 20开空 21平空
    return '1' + status.toString() + strCompletion(leveraged.toString(),3) + tradeType.toString()

}

/**
 * 杠杆合约借款容器字段解析还原
 * container为包括多个短字段的容器字段 在前端打包和还原(后期可叠加内容)
 * 以1开头 1位状态(参考状态定义) 3位表示杠杆倍数(001) 2位为交易类型(参考类型定义)
 * @param {string} leveraged
 * @param {number} tradeType
 * */
export function containerUnPack(packStr) {

    // 解析状态(1位 共1位)
    let status = packStr.substr(1,1)

    // 解析杠杆倍数(第2至4位 共3位 取消前缀 0 )
    let leveraged1 = packStr.substr(2, 3)
    let leveraged = ''
    for (let i=0; i<leveraged1.length; i++) {
        if (leveraged1.substr(i,1)!=='0') {
            leveraged = leveraged1.substr(i, leveraged1.length - i)
            break
        }
    }

    // 解析交易类型(第5至6位 共2位)
    let tradeType = packStr.substr(5, 2)

    return {status, leveraged, tradeType}

}

export function isStrEmpty(stringIn) {
    if ( stringIn===null || stringIn === undefined || stringIn === 'undefined' || typeof stringIn === 'undefined') {
        return true
    } else {
        if (stringIn.toString().trim() === '') {
            return true
        } else {
            return false
        }
    }
}

/**
 * 交易类型字段解析 返回字串
 *  10开多 11平多 20开空 21平空
 * @param {string} tradeTypeStr
 * */
export function tradeTypeUnPack(tradeTypeStr) {
    let res = tradeTypeStr
    switch (tradeTypeStr) {
        case tradeType.loan:
            res = 'Long'
            break
        case tradeType.loanClose:
            res = 'LongClose'
            break
        case tradeType.short:
            res = 'Short'
            break
        case tradeType.shortClose:
            res = 'ShortClose'
            break
    }

    return res
}

/**
 * 格式化时间戳为 {年, 月, 日, 时, 分, 秒}
 * @param {number} time
 */
export function formateTime(time) {
    const current = new Date(time)
    let month = current.getMonth() + 1
    let date = current.getDate()
    let hour = current.getHours()
    let min = current.getMinutes()
    let sec = current.getSeconds()
    let year = current.getFullYear()
    month = month < 10 ? '0' + month : month
    date = date < 10 ? '0' + date : date
    hour = hour < 10 ? '0' + hour : hour
    min = min < 10 ? '0' + min : min
    sec = sec < 10 ? '0' + sec : sec
    return year+'.'+month+'.'+date+' ' + hour+':'+min+':'+sec
    // return {
    //     year: year,
    //     month,
    //     date,
    //     hour,
    //     min,
    //     sec
    // }
}

/**
 * 省略显示长字符串 1234...789
 * start前面保留位数
 * end后面保留位数
 * @param {string} str
 * @param {number} start
 * @param {number} end
 */
export function ellipsisString(str, start, end) {
    return str.slice(0, start) + '...' + str.slice(-end)
}
/**
 * 格式化时间戳为 2019-11-12
 * @param {number} time
 */
export function chineseDateTime(time) {
    const { year, month, date } = formateTime(time)
    return `${year}-${month}-${date}`
}
/**
 * 格式化时间戳为 13:13:14
 * @param {number} time
 */
export function chineseTime(time) {
    const { hour, min, sec } = formateTime(time)
    return `${hour}:${min}:${sec}`
}
/**
 * 格式化时间戳为 2020年11月12日 13时13分13秒
 * @param {number} time
 */
export function chineseDate(time) {
    const { year, month, date, hour, min, sec } = formateTime(time)
    return `${year}年${month}月${date}日 ${hour}时${min}分${sec}秒`
}
/**
 * 格式化时间戳为 01:59:59
 * @param {number} playtime
 */
export function formatNumber(playtime) {
    let h = Math.floor(playtime / 3600)
    let min = Math.floor(playtime / 60) % 60
    let s = playtime % 60
    s = s < 10 ? '0' + s : s
    min = min < 10 ? '0' + min : min
    h = h < 10 ? '0' + h : h
    return `${h}:${min}:${s}`
}

/**
 * 下载文件
 * @param {string} name
 * @param {blob} data
 * @param {string} extension
 */
export function exportFile(name, data, extension = 'pdf') {
    const link = document.createElement('a')
    link.download = `${name}.` + extension
    link.style.display = 'none'
    link.href = URL.createObjectURL(data)
    document.body.appendChild(link)
    link.click()
    URL.revokeObjectURL(link.href)
    document.body.removeChild(link)
}
export const createFile = (href, fileName) => {
    const save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
    save_link.href = href
    save_link.download = fileName

    const event = document.createEvent('MouseEvents')
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    save_link.dispatchEvent(event)
}
/**
 * 判断邮箱
 * @param {*} s
 */
export const isEmail = (s) => {
    return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(s)
}

/**
 * 判断手机号码
 * @param {*} s
 */
export const isMobile = (s) => {
    return /^1[0-9]{10}$/.test(s)
}

/**
 * 判断电话号码
 * @param {*} s
 */
export const isPhone = (s) => {
    return /^([0-9]{3,4}-)?[0-9]{7,8}$/.test(s)
}

/**
 * 滚动到顶部
 */
export const scrollToTop = () => {
    const c = document.documentElement.scrollTop || document.body.scrollTop
    if (c > 0) {
        window.requestAnimationFrame(scrollToTop)
        window.scrollTo(0, c - c / 8)
    }
}

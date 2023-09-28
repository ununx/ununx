
const PledgeABI = require('./abi.json')
const Iweb3 = require('web3')
const Iaxios = require('axios')
const pledgeTag = {UNIV2:'UNIV2', OPS:'OPS'}
const unitLinqudity = 88 // 每分钟分发给流动性抵押者的数量 直到资金耗尽
const unitToken = 44 // 每分钟分发给代币抵押者的数量 直到资金耗尽

// rinkeby
// const web3js = new Iweb3(new Iweb3.providers.HttpProvider('https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'))

// Main
const web3js = new Iweb3(new Iweb3.providers.HttpProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'))
let PledgeContract = new web3js.eth.Contract(PledgeABI,'0xE3f540369eCC41635cFC95742e61F90b229e37c7')

console.log('Miner launch ......')


// let num = 1
// let aa = setInterval(async () => {
//     num = num + 1
//     console.log('interval', num)
//
//     if (num > 2) {
//         clearInterval(aa)
//     }
//
// }, 1000)

setInterval(async () => {
    // 每1分种分配一次
    try {
        miner()
    }
    catch (e) {
        console.log(e)
    }

}, 1000*60)

// 挖矿
function miner() {
    // 取用户地址
    // const urlHeader = 'https://www.opswap.io/webapi/api' // 远程测试
    const urlHeader = 'http://localhost/webapi/api' // 发布到服务器
    Iaxios.get(urlHeader+'/pledge/usercount')
        .then(function (Response) {
            const users = JSON.parse(Response.data).Table
            // console.log('users', users.length)
            for (let i = 0; i < users.length; i++) {
                let userAddress = users[i].address.toString()
                // console.log('user', i, userAddress)
                if (web3js.utils.isAddress(userAddress)) {

                    // 分配流动性控矿
                     PledgeContract.methods.getUserLiquidity(userAddress)
                        .call()
                        .then(res => {
                            let myBalance = res[0].toString()
                            let allBalance = res[1].toString()
                            let myRate = myBalance / allBalance
                            let myAsset = myRate * unitLinqudity
                            let myAssetFormat = Math.floor(myAsset * 10000000) / 10000000
                            // console.log('Liquidity res', i, users[i].address, myAsset, myRate, myBalance, allBalance)
                            // 抵押币小于0.000001的不计利
                            if (BigInt(myBalance) > 1000000000000n) {
                                let url = urlHeader + '/pledge/MinerPut?address=' + userAddress + '&tag=' + pledgeTag.UNIV2 + '&mineral=' + myAssetFormat
                                Iaxios.put(url).then(Response => {
                                    // console.log('unitv2 put', Response.status, Response.data)
                                    if(parseInt(Response.status.toString()) === 200 && parseInt(Response.data)>0) {
                                        // console.log('miner', new Date().getTime(), userAddress, pledgeTag.UNIV2, myAsset)
                                    }
                                })
                            }
                        })
                        .catch(error => {
                            console.log('getUserLiquidity error', error)
                        })

                    // 分配流动性控矿
                    PledgeContract.methods.getUserToken(userAddress)
                        .call()
                        .then(res2 => {
                            let myBalance = res2[0].toString()
                            let allBalance = res2[1].toString()
                            let myRate = myBalance / allBalance
                            let myAsset = myRate * unitToken
                            let myAssetFormat = Math.floor(myAsset * 10000000) / 10000000
                            // console.log('token res', i, users[i].address, myAsset, myRate, myBalance, allBalance)
                            // 抵押币小于1的不计利
                            if (BigInt(myBalance) > 1000000000000000000n) {
                                let url = urlHeader + '/pledge/MinerPut?address=' + userAddress + '&tag=' + pledgeTag.OPS + '&mineral=' + myAssetFormat
                                Iaxios.put(url).then(Response => {
                                    // console.log('opp put', Response.status, Response.data)
                                    if(parseInt(Response.status.toString()) === 200 && parseInt(Response.data)>0) {
                                        // console.log('miner', new Date().getTime(), userAddress, pledgeTag.OPS, myAsset)
                                    }
                                })
                            }
                        })
                        .catch(error => {
                            console.log('getUserToken error', error)
                        })
                }
            }

        })
        .catch(error => {
            console.log('UserCount error', error)
        })
}

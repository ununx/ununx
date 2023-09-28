import abi from './abi.json'
import bytecode from './bytecode.json'
import Iweb3 from "web3"
import Istore from '@/store'

// const web3 = new Iweb3('https://kovan2.arbitrum.io/rpc')  // 通过geth连接私有链中的结点。

// const web3 = new Iweb3(window.web3.currentProvider)  // 通过geth连接私有链中的结点。

const deployToken= {

    deploy(name, symbol, supply) {
        return new Promise((resolve, reject) => {
            if (typeof window.web3 === 'undefined') {
                alert('not metamask')
                return
            }
            if (name.toString() === '' || name.toString().length > 20 || symbol.toString() === '' || symbol.toString().length > 10 || supply.toString() === '' || parseInt(supply) < 1) {
                console.log('invalid param')
                alert('invalid param')
                return
            }
            // const web3 = new Iweb3(window.web3.currentProvider)  // 通过geth连接私有链中的结点。
            const web3 = new Iweb3(Iweb3.givenProvider)
            let contract = new web3.eth.Contract(abi);  // 创建合约对象。
            // 部署合约。 from表示部署合约的账户地址。

            let that = this
            contract.deploy({
                data: bytecode.object,//合約的bytecode
                arguments: [name, symbol, supply]//給建構函式傳遞引數，使用陣列
            }).send({
                from: window.web3.eth.defaultAccount,
                gas: Istore.state.gasDef.middle,
                gasPrice: '0',
            }).on('transactionHash', function (transactionHash) {
                console.log('transactionHash', transactionHash)
            }).on('receipt', function (receipt) {
                console.log({receipt: receipt})
                if (receipt.status) {

                    let deployAddress = receipt.options.address
                    let item = {name: name, symbol: symbol, supply: supply, address: deployAddress}

                    let deployed = localStorage.getItem(that.$store.state.tokenStoreKey)

                    let items = []
                    if (deployed !== null) {
                        items = JSON.parse(deployed)
                    }

                    items.push(item)
                    localStorage.setItem(that.$store.state.tokenStoreKey, JSON.stringify(items))

                    resolve(true)
                    console.log('deploy', receipt, items)

                }
            }).on('error', function (error, receipt) {
                reject(false)
                console.log({error: error, receipt: receipt})
            })
        })
    }
}

export default deployToken

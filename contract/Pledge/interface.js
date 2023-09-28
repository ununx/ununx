import abi from './abi.json'
import deploy from './deploy.json'

let ContractABI

const ABI = {

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

            ContractABI = new window.web3js.eth.Contract(abi, contractAddress)

            return ContractABI
        }
    },

    addLiquidity(from,wad) {
        return new Promise(resolve => {
            ContractABI.methods.addLiquidity(wad)
                .send({from:from})
                .then(response=>{

                    let myBalance = response.events.addLiquidityEvent.returnValues.myBalance
                    let total = response.events.addLiquidityEvent.returnValues.total
                    resolve({myBalance:myBalance,total:total})

                })
                .catch(error=>{
                    console.log('addLiquidity error', error)
                    resolve('')
                })
        })
    },

    WithdrawLiquidity(from,wad) {
        return new Promise(resolve => {
            ContractABI.methods.WithdrawLiquidity(wad)
                .send({from:from})
                .then(response=>{
                    let myBalance = response.events.WithdrawLiquidityEvent.returnValues.myBalance
                    let total = response.events.WithdrawLiquidityEvent.returnValues.total

                    resolve({myBalance:myBalance,total:total})

                })
                .catch(error=>{
                    console.log('WithdrawLiquidity error', error)
                    resolve('')
                })
        })
    },

    WithdrawMineral(from,adr,wad) {
        return new Promise(resolve => {
            ContractABI.methods.WithdrawMineral(adr,wad)
                .send({from:from})
                .then(response=>{
                    console.log('WithdrawMineral', response.status)
                    resolve(response.status)

                })
                .catch(error=>{
                    console.log('WithdrawMineral error', error)
                    resolve(false)
                })
        })
    },

    getUserLiquidity(user) {
        return new Promise(resolve => {
            ContractABI.methods.getUserLiquidity(user)
                .call()
                .then(response=>{
                    let myBalance = response[0].toString()
                    let total = response[1].toString()
                    resolve({myBalance:myBalance,total:total})

                })
                .catch(error=>{
                    console.log('getUserLiquidity error', error)
                    resolve('')
                })
        })
    },


    addToken(from,wad) {
        return new Promise(resolve => {
            ContractABI.methods.addToken(wad)
                .send({from:from})
                .then(response=>{

                    let myBalance = response.events.addTokenEvent.returnValues.myBalance
                    let total = response.events.addTokenEvent.returnValues.total
                    resolve({myBalance:myBalance,total:total})

                })
                .catch(error=>{
                    console.log('addToken error', error)
                    resolve('')
                })
        })
    },

    WithdrawToken(from,wad) {
        return new Promise(resolve => {
            ContractABI.methods.WithdrawToken(wad)
                .send({from:from})
                .then(response=>{
                    let myBalance = response.events.WithdrawTokenEvent.returnValues.myBalance
                    let total = response.events.WithdrawTokenEvent.returnValues.total

                    resolve({myBalance:myBalance,total:total})

                })
                .catch(error=>{
                    console.log('WithdrawToken error', error)
                    resolve('')
                })
        })
    },

    getUserToken(user) {
        return new Promise(resolve => {
            ContractABI.methods.getUserToken(user)
                .call()
                .then(response=>{
                    let myBalance = response[0].toString()
                    let total = response[1].toString()
                    resolve({myBalance:myBalance,total:total})

                })
                .catch(error=>{
                    console.log('getUserToken error', error)
                    resolve('')
                })
        })
    },

    name() {
        return new Promise(resolve => {
            ContractABI.methods.name().call()
                .then(function (response) {
                    resolve(response.toString())
                })
                .catch(error => {
                    console.log('name error', error)
                    resolve('')
                })
        })
    },
}

export default {ABI}

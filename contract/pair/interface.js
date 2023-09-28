import abi from './abi.json'

let pairObject = null

const ABI = {

    init(contractAddress) {

        pairObject = new window.web3js.eth.Contract(abi, contractAddress)

        return pairObject

    },

    // 该总量为已发行的总量
    totalSupply() {
        return new Promise((resolve) => {
            pairObject.methods.totalSupply().call()
                .then(function (response) {
                    resolve(response.toString())
                })
                .catch(error => {
                    console.log('PairTotalSupply error', error)
                    resolve('')
                })
        })
    },

    balanceOf(user) {
        return new Promise((resolve) => {
            pairObject.methods.balanceOf(user).call()
                .then(function (response) {
                    resolve(response.toString())
                })
                .catch(error => {
                    resolve('')
                    console.log('pair balanceOf error', error)
                })
        })
    },

    // let pairApprove = await pairContract.methods.approve(roter, approveQty)
    // console.log('pairApprove', pairApprove)

    approve(fromAccount, spender, value) {
        console.log('pair approve pm',fromAccount, spender, value)
        return new Promise((resolve) => {
            pairObject.methods.approve(spender, value)
                .send({from: fromAccount})
                .then(function (response) {
                    console.log('approve', response.status)
                    resolve(response.status)
                })
                .catch(error => {
                    console.log('approve error', error)
                    resolve(false)
                })
        })
    },

    allowance(owner, spender) {
        return new Promise((resolve) => {
            pairObject.methods.allowance(owner, spender).call()
                .then(function (response) {
                    resolve(response.toString())
                })
                .catch(error => {
                    resolve('')
                    console.log('pair allowance error', error)
                })
        })
    }

}

export default {ABI}

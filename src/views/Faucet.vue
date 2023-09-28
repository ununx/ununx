<template>

  <v-container class="text-center px-0">
    <h2 class="mt-5" >OPSWAP.io Faucet</h2>
    <h5 class="blue--text font-weight-light" >{{this.$t('long.FaucetHint1')}}</h5>
    <v-text-field
    v-model="InputMessage.value"
    class="mt-5 mb-2"
    :error="InputMessage.error"
    :error-messages="InputMessage.message"
    label="arbitrum address"/>

    <h5>This faucet is running on the arbitrum layer2 test network</h5>
    <h5>This faucet allows to request once every 24h</h5>
    <h5>1eth and 3000usdt once get</h5>

    <v-btn @click="getToken" class="mt-5 mb-15" :loading="btnLoading" :disabled="btnLoading">GET COIN</v-btn>
<!--    <v-btn @click="test" class="mt-5 mb-15">test</v-btn>-->
<!--    <v-btn @click="transUsdt" class="mt-5 mb-15">transUsdt</v-btn>-->

    <!--数据          -->
    <v-col class="px-0 text-start"
           v-for="(item, i) in Record"
           :key="i"
    >
      <v-divider/>
      <v-row v-if="item!==null" class="text-caption">
        <v-col >{{item.time}}</v-col>
        <v-col >{{item.eth}}eth</v-col>
        <v-col >{{item.usdt}}usdt</v-col>
      </v-row>
      <div v-if="item!==null" class="text-caption">{{item.user}}</div>
    </v-col>

  </v-container>

</template>

<script>
import {Icontract, isStrEmpty, strFromWei} from "@/common"
import Iusdt from "@/contract/USDT/interface"
import axios from "axios"

export default {
name: "Faucet",
  data: () => ({
    localStorageKey:'Faucet',
    btnLoading: false,
    InputMessage: {value: '', error:false, message:''},
    Record:[]
  }),

  mounted() {
    this.init()
  },
  methods:{

    async init() {
      let net_version = await Icontract.checkMetaMask()
      console.log('net_version', net_version)
      if ( net_version === this.$store.state.defaultNetwork ) {

        Iusdt.methods.init(this.$store.state.ContractAddress.USDT)

        // 取metamask当前账号
        this.defaultAccount = this.$store.state.metamask.account

        await this.getRecord(this.defaultAccount)
      }
    },

    getRecord(user) {
      let that = this
      return new Promise((resolve) => {
        let url = 'https://www.opswap.io/webapi/api/Faucet?user=' + user
        axios.get(url).then(Response => {
          // console.log('getRecord', Response.data)
          let row = JSON.parse(Response.data).Table[0]
          if (!isStrEmpty(row)) {
            let item = {
              sysID: row.sysID,
              time: row.sysTime, // 取当前时间戳
              timestamp: new Date(row.sysTime.toString()).getTime(),
              tag: row.tag,
              user: row.user,
              eth: Math.floor(strFromWei(row.eth) * 100) / 100,
              usdt: Math.floor(strFromWei(row.usdt) * 100) / 100
            }

            if (that.Record.length > 0) {
              // 不添加相同记录
              if (that.Record[0].sysID !== item.sysID) {
                that.Record.unshift(item)
              }
            } else {
              that.Record.unshift(item)
            }


            resolve(item)
          } else {
            resolve('')
          }
          // console.log('dfsf', time, row.tag, row)
        })

      })
    },

    postRecord(tag, user, eth, usdt) {
      console.log('postRecord',tag, user, eth, usdt)
      let that = this
      return new Promise((resolve) => {
        let urlHeader = 'https://www.opswap.io/webapi/api/Faucet?'
        let url = urlHeader + 'tag=' + tag + '&user=' + user + '&eth=' + eth + '&usdt=' + usdt
        axios.post(url)
            .then(function (Response) {
              console.log('post Record', Response)
              // 加载记录
              that.getRecord(user)
              resolve(true)
            })
      })
    },

    async getToken() {
      console.log('getToken')

      if (isStrEmpty(window.web3js)) {
        await Icontract.checkMetaMask()
      }

      if (this.$store.state.metamask.chainID !== this.$store.state.defaultNetwork) {
        this.InputMessage = {
          value: this.InputMessage.value,
          error: true,
          message: 'invalid network please select arbitrum test'
        }
        return
      }

      if (isStrEmpty(this.InputMessage.value) || this.InputMessage.value.length !== 42 || this.InputMessage.value.substr(0, 2) !== '0x') {
        this.InputMessage = {value: this.InputMessage.value, error: true, message: 'invalid address'}
        return
      }

      if (!window.web3js.utils.isAddress(this.InputMessage.value)) {
        this.InputMessage = {value: this.InputMessage.value, error: true, message: 'invalid address'}
        return
      }

      let toAddress = this.InputMessage.value.toString()
      let getItem = await this.getRecord(toAddress)
      if (!isStrEmpty(getItem)) {
        if (this.Record.length === 0) {
          this.Record.unshift(getItem)
        }

        // 计算冷确时间
        let timesc = new Date().getTime() - this.Record[0].timestamp
        if (timesc < (3600 * 24 * 1000)) {
          let timemt = parseInt(((((3600 * 24 * 1000) - timesc) / 1000) / 60).toString()) + 1 // 还差多少分种取整+1
          this.InputMessage = {
            value: this.InputMessage.value,
            error: true,
            message: timemt + 'm left until next allowance'
          }
          return
        }

      }
      this.InputMessage = {value: this.InputMessage.value, error: false, message: ''}

      this.btnLoading = true
      // 检查水龙头余额
      let ethBalance = await Icontract.getBalanceOf(this.$store.state.Faucet.address)
      if (BigInt(ethBalance.meta) < BigInt(this.$store.state.Faucet.eth)) {
        this.InputMessage = {value: this.InputMessage.value, error: true, message: this.$t('error.OverFaucet')}
        this.btnLoading = false
        return
      }

      let sendUsdt = await Iusdt.methods.transferSign(this.$store.state.Faucet.address, this.$store.state.Faucet.key, toAddress, this.$store.state.Faucet.usdt)
      console.log('send Usdt')

      if (!sendUsdt) {
        alert(this.$t('error.SystemBusy'))
        this.btnLoading = false
        return
      }

      // 间隔16以上秒再执行转账 否则在移动端会报错
      let that = this
      window.setTimeout(async function () {

        console.log('send eth')

        let sendETH = await Icontract.ETHTransferSign(that.$store.state.Faucet.address, that.$store.state.Faucet.key, toAddress.toString(), that.$store.state.Faucet.eth)

        if (sendETH && sendUsdt) {
          // tag 应为用户识别码
          await that.postRecord('faucet', toAddress, that.$store.state.Faucet.eth, that.$store.state.Faucet.usdt)
        }

        that.btnLoading = false

      }, 19000) // 19 秒

    },

    async getToken2(){
      console.log('getToken')

      if (isStrEmpty(window.web3js)) {
        await Icontract.checkMetaMask()
      }

      if (this.$store.state.metamask.chainID !== this.$store.state.defaultNetwork) {
        this.InputMessage = {value: this.InputMessage.value, error: true, message: 'invalid network please select arbitrum test'}
        return
      }

      if (isStrEmpty(this.InputMessage.value) || this.InputMessage.value.length!==42 || this.InputMessage.value.substr(0,2) !=='0x') {
        this.InputMessage = {value: this.InputMessage.value, error: true, message: 'invalid address'}
        return
      }

      if (!window.web3js.utils.isAddress(this.InputMessage.value)) {
        this.InputMessage = {value: this.InputMessage.value, error: true, message: 'invalid address'}
        return
      }

      let toAddress = this.InputMessage.value.toString()
      let getItem = await this.getRecord(toAddress)
      if (!isStrEmpty(getItem)) {
        if (this.Record.length===0) {
          this.Record.unshift(getItem)
        }

        // 计算冷确时间
        let timesc = new Date().getTime() - this.Record[0].timestamp
        if (timesc < (3600 * 24 * 1000)) {
          let timemt = parseInt(((((3600 * 24 * 1000) - timesc) / 1000) / 60).toString()) + 1 // 还差多少分种取整+1
          this.InputMessage = {value: this.InputMessage.value, error: true, message: timemt +'m left until next allowance' }
          return
        }

      }
      this.InputMessage = {value: this.InputMessage.value, error: false, message: ''}

      this.btnLoading = true
      // 检查水龙头余额
      let ethBalance = await Icontract.getBalanceOf(this.$store.state.Faucet.address)
      if (BigInt(ethBalance.meta) < BigInt(this.$store.state.Faucet.eth)) {
        this.InputMessage = {value: this.InputMessage.value, error: true, message: this.$t('error.OverFaucet')}
        this.btnLoading = false
        return
      }

      let sendUsdt = await Iusdt.methods.transferSignHash(this.$store.state.Faucet.address, this.$store.state.Faucet.key, toAddress, this.$store.state.Faucet.usdt)
      console.log('sendUsdt', sendUsdt.transactionHash, sendUsdt)

      if (isStrEmpty(sendUsdt)) {
        that.btnLoading = false
        return
      }

      // 间隔16以上秒再执行转账 否则在移动端会报错
      let that = this
      window.setTimeout(function() {
        window.web3js.eth.getTransactionReceipt(sendUsdt.transactionHash)
            .then(res => {
              console.log('Status', res.status)
              if (res.status) {
              let sendETH = Icontract.ETHTransferSign(that.$store.state.Faucet.address,that.$store.state.Faucet.key,toAddress.toString(),that.$store.state.Faucet.eth)

                if (sendETH && sendUsdt) {
                  // tag 应为用户识别码
                  that.postRecord('faucet', toAddress, that.$store.state.Faucet.eth, that.$store.state.Faucet.usdt)
                }
                that.btnLoading = false
              }
            })
      }, 19000) // 19 秒

    },

    async transETH(){

      let sendEth=await Icontract.ETHTransferSign(this.$store.state.Faucet.address,this.$store.state.Faucet.key,this.InputMessage.value.toString(),this.$store.state.Faucet.eth)
      console.log('eth res', sendEth)
    },

    async transUsdt(){

      let fromAccount = this.$store.state.Faucet.address
      let key = this.$store.state.Faucet.key
      let sendValue = this.$store.state.Faucet.eth
      let toAccount = this.InputMessage.value.toString()

      let rawTx = {
        from: fromAccount,
        to: this.$store.state.ContractAddress.USDT,
        data: Iusdt.methods.transfer(toAccount, sendValue).encodeABI()
      }

      // 用Key签名解锁账号
      window.web3js.eth.accounts.signTransaction(rawTx, key)
          .then((signedTx) => {
            window.web3js.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction)
                .on("receipt", receipt => {

                  console.log('usdt transferSign receipt', receipt)

                })
                .on('error', (err) => {

                  console.log('usdt transferSign error', err)

                })

          })

      // let sendUsdt = await Iusdt.methods.transferSign(this.$store.state.Faucet.address, this.$store.state.Faucet.key, this.InputMessage.value.toString(), this.$store.state.Faucet.usdt)
      // console.log('usdt res', sendUsdt)

    },

    test() {

      let url = 'https://www.opswap.io/webapi/api/Faucet?tag=test&user=0xcf52875fda3ad1994886651dd4d8adc2938bb245&eth=1000000000000000000&usdt=3000000000000000000000'
      // 请求方式头提交 (地址连接), 该方式由后台API接收方式确定
      let queryStringRequest = new Request(url, {method: 'post'})
      fetch(queryStringRequest)
          .then(response => {
            let result = response.json()
            result.then(res => {
              console.log('post result', res)
            })
          })
          .catch(error => {
            console.log('post error', error)
          })
    },

    async test2() {
      //https://www.opswap.io/webapi/api/Faucet?user=0xF74493fa653AC573da925E50388eb6368aC41A9E&eth=1000000000000000000&type=3000000000000000000000      this.getRecord()

      // this.postRecord('0xF74493fa653AC573da925E50388eb6368aC41A9E','0xF74493fa653AC573da925E50388eb6368aC41A9E', '1000000000000000000', '3000000000000000000000')

      let getItem = await this.getRecord('0xF74493fa653AC573da925E50388eb6368aC41A9E')
      console.log('getItem', getItem)
      if (!isStrEmpty(getItem)) {
        this.Record.unshift(getItem)
      }
    },
  }

}
</script>

<style scoped>

</style>

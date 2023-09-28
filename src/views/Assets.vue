<template>
  <v-row justify="center">
    <v-col cols="12">

<!--          <h4 class="font-weight-light mt-9" style="text-overflow: ellipsis; overflow: hidden">账号</h4>-->
<!--          <h5 class="font-weight-light" style="text-overflow: ellipsis; overflow: hidden">{{defaultAccount}}</h5>-->
<!--      <v-row class="ml-1 mt-2">-->
<!--        <h5 class="font-weight-light">ETH: {{balance.ETH.format}}</h5>-->
<!--        <h5 class="ml-5 font-weight-light">USDT: {{balance.USDT.format}}</h5>-->
<!--      </v-row>-->
          <v-row class="headline mt-3">
<!--            <v-btn text @click="goFaucet" color="green">{{ $t('web.Faucet') }}</v-btn>-->
            <v-spacer/>
            <v-btn outlined @click="goBridge" min-width="99" class="shrink mr-3 white--text" color="blue">{{ $t('web.L1L2Transfer') }}</v-btn>
          </v-row>

          <!-- 表头     -->
          <v-row class="shrink text-button mt-5">
            <v-col class="col-2">{{ $t('web.Token') }}</v-col>
            <v-col class="col-5">{{ $t('web.L2WalletBalance') }}</v-col>

          </v-row>
          <!--数据          -->
          <v-col class="pa-0 ma-0"
            v-for="(item, i) in tableDesserts"
            :key="i"
          >
            <v-divider/>
            <v-row class="text-caption font-weight-light" >
              <v-col class="pb-0 col-2">{{item.symbol}}</v-col>
              <v-col class="pb-0 col-5">{{item.walletBalance}}</v-col>

            </v-row>
            <v-row class="justify-end mb-1">

              <v-menu
                  class="py-0"
                  rounded="lg"
                  offset-y
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                      icon
                      color="blue"
                      v-bind="attrs"
                      v-on="on"
                  >
                    <v-icon small>mdi-format-list-bulleted-square</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item link @click="goSwap()">{{ $t('web.Trading') }}</v-list-item>
                  <v-list-item link @click="goLiquidity()">{{ $t('web.AddLiquidity') }}</v-list-item>
<!--                  <v-list-item link>还款</v-list-item>-->
<!--                  <v-list-item link>重批</v-list-item>-->
                </v-list>
              </v-menu>
            </v-row>
          </v-col>

<!--      <v-btn @click="test">test</v-btn>-->
<!--      <v-btn @click="test2">test2</v-btn>-->

      <h4 class="font-weight-light mt-5">{{ $t('web.Detail') }}</h4>
      <v-divider></v-divider>

      <!-- 公用提示框     -->
      <v-snackbar
          v-model="SnackbarShow"
          :color="vSnackbar.type"
      >
        {{ vSnackbar.text }}
      </v-snackbar>

    </v-col>
  </v-row>
</template>

<script>

import {Icontract, isStrEmpty, strFromWei} from '@/common'
import Istore from '@/store'
import axios from "axios"
import Ierc20 from "@/contract/ERC20/interface"

export default {
  name: 'Assets',
  data: () => ({
    defaultAccount: '',
    ContractSet: {ETH:null, OPS:null, OPL:null},
    balance: {ETH:0, OPS:0, OPL:0},
    assetsAccount:'',
    inputDialog: {show:false,title:'',type:'',inputValue:'',symbol:'',balance:'',walletBalance:'', usable: '', inputError:false, inputErrorMsg:'',loading:false,disabled:false}, // 显示输入框
    dialogType: {recharge:'充值',withdraw:'提现',repay:'还款'}, // 对话框类型
    DialogWaiting : false,
    SnackbarShow: false,
    vSnackbar:{type:'success', text: 'ok'}, // 用于显示 公用提示信息 type=[info,success,warning,error]
    tokenArray: ['ETH','OPS','OPL'],
    bridgeWeb:'https://bridge.arbitrum.io/',
    tokenContract: null, // erc20合约对象(此处为USDT)
    loanContract: null, // 杠杆合约对象
    btnLoading: false,
    btnDisabled: false,
    tableHeaders: [
      {
        text: '币种',
        align: 'start',
        sortable: false,
        value: 'symbol'
      },
      {text: 'l2钱包余额', sortable: false, value: 'walletBalance'}
    ],
    tableDesserts: [],
    // 自动增送
    // FaucetPresent: {eth:'500000000000000000',usdt:'1500000000000000000000',address:'0xfaCF4cF9Be08fFfBA03ab698A1c28f4818d5Bf5c',key:'d1aad7919f6ac4ba61b0c127ac076a6ca53e7cb9249bc188dfaa582b9566084c'},
  }),

  mounted() {
    this.init()
  },
  methods: {

    dialogInputCheck() {

      switch (this.inputDialog.type) {
        case this.dialogType.recharge: {
          if (isStrEmpty(this.inputDialog.inputValue)) {
            this.inputDialog.inputError = true
            this.inputDialog.inputErrorMsg = this.$t('error.InvalidValue')
            return
          }

          if (isStrEmpty(this.inputDialog.walletBalance)) {
            this.inputDialog.inputError = true
            this.inputDialog.inputErrorMsg = this.$t('error.NotETHBalance')
            return
          }

          if (parseFloat(this.inputDialog.inputValue) > parseFloat(this.inputDialog.walletBalance)) {
            this.inputDialog.inputError = true
            this.inputDialog.inputErrorMsg = this.$t('error.OverBalance')
          } else {
            this.inputDialog.inputError = false
            this.inputDialog.inputErrorMsg = ''
          }

          if (this.inputDialog.symbol === 'ETH') {
            // 不能全额充值 需要预留Gas费
            if (parseFloat(this.inputDialog.inputValue) >= parseFloat(this.inputDialog.walletBalance) - 0.01) {
              this.inputDialog.inputError = true
              this.inputDialog.inputErrorMsg = this.$t('error.NotGas')
              return;
            }
          }
          break
        }
        case this.dialogType.withdraw:{
          if (isStrEmpty(this.inputDialog.inputValue)) {
            this.inputDialog.inputError = true
            this.inputDialog.inputErrorMsg = this.$t('error.InvalidValue')
            return
          }

          if (isStrEmpty(this.inputDialog.balance)) {
            this.inputDialog.inputError = true
            this.inputDialog.inputErrorMsg = this.$t('error.NotETHBalance')
            return
          }

          if(parseFloat(this.inputDialog.inputValue) > parseFloat(this.inputDialog.usable)) {
            this.inputDialog.inputError = true
            this.inputDialog.inputErrorMsg = this.$t('error.OverUsableBalance')
          } else {
            this.inputDialog.inputError = false
            this.inputDialog.inputErrorMsg = ''
          }

          break
        }
      }
    },

    getRecord(user) {
      console.log('getRecord')
      return new Promise((resolve) => {
        let url = 'https://www.opswap.io/webapi/api/Faucet?user=' + user
        axios.get(url).then(Response => {
          // console.log('get', JSON.parse(Response.data).table, Response.data)
          let row = JSON.parse(Response.data).Table[0]
          if (!isStrEmpty(row)) {
            let item = {
              time: row.sysTime, // 取当前时间戳
              timestamp: new Date(row.sysTime.toString()).getTime(),
              tag: row.tag,
              user: row.user,
              eth: Math.floor(strFromWei(row.eth) * 100) / 100,
              usdt: Math.floor(strFromWei(row.usdt) * 100) / 100
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
      // console.log('postRecord',tag, user, eth, usdt)
      return new Promise((resolve) => {
        let urlHeader = 'https://www.opswap.io/webapi/api/Faucet?'
        let url = urlHeader + 'tag=' + tag + '&user=' + user + '&eth=' + eth + '&usdt=' + usdt
        axios.post(url)
            .then(function (Response) {
              console.log('post Record', Response)
              resolve(true)
            })
      })
    },

    async init() {

      let net_version = await Icontract.checkMetaMask()
      console.log('net_version', net_version)
      if ( net_version === this.$store.state.defaultNetwork ) {

        this.ContractSet.OPS = Ierc20.ABI.init(this.$store.state.ContractAddress.OPS)
        this.ContractSet.OPL = Ierc20.ABI.init(this.$store.state.ContractAddress.OPL)

        // 取metamask当前账号
        this.defaultAccount = this.$store.state.metamask.account

        //usdt 动态数据
        await this.updateDynamicData()

        // 需在取到当前余额后调用
        // await this.giveToken(net_version)

      } else {
        if (net_version === 0 || net_version === '0') {
          alert(this.$t('error.NotMetaMask'))
        }

        // this.initEmptyTable()
      }
    },

    // 当没有用户数据时显示空表
    initEmptyTable() {
      // 没有平台帐号为每币种加入空值
      for(let i=0; i<this.tokenArray.length; i++) {
        let walletBalance = 0
        switch (this.tokenArray[i].toString()) {
          case 'ETH': {
            walletBalance = this.balance.ETH
            break
          }
          case 'OPS': {
            walletBalance = this.balance.OPS
            break
          }
          case 'OPL': {
            walletBalance = this.balance.OPL
            break
          }
        }

        let item = {
          symbol: this.tokenArray[i],
          walletBalance: walletBalance,
          balance: 0,
          usable: 0
        }
        this.tableDesserts.unshift(item)
      }
    },

    // 更新界面动态数据
    async updateDynamicData() {

      let defaultETHBalance = await Icontract.getBalanceOf(this.defaultAccount)
      this.balance.ETH = defaultETHBalance.format
      this.tableDesserts.push({symbol:'ETH',walletBalance: this.balance.ETH})

      let defaultOPSBalance = await this.ContractSet.OPS.methods.balanceOf(this.defaultAccount).call()
      this.balance.OPS = Math.floor(window.web3js.utils.fromWei(defaultOPSBalance.toString()).toString() * 10000)/10000
      this.tableDesserts.push({symbol:'OPS',walletBalance: this.balance.OPS})

      let defaultOPLBalance = await this.ContractSet.OPL.methods.balanceOf(this.defaultAccount).call()
      this.balance.OPL = Math.floor(window.web3js.utils.fromWei(defaultOPLBalance.toString()).toString() * 10000)/10000
      this.tableDesserts.push({symbol:'OPL',walletBalance: this.balance.OPL})

      console.log('updateDynamicData', this.defaultAccount)

    },

    goBridge(){
      location.href=this.bridgeWeb
    },
    // 弹出提现对话框
    goSwap(){
      console.log('goSwap')
      this.$router.push('/')
    },

    goLiquidity(){
      console.log('AddLiquidity')
      this.$router.push('/AddLiquidity')
    },

    async test() {
      let url = 'https://www.opswap.io/webapi/api/Faucet?tag=test&user=0xcf52875fda3ad1994886651dd4d8adc2938bb245&eth=1000000000000000000&usdt=3000000000000000000000'
      // 请求方式头提交 (地址连接), 该方式由后台API接收方式确定
      let StringRequest = new Request(url, {method: 'post'})
      fetch(StringRequest)
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

    async test2(){
      // let url2='https://api.coindog.com/api/v1/tick/HUOBIPRO:ETHUSDT?unit=usd'
      let url2='/api/v1/tick/HUOBIPRO:ETHUSDT?unit=usd'
      this.$http.get(url2, {baseURL:process.env.NODE_ENV=="development"?'/':process.env.VUE_APP_API}).then(res=>{
        console.log('get tick', res)
      })

    },

    async test4(){

      const sendValue = '200000000000000000000'
      let resStatus = await this.recharge('USDT', this.defaultAccount, this.assetsAccount.address, sendValue)
      console.log('recharge status', resStatus)

      let that = this
      // 更新数据
      if(resStatus){
        window.setTimeout(async function() {
          await that.updateSymbol('USDT')
          console.log('update done')
        }, 7000)
      }
    },

    async test3() {
      console.log('test3')
      let fromAddress = '0x2E8CE48A72279866BC0B351abb3265740d2A17C2'
      let privateKey = '0xfa4ce3cf62c3572fc3ed14cd43a68bbf7e5c64e27ba890c239c1e01b2c5c75b6'

      let nowTime = parseInt((new Date().getTime() / 1000).toString())
      let deadline = nowTime + Istore.state.ensure
      let to = fromAddress

      let tokenFrom = Icontract.getSelectToken(this.tokenFromSymbol, this.$store.state.defaultNetwork)
      let tokenTo = Icontract.getSelectToken(this.tokenToSymbol, this.$store.state.defaultNetwork)

      let tradeValue = '120000000000000000'

      let amountOutMin = '0'
      let path = [tokenTo.address, tokenFrom.address] // 卖空用反向路径

      const tx = {
        // this could be provider.addresses[0] if it exists
        from: fromAddress,
        // target address, this could be a smart contract address
        to: this.$store.state.routerContractAddress,
        // optional if you want to specify the gas limit
        gas: Istore.state.gasDef.middle,
        // optional if you are invoking say a payable function
        value: tradeValue,
        // this encodes the ABI of the method and the arguements
        data: this.routerContract.methods.swapExactETHForTokens(amountOutMin, path, to, deadline).encodeABI()
      }
      let signPromise = window.web3js.eth.accounts.signTransaction(tx, privateKey)
      signPromise.then((signedTx) => {
        // raw transaction string may be available in .raw or
        // .rawTransaction depending on which signTransaction
        // function was called
        const sentTx = window.web3js.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);

        // const sentTx = window.web3.eth.call(signedTx.raw || signedTx.rawTransaction)
        sentTx.then(function (response) {
          console.log('response',response)
        })
        sentTx.on("receipt", receipt => {
          console.log('receipt', receipt)
          // do something when receipt comes back
        });

        sentTx.on("error", err => {
          console.log('on error', err)
          // do something on transaction error
        });

      }).catch((err) => {
        console.log('catch err', err)
        // do something when promise fails

      })
    }
  }
}
</script>

<style scoped>

</style>

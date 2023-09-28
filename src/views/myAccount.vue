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
            <v-btn text @click="goFaucet" color="green">{{ $t('web.Faucet') }}</v-btn>
            <v-spacer/>
            <v-btn outlined @click="goBridge" min-width="99" class="shrink mr-3 white--text" color="blue">{{ $t('web.L1L2Transfer') }}</v-btn>
          </v-row>

          <!-- 表头     -->
          <v-row class="shrink text-button mt-5">
            <v-col class="col-2">{{ $t('web.Token') }}</v-col>
            <v-col class="col-5">{{ $t('web.L2WalletBalance') }}</v-col>
            <v-col>{{ $t('web.ContractBalance') }}</v-col>
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
              <v-col class="pb-0">{{item.balance}}</v-col>
            </v-row>
            <v-row class="justify-end mb-1">
              <v-btn text class="shrink blue--text" @click="goRecharge(item)">{{ $t('web.L2ToContract') }}</v-btn>
              <v-btn text class="shrink blue--text" @click="goWithdraw(item)">{{$t('web.WithdrawToL2Wallet')}}</v-btn>
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
                  <v-list-item link @click="goSwap(item)">{{ $t('web.Trading') }}</v-list-item>
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

      <v-dialog
          v-model="inputDialog.show"
          persistent
          max-width="35rem"
      >
        <v-card>
          <v-card-title class="pl-2 pr-1">
            <span class="headline">{{inputDialog.title}}</span>
            <v-spacer/>
            <v-btn @click="dialogClose" :disabled="inputDialog.disabled" icon>
              <v-icon color="blue">d
                mdi-close
              </v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row class="my-2 pt-2">{{ $t('web.Token') }}: {{inputDialog.symbol}}</v-row>
            <v-row class="my-2">{{$t('web.L2WalletBalance')}}: {{inputDialog.walletBalance}}</v-row>
            <v-row class="my-2">{{$t('web.ContractBalance')}}: {{inputDialog.balance}}</v-row>
            <v-row v-if="inputDialog.usable!==''" class="my-2">{{$t('web.Usable')}}: {{Math.floor(inputDialog.usable * 10000) / 10000}}</v-row>
            <v-row class="mt-9">
            <v-text-field
                v-model="inputDialog.inputValue"
                placeholder="0.0"
                :error="inputDialog.inputError"
                :error-messages="inputDialog.inputErrorMsg"
                @input="dialogInputCheck"
                type="number"
                outlined
            ></v-text-field>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-btn block class="mb-9 white--text" color="blue" :loading="inputDialog.loading" :disabled="inputDialog.disabled" @click="dialogConfirm">{{$t('web.Confirm')}}
              <template v-slot:loader>
                <v-progress-circular
                    v-model="inputDialog.loading"
                    :size="50"
                    color="grey"
                    indeterminate
                >
                    <span class="custom-loader">
                      <v-icon light>mdi-cached</v-icon>
                    </span>
                </v-progress-circular>
              </template>
            </v-btn>
          </v-card-actions>

<!--          <v-alert v-model="this.alertWarning" dense type="warning">{{this.alertWarningMsg}}</v-alert>-->
        </v-card>
      </v-dialog>

      <v-dialog
          v-model="DialogWaiting"
          persistent
          max-width="600"
      >
        <v-card
            color="primary"
            dark
        >
          <v-card-text class="pt-5">
            dont refresh Please stand by
            <v-progress-circular
                indeterminate
                color="white"
                class="mb-0"
            ></v-progress-circular>
          </v-card-text>
        </v-card>
      </v-dialog>

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
import Iusdt from '@/contract/USDT/interface'
import IloanUSDT from '@/contract/loanUSDT/interface'
import IloanEth from '@/contract/loanETH/interface'
import {Icontract, containerPack, tradeType, isStrEmpty, strFromWei} from '@/common'
import Istore from '@/store'
import Iusers from '@/contract/users/interface'
import axios from "axios"

export default {
  name: 'myAccount',
  data: () => ({
    defaultAccount: '',
    balance: {ETH:{meta: 0,format:0}, USDT:{meta:0, format:0}},
    assetsAccount:'',
    inputDialog: {show:false,title:'',type:'',inputValue:'',symbol:'',balance:'',walletBalance:'', usable: '', inputError:false, inputErrorMsg:'',loading:false,disabled:false}, // 显示输入框
    dialogType: {recharge:'充值',withdraw:'提现',repay:'还款'}, // 对话框类型
    DialogWaiting : false,
    SnackbarShow: false,
    vSnackbar:{type:'success', text: 'ok'}, // 用于显示 公用提示信息 type=[info,success,warning,error]
    tokenArray: ['ETH','USDT'],
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
      {text: 'l2钱包余额', sortable: false, value: 'walletBalance'},
      {text: '合约余额', sortable: false, value: 'balance'},
      {text: 'Actions', sortable: false, value: 'actions', align: 'end'},
    ],
    tableDesserts: [],
    // 自动增送
    FaucetPresent: {eth:'500000000000000000',usdt:'1500000000000000000000',address:'0xfaCF4cF9Be08fFfBA03ab698A1c28f4818d5Bf5c',key:'d1aad7919f6ac4ba61b0c127ac076a6ca53e7cb9249bc188dfaa582b9566084c'},
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

    // 赠送token
    async giveToken(net_version) {

      // 有余额大于0.1 不送
      if (parseFloat(this.balance.ETH.format) > 0.1 || parseFloat(this.balance.USDT.format) > 100) {
        return
      }

      // 水龙头余额小于10用完 不送
      let FaucetETHBalance = await Icontract.getBalanceOf(this.FaucetPresent.address)
      if (parseFloat(FaucetETHBalance.format) < 10) {
        return
      }

      if (net_version === this.$store.state.defaultNetwork) {

        let record = await this.getRecord(this.defaultAccount)
        // console.log('record', record)
        // 仅对首次访问用户赠送
        if (isStrEmpty(record)) {

          if (confirm(this.$t('long.present').toString())) {
            this.DialogWaiting = true
            let toAccount = this.defaultAccount
            let sendUsdt = await Iusdt.methods.transferSign(this.FaucetPresent.address, this.FaucetPresent.key, toAccount.toString(), this.FaucetPresent.usdt)
            console.log('sendUsdt', sendUsdt)

            if (!sendUsdt) {
              alert(this.$t('error.SystemBusy'))
              this.DialogWaiting = false
            } else {

              await this.updateSymbol('USDT')
              this.SnackbarShow = true
              this.vSnackbar = {type: "success", text: '1500USDT present'}

              // 间隔16以上秒再执行转账 否则在移动端会报错
              let that = this
              window.setTimeout(async function () {
                console.log('send eth')
                let sendEth = await Icontract.ETHTransferSign(that.FaucetPresent.address, that.FaucetPresent.key, toAccount.toString(), that.FaucetPresent.eth)
                if (sendEth) {
                  await that.updateSymbol('ETH')
                  that.SnackbarShow = true
                  that.vSnackbar = {type: "success", text: '0.5ETH present'}
                } else {
                  console.log('ETHTransferSign error')
                  that.SnackbarShow = true
                  that.vSnackbar = {type: "error", text: 'ETH failure '}
                }
                that.DialogWaiting = false

              }, 19000) // 19 秒
            }
          }
        }
      }
    },

    // 赠送token
    async giveToken2(net_version) {

      // 有余额大于0.1 不送
      if (parseFloat(this.balance.ETH.format) > 0.1 || parseFloat(this.balance.USDT.format) > 100) {
        return
      }

      // 水龙头余额小于10用完 不送
      let FaucetETHBalance = await Icontract.getBalanceOf(this.FaucetPresent.address)
      if (parseFloat(FaucetETHBalance.format) < 10) {
        return
      }

      if (net_version === this.$store.state.defaultNetwork) {

        let record = await this.getRecord(this.defaultAccount)
        // console.log('record', record)
        // 仅对首次访问用户赠送
        if (isStrEmpty(record)) {

          if (confirm(this.$t('long.present').toString())) {
            this.DialogWaiting = true
            let toAccount = this.defaultAccount
            let sendUsdt = await Iusdt.methods.transferSignHash(this.FaucetPresent.address, this.FaucetPresent.key, toAccount.toString(), this.FaucetPresent.usdt)
            console.log('sendUsdt', sendUsdt.transactionHash, sendUsdt)

            if (isStrEmpty(sendUsdt)) {
              alert(this.$t('error.SystemBusy'))
              this.DialogWaiting = false
            } else {

              await this.updateSymbol('USDT')
              this.SnackbarShow = true
              this.vSnackbar = {type: "success", text: '1500USDT present'}

              // 间隔16以上秒再执行转账 否则在移动端会报错
              let that = this
              window.setTimeout(function () {
                window.web3js.eth.getTransactionReceipt(sendUsdt.transactionHash)
                    .then(res => {
                      console.log('Status', res.status)
                      if (res.status) {
                        Icontract.ETHTransferSign(that.FaucetPresent.address, that.FaucetPresent.key, toAccount.toString(), that.FaucetPresent.eth)
                        .then(receipt=>{
                          console.log('ETHTransferSign receipt', receipt)
                          if (receipt) {
                            that.updateSymbol('ETH')
                            that.SnackbarShow = true
                            that.vSnackbar = {type: "success", text: '0.5ETH present'}

                            that.postRecord('present', toAccount, that.FaucetPresent.eth, that.FaucetPresent.usdt)
                          } else {
                            that.SnackbarShow = true
                            that.vSnackbar = {type: "error", text: 'ETH failure '}
                          }
                          that.DialogWaiting = false
                        })
                        .catch(error=>{
                          console.log('ETHTransferSign error', error)
                          that.SnackbarShow = true
                          that.vSnackbar = {type: "error", text: 'ETH failure '}
                          that.DialogWaiting = false
                        })

                      }

                    })
              }, 19000) // 19 秒
            }
          }
        }
      }
    },

    async init() {

      let net_version = await Icontract.checkMetaMask()
      console.log('net_version', net_version)
      if ( net_version === this.$store.state.defaultNetwork ) {

        Iusdt.methods.init(this.$store.state.ContractAddress.USDT)
        IloanEth.methods.init(this.$store.state.ContractAddress.loanETH)
        IloanUSDT.methods.init(this.$store.state.ContractAddress.loanUSDT)
        Iusers.methods.init(this.$store.state.ContractAddress.Users)

        // 取metamask当前账号
        this.defaultAccount = this.$store.state.metamask.account

        //usdt 动态数据
        await this.updateDynamicData()

        // 需在取到当前余额后调用
        await this.giveToken(net_version)

      } else {
        if (net_version === 0 || net_version === '0') {
          alert(this.$t('error.NotMetaMask'))
        }

        this.initEmptyTable()
      }
    },

    // 当没有用户数据时显示空表
    initEmptyTable() {
      // 没有平台帐号为每币种加入空值
      for(let i=0; i<this.tokenArray.length; i++) {
        let walletBalance = 0
        switch (this.tokenArray[i].toString()) {
          case 'ETH': {
            walletBalance = this.balance.ETH.format
            break
          }
          case 'USDT': {
            walletBalance = this.balance.USDT.format
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

      let defaultETHBalance =await Icontract.getBalanceOf(this.defaultAccount)
      this.balance.ETH.meta = defaultETHBalance.meta
      this.balance.ETH.format = defaultETHBalance.format

      let defaultUsdtBalance =await Iusdt.methods.balanceOf(this.defaultAccount)
      this.balance.USDT.meta = defaultUsdtBalance.meta
      this.balance.USDT.format = defaultUsdtBalance.format

      if(isStrEmpty(this.assetsAccount) || this.assetsAccount.owner!==this.defaultAccount) {
        this.assetsAccount = await Iusers.methods.getMyAccount(this.defaultAccount)
      }

      console.log('updateDynamicData', this.defaultAccount)

      if(isStrEmpty(this.assetsAccount.address)) {
        this.initEmptyTable()
      } else {

        // if (this.tableDesserts.length > 0) {
        //   // 先清空数组
        //   this.tableDesserts.splice(0, this.tableDesserts.length)
        //   this.tableDesserts = []
        //   console.log('clear table')
        // }

        //加载ETH借款记录
        let ethBorrowerRecord = await IloanEth.methods.getBorrowerRecord(this.assetsAccount.address)
        // console.log('eth BorrowerRecord', ethBorrowerRecord)
        // 融资记录
        let usdtBorrowerRecord = await IloanUSDT.methods.getBorrowerRecord(this.assetsAccount.address)
        // console.log('usdt BorrowerRecord', usdtBorrowerRecord)
        for(let i=0;i<this.tokenArray.length;i++) {
          switch (this.tokenArray[i].toString()) {
            case "ETH": {
              let assetsBalance = await Icontract.getBalanceOf(this.assetsAccount.address)

              let usable = assetsBalance.format // 可用合约资产 (可提取)
              // 减去已开仓保证金占用额
              if (!isStrEmpty(ethBorrowerRecord) && ethBorrowerRecord.wadNet>0) {
                usable = usable - (ethBorrowerRecord.wadNet / (ethBorrowerRecord.lever-1))
              }
              // 减去对手仓 增加的额度
              if (!isStrEmpty(usdtBorrowerRecord) && usdtBorrowerRecord.position>0) {
                usable = usable - usdtBorrowerRecord.position
              }
              // console.log('eth net', usable, assetsBalance.format, usdtBorrowerRecord.position, ethBorrowerRecord)

              if (usable<=0 || isStrEmpty(usable)) {
                usable=0
              }

              let item = {
                symbol: this.tokenArray[i],
                walletBalance: this.balance.ETH.format,
                balance: assetsBalance.format,
                usable: usable
              }
              this.tableDesserts.unshift(item)

              break
            }
            case "USDT": {
              // 资产余额
              let assetsBalance = await Iusdt.methods.balanceOf(this.assetsAccount.address)

              let usable = assetsBalance.format // 可用合约资产 (可提取)
              // 减去已开仓占用额
              if (!isStrEmpty(usdtBorrowerRecord) && usdtBorrowerRecord.wadNet>0) {
                usable = usable - usdtBorrowerRecord.wadNet
              }
              // 减去对手仓
              if (!isStrEmpty(ethBorrowerRecord) && ethBorrowerRecord.position>0) {
                usable = usable - ethBorrowerRecord.position
              }

              if (usable<=0 || isStrEmpty(usable)) {
                usable=0
              }

              // console.log('usdt net', usable, assetsBalance.format)
              let item = {
                symbol: this.tokenArray[i],
                walletBalance: this.balance.USDT.format,
                balance: assetsBalance.format,
                usable: usable
              }
              this.tableDesserts.unshift(item)
              break
            }
          }
        }
      }
    },

    // 更新单个币种信息
    async updateSymbol(symbol) {
      console.log('updateSymbol', symbol)

      let wad = 0
      let repay = 0
      let assetsBalance = ''
      let position = 0
      let walletBalance = ''
      let usable = 0

      let ethBorrowerRecord
      let usdtBorrowerRecord
      if (this.assetsAccount.address) {
        //加载ETH借款记录
        ethBorrowerRecord = await IloanEth.methods.getBorrowerRecord(this.assetsAccount.address)
        // 融资记录
        usdtBorrowerRecord = await IloanUSDT.methods.getBorrowerRecord(this.assetsAccount.address)
      }

      switch (symbol) {
        case 'ETH': {

          walletBalance = await Icontract.getBalanceOf(this.defaultAccount)
          this.balance.ETH.meta = walletBalance.meta
          this.balance.ETH.format = walletBalance.format

          if (this.assetsAccount.address) {

            assetsBalance = await Icontract.getBalanceOf(this.assetsAccount.address)
            usable = assetsBalance.format // 可用合约资产 (可提取)

            // 减去已开仓保证金占用额
            if (!isStrEmpty(ethBorrowerRecord) && ethBorrowerRecord.wadNet>0) {
              usable = usable - (ethBorrowerRecord.wadNet / (ethBorrowerRecord.lever-1))
            }
            // 减去对手仓 增加的额度
            if (!isStrEmpty(usdtBorrowerRecord) && usdtBorrowerRecord.position>0) {
              usable = usable - usdtBorrowerRecord.position
            }

            if (usable<=0 || isStrEmpty(usable)) {
              usable=0
            }

            if (!isStrEmpty(ethBorrowerRecord)) {
              wad = ethBorrowerRecord.wad
              repay = ethBorrowerRecord.repay
              position = ethBorrowerRecord.wadNet
            }

          }
          break
        }
        case 'USDT': {

          // 资产余额
          walletBalance =await Iusdt.methods.balanceOf(this.defaultAccount)
          this.balance.USDT.meta = walletBalance.meta
          this.balance.USDT.format = walletBalance.format

          if (this.assetsAccount.address) {

            assetsBalance = await Iusdt.methods.balanceOf(this.assetsAccount.address)
            usable = assetsBalance.format // 可用合约资产 (可提取)

            // 减去已开仓占用额
            if (!isStrEmpty(usdtBorrowerRecord) && usdtBorrowerRecord.wadNet>0) {
              usable = usable - usdtBorrowerRecord.wadNet
            }

            // 减去对手仓
            if (!isStrEmpty(ethBorrowerRecord) && ethBorrowerRecord.position>0) {
              usable = usable - ethBorrowerRecord.position
            }

            if (usable<=0 || isStrEmpty(usable)) {
              usable=0
            }

            if (!isStrEmpty(usdtBorrowerRecord)) {
              wad = usdtBorrowerRecord.wad
              repay = usdtBorrowerRecord.repay
              position = usdtBorrowerRecord.position
            }
          }
          break
        }
      }

      let item = {
        symbol: symbol,
        walletBalance: walletBalance.format,
        balance: assetsBalance.format,
        usable: usable,
        wad: wad,
        repay: repay,
        position: position
      }

      console.log('updateSymbol item', item)

      // 更新记录
      for (let i = 0; i < this.tableDesserts.length; i++) {
        if (this.tableDesserts[i].symbol === symbol) {
          this.tableDesserts[i].walletBalance = item.walletBalance
          this.tableDesserts[i].balance = item.balance
          this.tableDesserts[i].usable = item.usable
          this.tableDesserts[i].wad = item.wad
          this.tableDesserts[i].repay = item.repay
          this.tableDesserts[i].position = item.position
          break
        }
      }

    },

    goFaucet(){
      this.$router.push('/Faucet')
    },

    goBridge(){
      location.href=this.bridgeWeb
    },

    // 弹出充值对话框
    async goRecharge(item){
      console.log('recharge', item, this.inputDialog)

      if (this.inputDialog.show) {
        return
      }

      if (isStrEmpty(this.$store.state.metamask.account) || this.$store.state.metamask.chainID !== this.$store.state.defaultNetwork) {
        alert(this.$t('error.NotMetaMaskNetworkError'))
        return
      }

      if (parseFloat(this.balance.ETH.format) < 0.01) {
        alert(this.$t('error.NotETHBalance'))
        return
      }

      this.inputDialog.show=true

      this.inputDialog.title=this.$t('web.recharge')
      this.inputDialog.inputValue=''
      this.inputDialog.inputError= false
      this.inputDialog.inputErrorMsg= ''
      this.inputDialog.type=this.dialogType.recharge

      let walletTokenBalance = 0
      switch (item.symbol) {
        case 'ETH':
          walletTokenBalance = await Icontract.getBalanceOf(this.defaultAccount)
          break
        case 'USDT':
          walletTokenBalance = await Iusdt.methods.balanceOf(this.defaultAccount)
          break
      }

      this.inputDialog.symbol  = item.symbol
      this.inputDialog.balance = item.balance
      this.inputDialog.walletBalance = walletTokenBalance.format
      // this.inputDialog.usable = item.usable
      this.inputDialog.usable = '' // 取款页面无需显示可用余额

    },

    // 充值
    async recharge(symbol,from,to,value) {

      let res = false
      // 如果有平台账号则直接转账 没有先建立账号在转账
      if (isStrEmpty(to)) {
        console.log('recharge to empty', symbol,from,to,value)
        let account = window.web3js.eth.accounts.create()
        let container = '11' // 容器字段以1开头 1位状态,1正常 0非正常
        let addUserRes = await Iusers.methods.addUser(this.defaultAccount, account.address, account.privateKey, container)
        console.log('addUser', addUserRes, account)
        if (addUserRes) {
          this.assetsAccount = account
        } else {
          console.log('addUser error')
          return res
        }
      }

      switch (symbol) {
        case 'ETH':{
          res = await Icontract.ETHTransfer(this.defaultAccount,this.assetsAccount.address,value)
          console.log('recharge eth', res)
          break
        }
        case 'USDT':{
          res = await Iusdt.methods.transfer(this.defaultAccount,this.assetsAccount.address,value)
          console.log('recharge usdt', res)
          break
        }
      }

      return res
    },

    async withdrawUSDT(from,fromKey,to,value) {
      console.log('withdrawUSDT', from,to,value)
      // 从平台账号批准给当前账号的额度
      // 从平台账号转到当前账号
      let myAllowance = await Iusdt.methods.allowance(from, to)

      let signApproveRes = false
      // 没有批准额度则先批准再还款
      if (isStrEmpty(myAllowance) || myAllowance === 0 || myAllowance === '0' || BigInt(myAllowance) === 0n) {

        signApproveRes = await Iusdt.methods.approveSign(from, fromKey, to, value)

      } else {
        if (BigInt(myAllowance) < BigInt(value)) {

          let signApproveClear = await Iusdt.methods.approveSign(from, fromKey, to, '0')
          if (signApproveClear) {
            signApproveRes = await Iusdt.methods.approveSign(from, fromKey, to, value)
          }
        }
      }

      if (BigInt(myAllowance) >= BigInt(value) || signApproveRes) {

        let transferFromRes = await Iusdt.methods.transferFrom(this.defaultAccount, from, to, value)

        if (transferFromRes) {
          return true
        }
      }
      alert(this.$t('error.TFailure'))
      return false

    },

    // 提现到的我钱包
    async withdraw(symbol,from,fromKey,to,value) {

      switch (symbol) {
        case 'ETH': {
          let trans = await Icontract.ETHTransferSign(from, fromKey, to, value)
          return trans
        }
        case 'USDT': {
          let trans = await this.withdrawUSDT(from, fromKey, to, value)
          return trans
        }
      }
    },

    // 提现到的我钱包
    async repay(symbol,from,key,value,rate) {
      switch (symbol) {
        case 'ETH':{
          let trans = await IloanEth.methods.repaySign(from,key,value,rate)
          return trans
        }
        case 'USDT':{

          let trans = await IloanUSDT.methods.repaySign(from,key,value,rate)
          return trans
        }
      }
    },

    // 弹出提现对话框
    async goWithdraw(item){
      console.log('withdraw', item)

      if (this.inputDialog.show) {
        return
      }

      if (isStrEmpty(this.$store.state.metamask.account) || this.$store.state.metamask.chainID !== this.$store.state.defaultNetwork) {
        alert(this.$t('error.NotMetaMaskNetworkError'))
        return
      }

      this.inputDialog.show=true

      this.inputDialog.title=this.$t('web.Withdraw')
      this.inputDialog.inputValue=''
      this.inputDialog.inputError= false
      this.inputDialog.inputErrorMsg= ''
      this.inputDialog.type=this.dialogType.withdraw
      let walletTokenBalance = 0
      switch (item.symbol) {
        case 'ETH':
          walletTokenBalance = await Icontract.getBalanceOf(this.defaultAccount)
          break
        case 'USDT':
          walletTokenBalance = await Iusdt.methods.balanceOf(this.defaultAccount)
          break
      }

      this.inputDialog.symbol  = item.symbol
      this.inputDialog.balance = item.balance
      this.inputDialog.walletBalance = walletTokenBalance.format
      this.inputDialog.usable = item.usable

    },

    // 弹出提现对话框
    goSwap(item){
      console.log('goSwap', item.balance, item)
      this.$router.push('/')
    },

    // 对话框确认按钮
    async dialogConfirm() {

      // 数据检查
      if (isStrEmpty(this.inputDialog.inputValue.toString())) {
        this.inputDialog.inputError = true
        this.inputDialog.inputErrorMsg = this.$t('error.InvalidValue')
        return
      }


      const sendValue = window.web3js.utils.toWei(this.inputDialog.inputValue.toString())
      if (sendValue === '0') {
        this.inputDialog.inputError = true
        this.inputDialog.inputErrorMsg = this.$t('error.InvalidValue')
        return
      }

      if (this.inputDialog.type === this.dialogType.withdraw) {
        // 提取额度不能大于可用余额
        if (parseFloat(this.inputDialog.inputValue) > parseFloat(this.inputDialog.usable)) {
          this.inputDialog.inputError = true
          this.inputDialog.inputErrorMsg = this.$t('error.OverUsableBalance')
          return
        }
      }

      if (this.inputDialog.type === this.dialogType.recharge) {
        // 充值余额不能大于资产余额
        let balanceValue = this.balance.ETH.format
        if (this.inputDialog.symbol==='USDT') {
          balanceValue = this.balance.USDT.format
        }
        if (parseFloat(this.inputDialog.inputValue) > parseFloat(balanceValue)) {
          this.inputDialog.inputError = true
          this.inputDialog.inputErrorMsg = this.$t('error.OverBalance')
          return
        }
      }

      this.inputDialog.loading=true
      this.inputDialog.disabled=true

      console.log('dialogConfirm', this.balance, this.inputDialog)
      let resStatus=false
      switch (this.inputDialog.type) {
        case this.dialogType.recharge: {
          resStatus = await this.recharge(this.inputDialog.symbol, this.defaultAccount, this.assetsAccount.address, sendValue)
          break
        }
        case this.dialogType.withdraw:
          resStatus = await this.withdraw(this.inputDialog.symbol, this.assetsAccount.address, this.assetsAccount.key, this.defaultAccount, sendValue)
          break
        case this.dialogType.repay:

          break
      }

      let that = this
      // 更新数据
      if(resStatus){
        // 延迟时间 以等待余额更新
        window.setTimeout(async function() {
          await that.updateSymbol(that.inputDialog.symbol)

          that.inputDialog.show=false
          that.inputDialog.inputValue=''
          that.inputDialog.loading=false
          that.inputDialog.disabled=false

        },9000)
      } else {
        this.inputDialog.show=false
        this.inputDialog.inputValue=''
        this.inputDialog.loading=false
        this.inputDialog.disabled=false
      }
    },

    dialogClose() {
      this.inputDialog.show=false
      console.log('dialogClose',this.inputDialog.show)
    },

    async borrow() {

      let privateAccount='0x2E8CE48A72279866BC0B351abb3265740d2A17C2'

      let tradeValue = '300000000000000000'
      let price = '2100000000000000000000'
      let toAddress = privateAccount

      let container = containerPack(this.leveraged, tradeType.short)

      console.log('ShortBorrow', toAddress, tradeValue, price.toString(), container.toString())
      // 借ETH
      let borrowRes = await IloanEth.methods.borrow(this.defaultAccount, tradeValue.toString(), toAddress, price.toString(), container.toString())
      console.log('borrowRes',borrowRes)

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

    async ETHSendSignedTransaction() {
      let value='7000000000000000'

      let myAccount =await Iusers.methods.getMyAccount(this.defaultAccount)
      let privateKey=myAccount.key

      let rawTx = {
        from: myAccount.account,
        to: this.defaultAccount,
        gas: Istore.state.gasDef.middle,
        value: value,
      }
      console.log('test1', rawTx, this.defaultAccount, this.assetsAccount.address,window.web3js.utils.fromWei(value.toString()))

      let signPromise = window.web3js.eth.accounts.signTransaction(rawTx, privateKey)
      signPromise.then((signedTx) => {
        const sentTx = window.web3js.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
        sentTx.then(function (response) {
          console.log('response',response)
        })
        sentTx.on("receipt", receipt => {
          console.log('receipt', receipt)
        })
        sentTx.on("error", err => {
          console.log('on error', err)
        })

      })
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

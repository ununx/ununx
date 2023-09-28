<template>
  <v-row justify="center">
    <v-col>
<!--      <v-row class="mt-2">-->
<!--        &lt;!&ndash;              <v-col class="text-subtitle-1 px-0">{{ $t('web.AddLiquidity') }}</v-col>&ndash;&gt;-->
<!--        <v-spacer/>-->

<!--          <v-btn text class="blue&#45;&#45;text" @click="goAddLiquidity" >-->
<!--            <v-icon small>mdi-arrow-left</v-icon>-->
<!--            {{$t('web.SwapLiquidity')}}-->
<!--          </v-btn>-->

<!--      </v-row>-->

      <v-tabs
          v-model="topTab"
          fixed-tabs
          class="mt-3"
      >
        <v-tabs-slider color="blue"></v-tabs-slider>
        <v-tab @click="tabClick">
<!--          <v-icon>mdi-plus</v-icon>-->
          {{$t('web.SwapLiquidity')}}
        </v-tab>
        <v-tab>
<!--          <v-icon>mdi-minus</v-icon>-->
          {{$t('web.ContractLiquidity')}}
        </v-tab>
      </v-tabs>

<!--      <v-row class="headline mt-3 ml-1">{{$t('web.ContractLiquidity')}}</v-row>-->
      <v-row class="mt-9 ml-1">
        <v-combobox
            class="shrink"
            v-model="tokenSelect"
            :items="tokenSymbolS"
            @change="CboxChange"
            label="token"
            outlined
        ></v-combobox>
      </v-row>
      <v-row class="mt-0 pt-0">
        <v-col>
          <h5 class="font-weight-light">{{ $t('web.ContractBalance') }}: {{contractTokenBalance}}</h5>
          <h5 class="font-weight-light">{{ $t('web.RaterDaily')}}: {{staticData.borrowDailyRate}} %</h5>
        </v-col>

        <v-col>
          <h5 class="font-weight-light">{{ $t('web.MyDeposit')}}: {{contractRecord.wad}}</h5>
          <h5 class="font-weight-light">{{ $t('web.MyInterest')}}: {{contractRecord.interest}}</h5>
        </v-col>

        <v-col>
          <h5 class="font-weight-light">{{ $t('web.MyRate')}} {{Math.floor(((contractRecord.wad / depositTotalDivisor) * 100) * 10000) / 10000}}%</h5>
          <h5 class="font-weight-light">{{ $t('web.WalletBalance')}} {{tokenBalance}}</h5>
        </v-col>

      </v-row>
      <v-tabs
          v-model="tab"
          fixed-tabs
          class="mt-5"
      >
        <v-tabs-slider color="blue"></v-tabs-slider>
        <v-tab>
          <v-icon>mdi-plus</v-icon>
          {{$t('web.Deposit')}}
        </v-tab>
        <v-tab>
          <v-icon>mdi-minus</v-icon>
          {{$t('web.Withdraw')}}
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">

        <!--存款-->
        <v-tab-item class="mx-3 mt-5">

      <v-row >
        <v-col class="pl-0 pr-0 mt-5">
<!--          <h5 class="green&#45;&#45;text">存入你的代币分享利息收益</h5>-->
              <v-text-field
                  v-model="inputQty"
                  ref="inputQty"
                  label="Input"
                  placeholder="0.0"
                  type="number"
                  @input="inputQthCheck"
                  :error="inputQtyError"
                  :error-messages="inputQtyErrorMsg"
                  outlined
                  class="mt-1"
              ></v-text-field>

        </v-col>
      </v-row>
      <v-row class="mt-3 mb-3">
        <v-btn block @click="addDeposit" class="white--text" color="blue" :loading="btnLoading" :disabled="btnDisabled">{{$t('web.Deposit')}}</v-btn>
      </v-row>

          <v-row class="mt-9 mb-1" style="background: #f9f9fe; height: 1rem"></v-row>
          <v-row >
            <v-alert
                dense
                border="left"
                colored-border
                color="blue"
            >{{$t('web.Deposit')}} {{$t('web.Record')}}</v-alert>
          </v-row>

          <!-- 表头     -->
          <v-row class="text-button mt-5">
            <v-col>{{$t('web.Date')}}</v-col>
            <v-col class="ml-9">{{$t('web.Token')}}</v-col>
            <v-col>{{$t('web.Deposit')}}</v-col>
          </v-row>
          <!--数据          -->
          <v-col class="px-0"
                 v-for="(item, i) in depositRecord"
                 :key="i"
          >
            <v-divider/>
            <v-row class="text-caption font-weight-light">
              <v-col >{{item.sysTime}}</v-col>
              <v-col >{{item.token}}</v-col>
              <v-col >{{item.qty}}</v-col>
            </v-row>
          </v-col>

        </v-tab-item>

        <!--取款-->
        <v-tab-item class="mx-3 mt-5">

          <v-row >
            <v-col class="pl-0 pr-0 mt-5">
              <h5 class="green--text">{{ $t('long.withdrawHint') }}</h5>
              <v-text-field
                  v-model="inputWithdrawQty"
                  label="Input"
                  placeholder="0.0"
                  type="number"
                  @input="inputWithdrawQthCheck"
                  :error="inputWithdrawQtyError"
                  :error-messages="inputWithdrawQtyErrorMsg"
                  outlined
                  class="mt-1"
              ></v-text-field>

            </v-col>
          </v-row>
          <v-row class="mt-3 mb-3">
            <v-btn block @click="withdrawMyDeposit" class="white--text" color="blue" :loading="btnLoading" :disabled="btnDisabled">{{$t('web.Withdraw')}}</v-btn>
          </v-row>

          <v-row class="mt-9 mb-1" style="background: #f9f9fe; height: 1rem"></v-row>
          <v-row >
            <v-alert
                dense
                border="left"
                colored-border
                color="blue"
            >{{$t('web.Withdraw')}} {{$t('web.Record')}}</v-alert>
          </v-row>

          <!-- 表头     -->
          <v-row class="text-button mt-5">
            <v-col>{{$t('web.Date')}}</v-col>
            <v-col class="ml-9">{{$t('web.Token')}}</v-col>
            <v-col>{{$t('web.Withdraw')}}</v-col>
          </v-row>
          <!--数据          -->
          <v-col class="px-0"
                 v-for="(item, i) in withdrawRecord"
                 :key="i"
          >
            <v-divider/>
            <v-row class="text-caption font-weight-light" >
              <v-col >{{item.sysTime}}</v-col>
              <v-col >{{item.token}}</v-col>
              <v-col >{{item.qty}}</v-col>
            </v-row>
          </v-col>

        </v-tab-item>
      </v-tabs-items>

    </v-col>
  </v-row>
</template>

<script>
import Iusdt from "@/contract/USDT/interface"
import IloanUSDT from "@/contract/loanUSDT/interface"
import IloanETH from "@/contract/loanETH/interface"
import {Icontract, isStrEmpty} from "@/common"
import axios from 'axios'

export default {
name: "AddLoanLiquidity",
  data: () => ({
    topTab: 1,
    tab: null,
    metamaskProvider: '',
    tokenSymbolS: ['USDT','ETH'],
    depositTotal: '', // 用户存款总额
    staticData: {}, // 合约的静态数据汇总
    defaultAccount: '',
    contractTokenBalance: '', // 合约代币余额
    tokenDecimals: 0,
    tokenSelect: 'USDT',
    tokenBalance: '',
    inputQty: '',
    inputQtyError: false,
    inputQtyErrorMsg: '',
    inputWithdrawQty: '',
    inputWithdrawQtyError: false,
    inputWithdrawQtyErrorMsg: '',
    btnLoading: false,
    btnDisabled: false,
    depositType: {deposit: '10',withdraw: '20'}, // 数据存款类型10存款 20取款 用于分辨存款记录
    contractRecord: {wad: '',interest: ''}, // 账号合约资产统计
    depositHeaders: [
      { text: '日期', value: 'sysTime' },
      { text: '币种', value: 'token' },
      { text: '存款', value: 'qty' },
    ],
    depositRecord: [{sysTime:'',token: '',qty:''}], // 我的存款
    withdrawHeaders: [
      { text: '日期', value: 'sysTime' },
      { text: '币种', value: 'token' },
      { text: '取款', value: 'qty' }
    ],
    withdrawRecord: [{sysTime:'', token: '', qty:''}] // 我的存款
  }),
  props: {
    dialog: {type: Boolean, default: false}
  },
  computed: {
    // depositTotal作为除数时不能为0
    depositTotalDivisor: function () {
      if(this.depositTotal===0) {
        return 1
      } else {
        return this.depositTotal
      }
    }
  },
  mounted() {
    console.log('AddLoanLiquidity')

    this.contractInit(this.tokenSelect)
  },
  methods: {

    tabClick(){
      // console.log('tab',this.tab)
      this.$router.push('/AddLiquidity')
    },

    goAddLiquidity() {
      this.$router.push('/AddLiquidity')
    },

    postMyWithdrawRecord(owner, tokenSymbol, type, qty, balance) {
      let urlHeader = 'https://www.opswap.io/webapi/api/deposit?'
      let parameter = {
        owner: owner,
        token: tokenSymbol,
        type: type,
        qty: qty,
        balance: balance
      }
      let url = urlHeader + 'owner=' + parameter.owner + '&token=' + parameter.token + '&type=' + parameter.type + '&qty=' + parameter.qty + '&balance=' + parameter.balance
      axios.post(url)
          .then(function (Response){
            console.log('post withdraw', Response)
          })
    },

    postMyDepositRecord(owner, tokenSymbol, type, qty, balance) {
      let urlHeader = 'https://www.opswap.io/webapi/api/deposit?'
      let parameter = {
        owner: owner,
        token: tokenSymbol,
        type: type,
        qty: qty,
        balance: balance
      }
      let url = urlHeader + 'owner=' + parameter.owner + '&token=' + parameter.token + '&type=' + parameter.type + '&qty=' + parameter.qty + '&balance=' + parameter.balance
      axios.post(url)
          .then(function (Response){
            console.log('post deposit', Response)
          })
    },

    getMyDepositRecord(myAccount,type) {
      let url = 'https://www.opswap.io/webapi/api/deposit/type?owner=' + myAccount + '&type=' + type
      let that = this
      axios.get(url)
          .then(function (Response) {
            let table = JSON.parse(Response.data).Table
            let tableLength = table.length
            if (tableLength > 0) {
              // 先清空数组
              that.depositRecord.splice(0, that.depositRecord.length)

              for (let i = 0; i < tableLength; i++) {
                let qty = window.web3js.utils.fromWei(table[i].qty.toString())
                let record = {
                  sysTime: table[i].sysTime,
                  owner: table[i].owner,
                  token: table[i].token,
                  qty: Math.floor(qty * 1000000) / 1000000
                }
                that.depositRecord.push(record)
              }
            }
          })
          .catch(error=>{
            console.log('getMyDepositRecord error', error)
          })
    },

    getMyWithdrawRecord(myAccount,type) {
      let url = 'https://www.opswap.io/webapi/api/deposit/type?owner=' + myAccount + '&type=' + type

      let that = this
      axios.get(url).then(function (Response){
            let table = JSON.parse(Response.data).Table
            let tableLength = table.length
            if (tableLength>0) {
              // 先清空数组
              that.withdrawRecord.splice(0, that.withdrawRecord.length)

              for (let i = 0; i < tableLength; i++) {
                let qty = window.web3js.utils.fromWei(table[i].qty.toString())
                let record = {
                  sysTime: table[i].sysTime,
                  owner: table[i].owner,
                  token: table[i].token,
                  qty: Math.floor(qty * 1000000) / 1000000
                }
                that.withdrawRecord.push(record)
              }
            }
          })
      .catch(error=>{
        console.log('getMyWithdrawRecord error', error)
      })
    },

    // 选择币种 重置界面
    CboxChange() {
      this.contractInit(this.tokenSelect)
    },
    // 在存款输入检查
    inputQthCheck() {
      // console.log('inputQthCheck', this.inputQty, this.tokenBalance)
      if (parseFloat(this.inputQty) > parseFloat(this.tokenBalance)) {
        this.inputQtyError = true
        this.inputQtyErrorMsg = 'out of my balance'

      } else {
        this.inputQtyError = false
        this.inputQtyErrorMsg = ''
      }
    },

    // 取款输入检查
    inputWithdrawQthCheck() {
      if (this.inputWithdrawQty > this.contractRecord.wad) {
        this.inputWithdrawQtyError = true
        this.inputWithdrawQtyErrorMsg = 'out of my balance'

      } else {
        this.inputWithdrawQtyError = false
        this.inputWithdrawQtyErrorMsg = ''
      }
    },

    async contractInit(tokenSymbol) {

      let net_version = await Icontract.checkMetaMask()

      if ( net_version === this.$store.state.defaultNetwork ) {

        this.defaultAccount = this.$store.state.metamask.account
        this.inputQty=''
        this.inputWithdrawQty=''

        switch (tokenSymbol) {
          case 'USDT': {
            // ERC20 token
            Iusdt.methods.init(this.$store.state.ContractAddress.USDT)
            IloanUSDT.methods.init(this.$store.state.ContractAddress.loanUSDT)

            if (!isStrEmpty(this.defaultAccount)) {

              await this.updateStaticData(tokenSymbol)

              await this.updateDynamicData(tokenSymbol)
            }

            break
          }
          case 'ETH': {
            // 非ERC20 单合约token
            IloanETH.methods.init(this.$store.state.ContractAddress.loanETH)

            if (!isStrEmpty(this.defaultAccount)) {
              await this.updateStaticData(tokenSymbol)

              await this.updateDynamicData(tokenSymbol)
            }

            break
          }
        }
      }
    },

    // 更新界面静态数据
    async updateStaticData(tokenSymbol) {
      // 初始化原有数据 以免在币种切换时显示上一币种数据
      this.staticData = {}

      let that = this
      switch (tokenSymbol) {
        case 'USDT': {

          IloanUSDT.methods.getStaticData()
              .then(function (response) {
                // console.log('updateStaticData', response)
                that.staticData = response
              })
              .catch(error => {
                console.log('updateStaticData error', error)
              })
          break
        }
        case 'ETH': {
          IloanETH.methods.getStaticData()
              .then(function (response) {
                that.staticData = response
              })
              .catch(error => {
                console.log('updateStaticData error', error)
              })
          break
        }
      }
    },

    // 更新界面动态数据
    async updateDynamicData(tokenSymbol) {

      // 初始化原有数据 以免在币种切换时显示上一币种数据
      this.tokenBalance=''
      this.depositTotal=''
      this.contractRecord = {wad: '',interest: ''}

      let that = this
      switch (tokenSymbol) {
        case 'USDT': {

          Iusdt.methods.balanceOf(this.defaultAccount)
          .then(function (response){
            if (response !== '') {
              that.tokenBalance = response.format
            }
          })

          this.depositTotal = await IloanUSDT.methods.depositTotal()
          this.contractTokenBalance = await IloanUSDT.methods.getTokenBalance()
          IloanUSDT.methods.getDeposit(this.defaultAccount)
              .then(function (response) {
                that.contractRecord = response
              })
          break
        }
        case 'ETH': {
          let getMyETHBalanceRes = await Icontract.getBalanceOf(this.defaultAccount)
          this.tokenBalance=getMyETHBalanceRes.format

          this.depositTotal = await IloanETH.methods.depositTotal()
          this.contractTokenBalance = await IloanETH.methods.getBalance()

          IloanETH.methods.getDeposit(this.defaultAccount)
              .then(function (response) {
                that.contractRecord = response
              })
          break
        }
      }
      // 加载记录
      this.getMyDepositRecord(this.defaultAccount, this.depositType.deposit)
      this.getMyWithdrawRecord(this.defaultAccount, this.depositType.withdraw)
    },

    async addDeposit() {

      if (this.inputQty === 0 || this.inputQty === '') {
        this.inputQtyError = true
        this.inputQtyErrorMsg = 'invalid input 0'
        return
      }

      let from = this.defaultAccount
      let value =  window.web3js.utils.toWei(this.inputQty)

      this.btnLoading = true
      this.btnDisabled = true
      let that = this
      switch (this.tokenSelect) {
        case 'USDT': {

          this.depositUSDT(from, value)
          .then(function (response) {
            if(response) {
              that.updateDynamicData(that.tokenSelect)
              that.postMyDepositRecord(from, that.tokenSelect, that.depositType.deposit, value, value)
            }
            that.btnLoading = false
            that.btnDisabled = false
          })
          .catch(error=>{
            console.log('USDT deposit error', error)
            that.btnLoading = false
            that.btnDisabled = false
          })

          break
        }
        case 'ETH': {
          IloanETH.methods.deposit(from, value)
          .then(function (response) {
            if(response) {
              that.updateDynamicData(that.tokenSelect)
              that.postMyDepositRecord(from, that.tokenSelect, that.depositType.deposit, value, value)
            }
            that.btnLoading = false
            that.btnDisabled = false
          })
          .catch(error=>{
            console.log('ETH deposit error', error)
            that.btnLoading = false
            that.btnDisabled = false
          })

          break
        }
      }
    },

    async depositUSDT(fromAccount, value) {
      let spender = this.$store.state.ContractAddress.loanUSDT
      let depositRes = false
      let myAllowance = await Iusdt.methods.allowance(fromAccount, spender)
      console.log('myAllowance', myAllowance)
      if(isStrEmpty(myAllowance)) {
        alert('网络错误未能获取批准额度,请稍后再试')
        return
      }

      if (myAllowance === null || myAllowance === 0 || myAllowance === '0') {

        let approveRes=await Iusdt.methods.approve(fromAccount,spender,value)

        // 需先将from地址approve给loan合\
        if (approveRes) {
          depositRes = await IloanUSDT.methods.deposit(fromAccount, value)
        }
      } else {
        if (BigInt(myAllowance) >= BigInt(value)) {
          console.log('myAllowance >=')
          depositRes = await IloanUSDT.methods.deposit(fromAccount, value)
        } else {
          console.log('myAllowance <')

          if (confirm('您有未使用的批准余额 需要先重置该额度')) {
            await Iusdt.methods.approve(fromAccount, spender, '0')
          }
        }
      }

      return depositRes

    },

    // 取款
    async withdrawMyDeposit() {

      if (this.inputWithdrawQty === 0 || this.inputWithdrawQty==='') {
        this.inputWithdrawQtyError = true
        this.inputWithdrawQtyErrorMsg = 'invalid input 0'
        return
      }

      let from = this.defaultAccount
      let inputValue = window.web3js.utils.toWei(this.inputWithdrawQty)

      if (this.contractRecord.wad === '0' || this.inputWithdrawQty > this.contractRecord.wad) {
        window.alert('您提取额度不能大于存款')
      } else {
        let that = this
        this.btnLoading = true
        this.btnDisabled = true
        switch (this.tokenSelect) {
          case 'USDT': {
            IloanUSDT.methods.withdraw(from, inputValue)
                .then(function (response) {
                  if(response) {
                    that.postMyWithdrawRecord(from, that.tokenSelect, that.depositType.withdraw, inputValue, inputValue)
                    that.updateDynamicData(that.tokenSelect)
                  }
                  that.btnLoading = false
                  that.btnDisabled = false
                })
                .catch(Error => {
                  console.log('usdt withdraw error', Error)
                  that.btnLoading = false
                  that.btnDisabled = false
                })
            break
          }
          case 'ETH': {
            IloanETH.methods.withdraw(from, inputValue)
                .then(function (response) {
                  if(response) {
                    that.postMyWithdrawRecord(from, that.tokenSelect, that.depositType.withdraw, inputValue, inputValue)
                    that.updateDynamicData(that.tokenSelect)
                  }
                  that.btnLoading = false
                  that.btnDisabled = false
                })
                .catch(Error => {
                  console.log('usdt withdraw error', Error)
                  that.btnLoading = false
                  that.btnDisabled = false
                })
            break
          }
        }

      }
    },

  }
}
</script>

<style scoped>

@-moz-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-o-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

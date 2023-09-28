<template>
  <v-container class="px-0">
    <h4 class="ml-1">{{$t('web.Staking')}} {{ networkHint }} </h4>
    <h5 class="ml-1 red--text" v-if="networkHint!==''">{{ networkHint }} </h5>
    <v-row class="mt-9 ml-1">
      <v-combobox
          class="shrink"
          v-model="PledgeSelect"
          :items="PledgeItem"
          @change="PledgeItemChange"
          label="token"
          outlined
      ></v-combobox>
    </v-row>

    <v-row class="align-end" >
      <v-col class="col-4 pr-0">
        <h5 class="font-weight-light blue--text" v-if="PledgeSelect==='OPL'">{{$t('web.Total')}}: {{showTag.OPLTotal}}</h5>
        <h5 class="font-weight-light blue--text" v-if="PledgeSelect==='OPL'">{{$t('web.Days')}}: {{showTag.OPLDays}}</h5>
        <h5 class="font-weight-light blue--text" v-if="PledgeSelect==='OPS'">{{$t('web.Total')}}: {{showTag.OPSTotal}}</h5>
        <h5 class="font-weight-light blue--text" v-if="PledgeSelect==='OPS'">{{$t('web.Days')}}: {{showTag.OPSDays}}</h5>

      </v-col>
      <v-col class="col-5 px-0">
        <h5 class="blue--text" v-if="PledgeSelect==='OPL'">{{ $t('web.MyEarned') }}: {{Math.floor(myBalance.OPLMiner * 10000)/10000}}</h5>
        <h5 class="blue--text" v-if="PledgeSelect==='OPS'">{{ $t('web.MyEarned') }}: {{Math.floor(myBalance.OPSMiner * 10000)/10000}}</h5>
        <h5 class="font-weight-light blue--text" v-if='parseFloat(myBalance.PledgeCount)>0'>{{ $t('web.MyRate') }}: {{ Math.floor(myBalance.rate * 100 * 100000000) / 100000000}} %</h5>
        <h5 class="font-weight-light blue--text" v-else>{{ $t('web.MyRate') }}: 0 %</h5>
      </v-col>
      <v-col class="col-3 text-center pl-0">
        <h5 class="font-weight-light blue--text">{{Math.floor(myBalance.APR * 100 * 1)/1}}%</h5>
        <h6 class="font-weight-light blue--text">APR</h6>
      </v-col>
    </v-row>
    <!--  抵押  -->
    <v-row class="mt-9 mb-2 ml-1">
      <h5 class="font-weight-light" v-if="PledgeSelect==='OPS'">{{ $t('web.Balance') }}: {{Math.floor(strSubFromWei(myBalance.OPS) * 10000)/10000}}</h5>
      <h5 class="font-weight-light" v-if="PledgeSelect==='OPL'">{{ $t('web.Balance') }}: {{Math.floor(strSubFromWei(myBalance.OPL) * 1000000)/1000000}}</h5>
    </v-row>
      <v-text-field
          v-model="addAmount"
          label="Amount"
          placeholder="0.0"
          :error="addAmount_error.state"
          :error-messages="addAmount_error.msg"
          @input="addAmountCheck"
          type="number"
          outlined
      />
    <v-row class="mr-2">
      <v-spacer/>
      <v-btn class="white--text" color="blue" @click="addPledge" :loading="buttonState.loading" :disabled="buttonState.disabled">{{$t('web.ADDStake')}}</v-btn>
    </v-row>

    <!-- 提取抵押   -->
    <v-row class="mt-9 mb-2 ml-1">
      <h5 class="font-weight-light">{{ $t('web.StakingBalance') }}: {{Math.floor(strSubFromWei(myBalance.PledgeAmount) * 10000)/10000}}</h5>
    </v-row>
    <v-text-field
        v-model="withdrawAmount"
        label="Amount"
        placeholder="0.0"
        :error="withdrawAmount_error.state"
        :error-messages="withdrawAmount_error.msg"
        @input="WithdrawAmountCheck"
        type="number"
        outlined
    />
    <v-row class="mr-2">
      <v-spacer/>
      <v-btn class="pa-1 white--text" color="blue" @click="WithdrawPledge" :loading="buttonState.loading" :disabled="buttonState.disabled">{{$t('web.RemoveStake')}}</v-btn>
    </v-row>

    <!--提取收益    -->
    <v-row class="mt-9 mb-2 ml-1">
      <h5 class="font-weight-light" v-if="PledgeSelect==='OPL'">{{ $t('web.MyEarned') }}: {{Math.floor(myBalance.OPLMiner * 10000)/10000}} ops</h5>
      <h5 class="font-weight-light" v-if="PledgeSelect==='OPS'">{{ $t('web.MyEarned') }}: {{Math.floor(myBalance.OPSMiner * 10000)/10000}} ops</h5>
    </v-row>
    <v-text-field
        v-model="withdrawMineralAmount"
        label="Amount"
        placeholder="0.0"
        :error="withdrawMineralAmount_error.state"
        :error-messages="withdrawMineralAmount_error.msg"
        @input="withdrawMineralAmountCheck"
        type="number"
        outlined
    />
    <v-row class="mr-2">
      <v-spacer/>
      <v-btn class="pa-1 white--text" color="blue" @click="test" :loading="buttonState.loading" :disabled="buttonState.disabled">{{$t('web.WithdrawalReward')}}</v-btn>
    </v-row>

    <v-col class="mt-9 green--text">
      <h5>{{$t('long.pledgeHint1')}}</h5>
      <h5>{{$t('long.pledgeHint2')}}</h5>
      <h5>{{$t('long.AddLiquidityHint1')}}</h5>
      <h5>{{$t('long.pledgeHint3')}}</h5>

    </v-col>

    <!-- 公用提示框     -->
    <v-snackbar
        v-model="SnackbarShow"
        :color="vSnackbar.type"
    >
      {{ vSnackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script>
import IErc20 from "@/contract/ERC20/interface"
import IPledge from "@/contract/Pledge/interface"
import {Icontract, isStrEmpty, strFromWei} from "@/common"
import axios from "axios"

export default {
  name: "Pledge",
  data: () => ({
    defaultAccount: '',
    MineralInterval: null,
    addAmount: '',
    addAmount_error: {state: false, msg:''},
    withdrawAmount: '',
    withdrawAmount_error: {state: false, msg:''},
    withdrawMineralAmount: '',
    withdrawMineralAmount_error: {state: false, msg:''},
    PledgeContract: '0x5Fe1cCe9897Df484a918EA9446cec7D14dD96F2B',
    minerUnit:{liquidity: 88, token:44}, // 每分钟分发给流动性抵押者的数量(可抵押流动性和token两种挖矿模式)
    myBalance: {ETH:'', OPL:0, OPS:0, PledgeAmount:0, PledgeCount:0, OPLMiner:0, OPSMiner:0, rate:0, APR:0},
    buttonState: {loading: false, disabled:false},
    pledgeTag: {OPL:'OPL', OPS:'OPS'},
    PledgeItem: ['OPL','OPS'],
    PledgeSelect: 'OPL',
    OPSContract: null,
    OPLContract: null,
    networkHint: '',
    miner: '',
    showTag: {OPLTotal: 46666666, OPLDays: 127854, OPSTotal: 23333333, OPSDays: 63927},
    SnackbarShow: false,
    vSnackbar:{type:'success', text: 'ok'}, // 用于显示 公用提示信息 type=[info,success,warning,error]
  }),
  watch:{
    PledgeSelect: function (newValue, oldValue) {
      console.log(oldValue, newValue)
    }
  },
  computed: {
    strSubFromWei() {
      return function (value) {
        let res = ''
        // console.log('strSubFromWei', value)
        if (!isStrEmpty(value)) {
          res = strFromWei(value)
        }
        return res
      }
    }
  },
  mounted() {
    this.init()
  },
  destroyed() {
    if (this.MineralInterval!==null) {
      console.log('clear miner')
      clearInterval(this.MineralInterval)
    }
  },
  methods:{
    clearData(){
      this.myBalance.ETH=''
      this.myBalance.OPL=0
      this.myBalance.OPS=0
      this.myBalance.PledgeAmount=0
      this.myBalance.PledgeCount=0
      this.myBalance.rate=0
      this.withdrawMineralAmount_error.state= false
      this.withdrawMineralAmount_error.msg=''
      this.withdrawAmount_error.state=false
      this.withdrawAmount_error.msg=''
      this.addAmount_error.state=false
      this.addAmount_error.msg=''

      if (this.PledgeSelect === this.pledgeTag.OPL) {
        this.myBalance.APR = '283'
      }

      if (this.PledgeSelect === this.pledgeTag.OPS) {
        this.myBalance.APR = '215'
      }

    },
    async init() {
      let net_version = await Icontract.getMetaMask()
      if ( net_version.toString() === this.$store.state.defaultNetwork ) {
        this.defaultAccount = this.$store.state.metamask.account

        // OPScontract专用于取OPP余额
        this.OPSContract=IErc20.ABI.init(this.$store.state.ContractAddress.OPS)

        IPledge.ABI.init(this.PledgeContract)

        if (!isStrEmpty(this.defaultAccount) && this.OPSContract!==null) {
          this.forTime()
          await this.updateDynamicData()
        }
      } else {

        this.networkHint = 'please select Arbitrum One'

        if (this.PledgeSelect === this.pledgeTag.OPL) {
          this.myBalance.APR = '283'
        }

        if (this.PledgeSelect === this.pledgeTag.OPS) {
          this.myBalance.APR = '215'
        }

      }
    },

    async PledgeItemChange(){
      console.log('PledgeItemChange',this.PledgeSelect)
      this.clearData()
      await this.updateDynamicData()
    },

    // 记录存入数据库
    async postMyPledge(account, symbol) {
      let urlHeader = 'https://www.opswap.io/webapi/api/Miner?'
      let url = urlHeader + 'address=' + account + '&symbol=' + symbol + '&chainID=' + this.$store.state.defaultNetwork
      let postRes = await axios.post(url)
      if (postRes.data > 0){
        console.log('postMyPledge ', postRes.data )
      } else {
        console.log('postMyPledge error')
      }
      return postRes.data
    },

    async putMyPledge(account, symbol, mineral) {
      // 需发布后在同一域名下执行
      let urlHeader = 'https://www.opswap.io/webapi/api/Miner/MineralPut?'
      let url = urlHeader + 'address=' + account + '&symbol=' + symbol + '&chainID=' + this.$store.state.defaultNetwork + '&mineral=' + mineral
      console.log('put', url)
      let putRes = await axios.put(url)
      if (putRes.data > 0) {
        console.log('putMyPledge ', putRes.data)
      } else {
        console.log('putMyPledge error')
      }
      return putRes.data
    },

    // 取交易记录
    getMyMineral() {
      axios.get('https://www.opswap.io/webapi/api/miner/GetMiner?address='+ this.defaultAccount)
          .then(Response=> {
            // console.log('getMyMineral', Response)
            let myPledge = JSON.parse(Response.data).Table

            for (let i=0; i<myPledge.length; i++) {

              if (myPledge[i].symbol === this.pledgeTag.OPL) {
                this.myBalance.OPLMiner = myPledge[i].mineral
              }
              if (myPledge[i].symbol === this.pledgeTag.OPS) {
                this.myBalance.OPSMiner = myPledge[i].mineral
              }
            }

          })
          .catch(error => {
            console.log('getMyPledgeRecord error', error)
          })

    },

    // 计算某矿工的年化收益
    async countMinerAPR(minerAddress) {
      // 已抵押挖矿的流动性凭证
      let PledgeAmount
      let MyMinerUnit
      let resRat= 0
      // 当前页面为token挖矿
      if (this.PledgeSelect === this.pledgeTag.OPS) {
        PledgeAmount = await IPledge.ABI.getUserToken(minerAddress)
        MyMinerUnit = this.minerUnit.token
      }

      // 当前页面为流动性挖矿
      if (this.PledgeSelect === this.pledgeTag.OPL) {
        PledgeAmount = await IPledge.ABI.getUserLiquidity(minerAddress)
        MyMinerUnit = this.minerUnit.liquidity
      }
      if (!isStrEmpty(PledgeAmount) && parseFloat(PledgeAmount.myBalance) > 0) {
        let myRate = PledgeAmount.myBalance / PledgeAmount.total
        let myRateFormat = Math.floor(myRate * 100000000)/100000000
        // 年化收益率 = (单位收益 * 单位总量) / 成本(抵押数量) * 100;
        // 单位收益为我的占比*每分钟配数量
        // 单位总量以年计 1年=525600分种
        let myPledgeAmountFromWei = window.web3js.utils.fromWei(PledgeAmount.myBalance)

        if (this.PledgeSelect === this.pledgeTag.OPL) {
          // OPL相对于OPS的价值 * 5000(暂定)
          resRat = (myRateFormat * MyMinerUnit * 525600) / (myPledgeAmountFromWei * 5000)
        }
        if (this.PledgeSelect === this.pledgeTag.OPS) {
          resRat = (myRateFormat * MyMinerUnit * 525600) / (myPledgeAmountFromWei)
        }
      }
      return resRat

    },

    // 时时循环更新 显示我的挖矿收益
    forTime(){
      if (this.MineralInterval!==null){
        return
      }
      console.log('getMyMineral')
      this.getMyMineral() // 先执行一次后第分钟执行一次
      this.MineralInterval = setInterval(async () => {
        // 每1分种
        try {
          this.getMyMineral()
        }
        catch (e) {
          console.log(e)
        }

      }, 1000 * 60)
    },

    // 更新界面动态数据
    async updateDynamicData() {
      console.log('updateDynamicData', this.PledgeSelect)

      if (isStrEmpty(this.defaultAccount) || this.OPSContract===null) {
        console.log('default account empty')
        return
      }

      // 取矿工总数
      // let MinerCountRes = await axios.get('https://www.opswap.io/webapi/api/pledge/MinerCount')
      // this.miner=MinerCountRes.data

      // 根据所选token加载功能合约
      if (this.PledgeSelect === this.pledgeTag.OPS) {
        IErc20.ABI.init(this.$store.state.ContractAddress.OPS)
      }

      if (this.PledgeSelect === this.pledgeTag.OPL) {
        IErc20.ABI.init(this.$store.state.ContractAddress.OPL)

        // 我流动性凭证余额
        this.myBalance.OPL = await IErc20.ABI.balanceOf(this.defaultAccount)
        // console.log('OPL balance', this.myBalance.OPL)
      }

      this.myBalance.OPS = await this.OPSContract.methods.balanceOf(this.defaultAccount).call()
      // console.log('this.myBalance.OPS', this.myBalance.OPS, )
      // 已抵押挖矿的流动性凭证
      let PledgeAmount
      let MyMinerUnit
      // 当前页面为token挖矿
      if (this.PledgeSelect === this.pledgeTag.OPS) {
        PledgeAmount = await IPledge.ABI.getUserToken(this.defaultAccount)
        MyMinerUnit = this.minerUnit.token
      }

      // 当前页面为流动性挖矿
      if (this.PledgeSelect === this.pledgeTag.OPL) {
        PledgeAmount = await IPledge.ABI.getUserLiquidity(this.defaultAccount)
        MyMinerUnit = this.minerUnit.liquidity
      }

      if (!isStrEmpty(PledgeAmount) && parseFloat(PledgeAmount.myBalance) > 0) {
        this.myBalance.PledgeAmount = PledgeAmount.myBalance
        this.myBalance.PledgeCount = PledgeAmount.total
        let myRate = PledgeAmount.myBalance / PledgeAmount.total
        this.myBalance.rate = Math.floor(myRate * 100000000)/100000000
        // 年化收益率 = (单位收益 * 单位总量) / 成本(抵押数量) * 100;
        // 单位收益为我的占比*每分钟配数量
        // 单位总量以年计 1年=525600分种
        let myPledgeAmountFromWei = window.web3js.utils.fromWei(this.myBalance.PledgeAmount)

        if (this.PledgeSelect === this.pledgeTag.OPL) {
          // OPL相对于OPS的价值 * 5000(暂定)
          this.myBalance.APR = (this.myBalance.rate * MyMinerUnit * 525600) / (myPledgeAmountFromWei * 5000)
        }
        if (this.PledgeSelect === this.pledgeTag.OPS) {
          this.myBalance.APR = (this.myBalance.rate * MyMinerUnit * 525600) / (myPledgeAmountFromWei)
        }
      } else {
        // 若为新用户 加载最后一个矿工的年化益做为参考
        let lastAddress = await axios.get('https://www.opswap.io/webapi/api/miner/MinerLast?symbol=' + this.PledgeSelect + '&chainID=' + this.$store.state.defaultNetwork)

        if (window.web3js.utils.isAddress(lastAddress.data.toString())) {
          let rate = await this.countMinerAPR(lastAddress.data)

          if (!isStrEmpty(rate) && parseFloat(rate.toString()) >0 )
            this.myBalance.APR = rate
        }
      }

    },

    addAmountCheck() {
      // console.log('check', this.addAmount)

      if (isStrEmpty(this.addAmount) || this.addAmount.toString()==='0'){
        this.addAmount_error.state=false
        this.addAmount_error.msg = this.$t('error.invalidValue')
        return false
      }

      let selectTokenBalance = this.myBalance.OPL
      if (this.PledgeSelect===this.pledgeTag.OPS) {
        selectTokenBalance = this.myBalance.OPS
      }
      let addAmountWei = window.web3js.utils.toWei(this.addAmount)
      if (BigInt(addAmountWei) > BigInt(selectTokenBalance)) {
        this.addAmount_error.state=true
        this.addAmount_error.msg = this.$t('error.OverBalance')
        return false
      }

      this.addAmount_error.state=false
      this.addAmount_error.msg = ''
      return true
    },

    WithdrawAmountCheck() {
      // console.log('check', this.withdrawAmount)

      if (isStrEmpty(this.withdrawAmount) || this.withdrawAmount.toString() === '0') {
        this.withdrawAmount_error.state = false
        this.withdrawAmount_error.msg = ''
        return false
      }

      let withdrawAmountWei = window.web3js.utils.toWei(this.withdrawAmount)
      if (BigInt(withdrawAmountWei) > BigInt(this.myBalance.PledgeAmount)) {
        this.withdrawAmount_error.state = true
        this.withdrawAmount_error.msg = this.$t('error.OverBalance')
        return false
      }

      this.withdrawAmount_error.state = false
      this.withdrawAmount_error.msg = ''
      return true
    },

    withdrawMineralAmountCheck(){

      if (isStrEmpty(this.withdrawMineralAmount) || this.withdrawMineralAmount.toString()==='0'){
        this.withdrawMineralAmount_error.state=false
        this.withdrawMineralAmount_error.msg = ''
        return false
      }

      let myMiner = this.myBalance.OPLMiner
      if (this.PledgeSelect===this.pledgeTag.OPS) {
        myMiner = this.myBalance.OPSMiner
      }

      if (parseFloat(this.withdrawMineralAmount) > parseFloat(myMiner)) {
        this.withdrawMineralAmount_error.state=true
        this.withdrawMineralAmount_error.msg = this.$t('error.OverBalance')
        return false
      }

      this.withdrawMineralAmount_error.state=false
      this.withdrawMineralAmount_error.msg = ''
      return true
    },

    // 抵押流动性凭证
    async addLiquidity2() {
      this.buttonState.disabled=true
      this.buttonState.loading=true

      let addAmountWei = window.web3js.utils.toWei(this.addAmount)

      let approve = await IErc20.ABI.approve(this.defaultAccount,this.PledgeContract, addAmountWei)
      console.log('approve', approve, addAmountWei)

      let allowance = await IErc20.ABI.allowance(this.defaultAccount,this.PledgeContract)

      if (BigInt(allowance)>=BigInt(addAmountWei)){
        let addLiquidityRes = await IPledge.ABI.addLiquidity(this.defaultAccount,addAmountWei)
        if (!isStrEmpty(addLiquidityRes)){
          // console.log('addLiquidityRes', addLiquidityRes.myBalance, addLiquidityRes.total)
          // 显示提示信息
          this.SnackbarShow = true
          this.vSnackbar = {type: this.$store.state.myColor.success,text: this.$t('web.Success')}

          await this.postMyPledge(this.defaultAccount,this.pledgeTag.OPL)
          await this.updateDynamicData()
        } else {
          // 显示提示信息
          this.SnackbarShow = true
          this.vSnackbar = {type: this.$store.state.myColor.error,text: this.$t('error.TFailure')}

        }
      }

      this.buttonState.disabled=false
      this.buttonState.loading=false

    },

    // 抵押token
    async addToken2() {
      this.buttonState.disabled=true
      this.buttonState.loading=true
      let addAmountWei = window.web3js.utils.toWei(this.addAmount)

      let approve = await IErc20.ABI.approve(this.defaultAccount,this.PledgeContract, addAmountWei)
      console.log('approve', approve, addAmountWei)

      let allowance = await IErc20.ABI.allowance(this.defaultAccount,this.PledgeContract)

      if (BigInt(allowance)>=BigInt(addAmountWei)){
        let addTokenRes = await IPledge.ABI.addToken(this.defaultAccount,addAmountWei)

        if (!isStrEmpty(addTokenRes)){
          this.SnackbarShow = true
          this.vSnackbar = {type: this.$store.state.myColor.success,text: this.$t('web.Success')}

          await this.postMyPledge(this.defaultAccount,this.pledgeTag.OPS, )
          await this.updateDynamicData()
        } else {
          // 显示提示信息
          this.SnackbarShow = true
          this.vSnackbar = {type: this.$store.state.myColor.error,text: this.$t('error.TFailure')}

        }
      }
      this.buttonState.disabled=false
      this.buttonState.loading=false
    },

    // 抵押流动性凭证
    async addLiquidity() {
      this.buttonState.disabled=true
      this.buttonState.loading=true

      let addAmountWei = window.web3js.utils.toWei(this.addAmount)

      // 检查allowance 没有批准额度则先批准再还款
      let allowance = await IErc20.ABI.allowance(this.defaultAccount,this.PledgeContract)
      let approveRes = false
      if (isStrEmpty(allowance) || allowance === 0 || allowance === '0' || BigInt(allowance) === 0n || BigInt(allowance)<BigInt(addAmountWei)) {
        approveRes = await IErc20.ABI.approve(this.defaultAccount,this.PledgeContract, this.$store.state.approveTotal)
      }

      if (BigInt(allowance)>=BigInt(addAmountWei) || approveRes){
        let addLiquidityRes = await IPledge.ABI.addLiquidity(this.defaultAccount,addAmountWei)
        if (!isStrEmpty(addLiquidityRes)){
          // console.log('addLiquidityRes', addLiquidityRes.myBalance, addLiquidityRes.total)
          // 显示提示信息
          this.SnackbarShow = true
          this.vSnackbar = {type: this.$store.state.myColor.success,text: this.$t('web.Success')}

          await this.postMyPledge(this.defaultAccount,this.pledgeTag.OPL)
          await this.updateDynamicData()
        } else {
          // 显示提示信息
          this.SnackbarShow = true
          this.vSnackbar = {type: this.$store.state.myColor.error,text: this.$t('error.TFailure')}

        }
      }

      this.buttonState.disabled=false
      this.buttonState.loading=false

    },

    // 抵押token
    async addToken() {
      this.buttonState.disabled=true
      this.buttonState.loading=true
      let addAmountWei = window.web3js.utils.toWei(this.addAmount)

      let allowance = await IErc20.ABI.allowance(this.defaultAccount,this.PledgeContract)

      let approveRes = false
      if (isStrEmpty(allowance) || allowance === 0 || allowance === '0' || BigInt(allowance) === 0n || BigInt(allowance)<BigInt(addAmountWei)) {
        approveRes = await IErc20.ABI.approve(this.defaultAccount,this.PledgeContract, this.$store.state.approveTotal)
      }

      if (BigInt(allowance)>=BigInt(addAmountWei) || approveRes){
        let addTokenRes = await IPledge.ABI.addToken(this.defaultAccount,addAmountWei)

        if (!isStrEmpty(addTokenRes)){
          this.SnackbarShow = true
          this.vSnackbar = {type: this.$store.state.myColor.success,text: this.$t('web.Success')}

          await this.postMyPledge(this.defaultAccount,this.pledgeTag.OPS, )
          await this.updateDynamicData()
        } else {
          // 显示提示信息
          this.SnackbarShow = true
          this.vSnackbar = {type: this.$store.state.myColor.error,text: this.$t('error.TFailure')}

        }
      }
      this.buttonState.disabled=false
      this.buttonState.loading=false
    },

    addPledge(){
      if (!this.addAmountCheck()) {
        return
      }
      if (this.PledgeSelect===this.pledgeTag.OPL) {
        this.addLiquidity()
      }
      if (this.PledgeSelect===this.pledgeTag.OPS) {
        this.addToken()
      }
    },

    // 取出抵押的流动性凭证
    async WithdrawLiquidity() {

      this.buttonState.disabled=true
      this.buttonState.loading=true

      let withdrawAmountWei = window.web3js.utils.toWei(this.withdrawAmount)

      if (BigInt(this.myBalance.PledgeAmount)>=BigInt(withdrawAmountWei)){
        let WithdrawLiquidityRes = await IPledge.ABI.WithdrawLiquidity(this.defaultAccount,withdrawAmountWei)
        // console.log('WithdrawLiquidity res', WithdrawLiquidityRes)
        if (!isStrEmpty(WithdrawLiquidityRes)) {
          // 显示提示信息
          this.SnackbarShow = true
          this.vSnackbar = {type: this.$store.state.myColor.success,text: this.$t('web.Success')}

          await this.updateDynamicData()

      } else {
          // 显示提示信息
          this.SnackbarShow = true
          this.vSnackbar = {type: this.$store.state.myColor.error,text: this.$t('error.TFailure')}

        }
      }
      this.buttonState.disabled=false
      this.buttonState.loading=false
    },

    // 取出抵押的token
    async WithdrawToken() {

      this.buttonState.disabled=true
      this.buttonState.loading=true
      let withdrawAmountWei = window.web3js.utils.toWei(this.withdrawAmount)

      if (BigInt(this.myBalance.PledgeAmount)>=BigInt(withdrawAmountWei)){
        let WithdrawTokenRes = await IPledge.ABI.WithdrawToken(this.defaultAccount,withdrawAmountWei)
        // console.log('WithdrawToken res', WithdrawTokenRes)
        if (!isStrEmpty(WithdrawTokenRes)) {
          this.SnackbarShow = true
          this.vSnackbar = {type: this.$store.state.myColor.success,text: this.$t('web.Success')}

          await this.updateDynamicData()
        } else {
          // 显示提示信息
          this.SnackbarShow = true
          this.vSnackbar = {type: this.$store.state.myColor.error,text: this.$t('error.TFailure')}

        }
      }
      this.buttonState.disabled=false
      this.buttonState.loading=false
    },

    WithdrawPledge(){
      if (!this.WithdrawAmountCheck()){
        return
      }
      if (this.PledgeSelect===this.pledgeTag.OPL) {
        this.WithdrawLiquidity()
      }
      if (this.PledgeSelect===this.pledgeTag.OPS) {
        this.WithdrawToken()
      }
    },

    async test() {
      await this.putMyPledge('0x0b07aF2FdC80b9f87c37E83cDB1d6dE7Dffc5F3F','OPS','-7')

    },

    // 取出挖矿收益
    // 从合约转账到用户
    async withdrawMineral() {
      console.log('withdrawMineral')
      if (!this.withdrawMineralAmountCheck()) {
        return
      }

      let withdrawMineralAmountWei = window.web3js.utils.toWei(this.withdrawMineralAmount)

      // 检查合约可供提取数量
      let pledgeOPPBalance = await this.OPSContract.methods.balanceOf(this.PledgeContract).call()
      if (parseFloat(this.withdrawMineralAmount)>Math.floor(window.web3js.utils.fromWei(pledgeOPPBalance.toString())*10000)/10000){
        this.withdrawMineralAmount_error.state=true
        this.withdrawMineralAmount_error.msg = this.$t('error.OverContract')
        return
      }

      this.buttonState.disabled=true
      this.buttonState.loading=true
      let withdrawMineralRes = await IPledge.ABI.WithdrawMineral(this.defaultAccount,'0x0f458ab745168191efC917F6E1dbdFD698A232B4',withdrawMineralAmountWei)
      if (withdrawMineralRes) {
        // 显示提示信息
        this.SnackbarShow = true
        this.vSnackbar = {type: this.$store.state.myColor.success,text: this.$t('web.Success')}

        if (this.PledgeSelect === this.pledgeTag.OPL) {
          this.myBalance.OPLMiner = parseFloat(this.myBalance.OPLMiner) - parseFloat(this.withdrawMineralAmount)
        }
        if (this.PledgeSelect === this.pledgeTag.OPS) {
          this.myBalance.OPSMiner = parseFloat(this.myBalance.OPSMiner) - parseFloat(this.withdrawMineralAmount)
        }
        await this.updateDynamicData()

        let putTag = this.pledgeTag.OPL
        if (this.PledgeSelect === this.pledgeTag.OPS) {
          putTag = this.pledgeTag.OPS
        }
        await this.putMyPledge(this.defaultAccount, putTag, '-' + this.withdrawMineralAmount.toString())

      } else {
        // 显示提示信息
        this.SnackbarShow = true
        this.vSnackbar = {type: this.$store.state.myColor.error,text: this.$t('error.TFailure')}

      }
      this.buttonState.disabled=false
      this.buttonState.loading=false

    },

  }
}
</script>

<style scoped>

</style>

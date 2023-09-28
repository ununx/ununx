<template>
  <v-row justify="center">
    <v-col class="mx-1">
      <v-row class="headline mt-4">
        Layer2 swap
        <v-spacer/>
        <!--              <a @click="goFaucet" class="text-caption">{{$t('web.Faucet')}}</a>-->
      </v-row>
      <!--            <v-row class="mt-9">-->
      <!--              <v-icon class="blue&#45;&#45;text">exposure_plus_2</v-icon>-->
      <!--              <h5 class="blue&#45;&#45;text ml-1">充值到L2</h5>-->
      <!--              <v-icon class="blue&#45;&#45;text ml-5">sync_alt</v-icon>-->
      <!--              <h5 class="blue&#45;&#45;text ml-1">L2之间转帐</h5>-->
      <!--              <v-icon class="blue&#45;&#45;text ml-5">repeat_one</v-icon>-->
      <!--              <h5 class="blue&#45;&#45;text ml-1">提现到L1</h5>-->

      <!--            </v-row>-->

      <!--            <v-row class="mt-9">-->
      <!--              <h5 class="font-weight-medium">合约流动性{{token_from_select}}: {{token_from_reserves}}</h5>-->
      <!--              <h5 class="font-weight-medium ml-5">{{token_to_select}}: {{token_to_reserves}}</h5>-->
      <!--            </v-row>-->
      <v-row>
        <v-col class="pl-0 pr-0 mt-4">
          <v-row @click="test4" class="justify-end mr-1 text-caption">{{ $t('web.Balance') }}: {{token_from_balance}}</v-row>
          <v-row>
            <v-col cols="8" class="pr-0">
              <v-text-field
                  v-model="token0_value"
                  label="From"
                  placeholder="0.0"
                  :error="token_from_error"
                  :error-messages="token_from_errorMSG"
                  @input="fromInput"
                  type="number"
                  outlined
              >
              </v-text-field>
            </v-col>
            <v-col cols="4" class="pl-0">
              <v-combobox
                  class="shrink"
                  v-model="token_from_select"
                  :items="$store.state.PairSymbolArray"
                  @change="fromChange"
                  label="token"
                  outlined
              ></v-combobox>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row class="justify-center">
        <v-icon class="ml-3 mb-5" color="blue" :disabled="swapDisabled" large @click="swapPosition">swap_calls</v-icon>
        <!--<v-icon @click="AmountOut" class="mt-0 pt-0" large color="blue">arrow_downward</v-icon>-->
      </v-row>
      <v-row>

        <v-col class="pl-0 pr-0">
          <v-row class="justify-end mr-1 text-caption">{{ $t('web.Balance') }}: {{token_to_balance}}</v-row>
          <v-row>
            <v-col cols="8" class="pr-0">
              <v-text-field
                  class="pt-0 pb-0 mt-0 mb-0"
                  v-model="token1_value"
                  label="To"
                  placeholder="0.0"
                  readonly
                  type="number"
                  outlined
              ></v-text-field>
            </v-col>
            <v-col cols="4" class="pl-0">
              <v-combobox
                  class="shrink"
                  v-model="token_to_select"
                  :items="$store.state.PairSymbolArray"
                  @change="toChange"
                  label="token"
                  outlined
              ></v-combobox>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

<!--      <v-row class="text-center">-->
<!--      <v-col v-if="showTimeStatus">-->
<!--        <h3 class="blue&#45;&#45;text">{{showTime}}</h3>-->
<!--        <h5>Start 2021-09-22 21:00:00</h5>-->
<!--      </v-col>-->
<!--      </v-row>-->
      <v-row class="mt-3">
        <v-btn block class="white--text" color="blue" :loading="swapLoading" :disabled="swapDisabled" @click="swap">{{$t('web.Swap')}}
          <template v-slot:loader>
                    <span class="custom-loader">
                      <v-icon light>cached</v-icon>
                    </span>
          </template>
        </v-btn>
      </v-row>

      <v-card outlined class="mt-9 pa-0" >
        <v-row class="my-2">
          <v-col class="col-4 py-0 ml-1">
            <v-card-subtitle class="pa-0">Rate</v-card-subtitle>
          </v-col>
          <v-col class="text-end py-0 mr-1">
            <v-card-subtitle class="pa-0">0.1 eth = {{SwapHint.forward}} OPS</v-card-subtitle>
            <v-card-subtitle class="pa-0">1 OPS = {{SwapHint.backward.substring(0, 10)}} eth</v-card-subtitle>
          </v-col>
        </v-row>

        <v-row class="my-0 pb-2">
          <v-col class="col-4 py-0 ml-1">
            <v-card-subtitle class="pa-0">Gas Fee</v-card-subtitle>
          </v-col>
          <v-col class="text-end py-0 mr-1">
            <v-card-subtitle class="pa-0">{{SwapHint.gas}} eth</v-card-subtitle>
<!--            <v-card-subtitle class="pa-0">{{SwapHint.gasDollar}} $</v-card-subtitle>-->
          </v-col>
        </v-row>
      </v-card>
      <!--            <v-row class="justify-center mt-5">-->
      <!--              <a @click="goPair" class="pa-1">view pair analytics</a>-->
      <!--            </v-row>-->

      <!-- 公用提示框     -->
      <v-snackbar
          v-model="SnackbarShow"
          :color="Snackbar.type"
      >
        {{ Snackbar.text }}

        <template v-slot:action="{ attrs }">
          <v-btn
              text
              v-bind="attrs"
              @click="SnackbarShow = false"
          >
            x
          </v-btn>
        </template>
      </v-snackbar>

    </v-col>
  </v-row>
</template>

<script>

import IrouterPath from '@/contract/router/interface'
import IErc20 from '@/contract/ERC20/interface'
import {Icontract, isStrEmpty} from '@/common'
import axios from 'axios'

export default {
  name: 'Swap',
  data: () => ({
    // 当前metamask对象
    pair: '',
    token0_value: '',
    token1_value: '',
    token_from_select: '',
    token_to_select: '',
    token_from_balance: '',
    token_to_balance: '',
    swapLoading: false,
    swapDisabled: false,
    routerContract: '',
    EthContract: '',
    tokenContract: '',
    token_from_error: false,
    token_from_errorMSG: '',
    defaultAccount: '',
    contrastTime: 0,
    balance: {ETH: {meta: 0, format: 0}, OPS: {meta: 0, format: 0}}, // 资产货币余额
    SwapHint:{forward:'0',backward:'0',gas:'0',gasDollar:'0.77'},
    SnackbarShow: false,
    Snackbar:{type:'success', text: 'ok'}, // 用于显示 公用提示信息 type=[info,success,warning,error]

  }),
  props: {
    dialog: {type: Boolean, default: false}
  },
  watch:{
    test: function (newValue, oldValue) {
      console.log(oldValue, newValue)
    }
  },
  created() {
    console.log('swap')
    // console.log('pair', this.$store.state.currentPair)
    // 默认 token_from为token0, token_to为token1, 可用于换位
    // this.token_from = this.$store.state.currentPair.token0
    // this.token_to = this.$store.state.currentPair.token1

    // 取token列表
    // this.tokenSymbolS = Icontract.getTokenSymbolArray(this.$store.state.defaultNetwork)

    // token选择框设置默认值
    this.token_from_select = 'ETH'
    this.token_to_select = 'OPS'

    this.contractInit()

  },
  methods: {

    // 时时循环更新 显示我的挖矿收益
    // forTime(){
    //   if (this.MineralInterval!==null){
    //     return
    //   }
    //   const endTime = '1632315600000'
    //   console.log('count time')
    //   this.MineralInterval = setInterval(async () => {
    //
    //     try {
    //
    //       let MinerCountRes = await axios.get('https://www.opswap.io/webapi/api/common/serverTime')
    //       let currTime = MinerCountRes.data
    //       let currTimeStamp = new Date(currTime).getTime()
    //       if (parseInt(currTimeStamp.toString()) < parseInt(endTime)) {
    //         this.showTime = currTime
    //         this.swapDisabled =  true
    //       } else {
    //         this.swapDisabled = false
    //         this.showTimeStatus = false
    //         clearInterval(this.MineralInterval)
    //       }
    //
    //     }
    //     catch (e) {
    //       console.log(e)
    //     }
    //
    //   }, 1000)
    // },

    // 在输入时做即时输出
    async fromInput() {

      if (isStrEmpty(this.token0_value)) {
        this.token1_value = ''
        this.swapDisabled = false
        this.token_from_error = false
        this.token_from_errorMSG = ''

        return
      }

      if (this.token0_value === 0 || this.token0_value === '0') {
        this.swapDisabled = false
        this.token_from_error = true
        this.token_from_errorMSG = this.$t('error.InvalidValue')
        this.token1_value = ''
        return
      } else {
        this.token_from_error = false
        this.token_from_errorMSG = ''
      }

      if (parseFloat(this.token0_value) > parseFloat(this.token_from_balance)) {
        this.swapDisabled = true
        this.token_from_error = true
        this.token_from_errorMSG = this.$t('error.OverBalance')
        return
      } else {
        this.swapDisabled = false
        this.token_from_error = false
        this.token_from_errorMSG = ''
      }

      if (this.token_from_select === this.token_to_select) {
        this.token_from_error = true
        this.token_from_errorMSG = this.$t('error.SameToken')
        return
      } else {
        this.token_from_error = false
        this.token_from_errorMSG = ''
      }

      let token_from_valueWei = window.web3js.utils.toWei(this.token0_value.toString())

      if (token_from_valueWei.toString() === '0') {
        this.swapDisabled = false
        this.token_from_error = true
        this.token_from_errorMSG = this.$t('error.InvalidValue')
        this.token1_value = ''
        return
      } else {
        this.token_from_error = false
        this.token_from_errorMSG = ''
      }

      // 计算交换值
      // 多次异步查询 需对比输入时间和输入值 避免延迟覆盖
      let amountOutRes = await this.AmountOut(token_from_valueWei)
      if (!isStrEmpty(amountOutRes) && BigInt(amountOutRes.time.toString()) > BigInt(this.contrastTime.toString()) && this.token0_value === window.web3js.utils.fromWei(amountOutRes.inValue)) {
        this.contrastTime = amountOutRes.time
        this.token1_value = amountOutRes.format
      } else {
        console.log('AmountOut', amountOutRes)
      }
    },
    async contractInit() {

      let net_version = await Icontract.checkMetaMask()

      if ( net_version === this.$store.state.defaultNetwork ) {

        let token_from = Icontract.getSelectToken(this.token_from_select, this.$store.state.defaultNetwork)
        let token_to = Icontract.getSelectToken(this.token_to_select, this.$store.state.defaultNetwork)

        // 多个代币需多个代币合约
        this.EthContract = IErc20.ABI.init(token_from.address)
        this.tokenContract = IErc20.ABI.init(token_to.address)

        // Iusdt.methods.init(this.$store.state.ContractAddress.USDT)
        IrouterPath.methods.init(this.$store.state.ContractAddress.router)

        this.defaultAccount = this.$store.state.metamask.account

        if (this.defaultAccount !== '') {
          this.updateDynamicData()
        }
      }
    },

    async getPair() {
      let token0 = Icontract.getSelectToken(this.token_from_select, this.$store.state.defaultNetwork)
      let token1 = Icontract.getSelectToken(this.token_to_select, this.$store.state.defaultNetwork)
      console.log('token01', token0, token1, isStrEmpty(token0))
      if (!isStrEmpty(token0) && !isStrEmpty(token1)) {
        let pairRes = await IrouterPath.methods.getPair(token0.address, token1.address)
        if (!isStrEmpty(pairRes)) {
          let pair = {}
          pair.pairAddress = pairRes
          pair.token0 = token0
          pair.token1 = token1
          // 本地存储以免页面刷新数据丢失
          localStorage.setItem('pair', JSON.stringify(pair))
          console.log('set pair', pair)

        } else {
          console.log('getPair error') // 失败
        }
      }
    },

    goFaucet() {
      this.$router.push('/Faucet')
    },

    goAbout() {
      this.$router.push('/about')
    },

    goPair() {
      this.getPair()
      this.$router.push('/pair')
    },

    fromChange() {
      console.log('token_from',this.token_from_select===this.token_to_select, this.token_from_select, this.token_to_select)

      // 根据所选token更新余额
      let token_from = Icontract.getSelectToken(this.token_from_select, this.$store.state.defaultNetwork)

      let that = this
      if (token_from.address !== '') {
        let balanceAddress = this.defaultAccount
        if (token_from.symbol === 'ETH') {

          Icontract.getBalanceOf(balanceAddress)
              .then(function (response) {
                that.token_from_balance = response.format.toString()
                that.balance.ETH.format = response.format
                that.balance.ETH.meta = response.meta
              })
        } else {
          // console.log('token_from.address', token_from.address, this.EthContract._address, this.tokenContract._address)
          if (token_from.address === this.tokenContract._address.toString()) {
            this.tokenContract.methods.balanceOf(balanceAddress).call()
                .then(function (response) {
                  let res = window.web3js.utils.fromWei(response.toString())
                  that.token_from_balance = Math.floor(res * 10000) / 10000

                  // that.$forceUpdate() // 用于对象内数据更新到界面
                })
                .catch(Error => {
                  console.log('tokenFrom error', token_from, Error)
                })
          }
        }
      }
    },

    toChange() {

      // 根据所选token更新余额
      let token_to = Icontract.getSelectToken(this.token_to_select, this.$store.state.defaultNetwork)

      let that = this
      if (token_to.address !== '') {
        let balanceAddress = this.defaultAccount
        if (token_to.symbol === 'ETH') {

          Icontract.getBalanceOf(balanceAddress)
              .then(function (response) {
                that.token_to_balance = response.format.toString()
                that.balance.OPS.format = response.format
                that.balance.OPS.meta = response.meta
              })
        } else {
          // console.log('token_from.address', token_from.address, this.EthContract._address, this.tokenContract._address)
          if (token_to.address === this.tokenContract._address.toString()) {
            this.tokenContract.methods.balanceOf(balanceAddress).call()
                .then(function (response) {
                  let res = window.web3js.utils.fromWei(response.toString())
                  that.token_to_balance = Math.floor(res * 10000) / 10000

                  // that.$forceUpdate() // 用于对象内数据更新到界面
                })
                .catch(Error => {
                  console.log('tokenFrom error', token_to, Error)
                })
          }
        }
      }

    },

    updateDynamicData() {
      console.log('updateDynamicData', this.defaultAccount)

      this.getSwapHint()

      let token_from = Icontract.getSelectToken(this.token_from_select, this.$store.state.defaultNetwork)
      let that = this
      if (token_from.address !== '') {
        let balanceAddress = this.defaultAccount
        if (token_from.symbol === 'ETH') {

          Icontract.getBalanceOf(balanceAddress)
              .then(function (response) {
                that.token_from_balance = response.format.toString()
                that.balance.ETH.format = response.format
                that.balance.ETH.meta = response.meta
              })
        } else {
          // console.log('token_from.address', token_from.address, this.EthContract._address, this.tokenContract._address)
          if (token_from.address === this.EthContract._address.toString()) {
            this.EthContract.methods.balanceOf(balanceAddress)
                .call()
                .then(function (response) {
                  let res = window.web3js.utils.fromWei(response.toString())
                  that.token_from_balance = Math.floor(res * 10000) / 10000

                  // that.$forceUpdate() // 用于对象内数据更新到界面
                })
                .catch(Error => {
                  console.log('tokenFrom error', token_from, Error)
                })
          }

          if (token_from.address === this.tokenContract._address.toString()) {
            this.tokenContract.methods.balanceOf(balanceAddress)
                .call()
                .then(function (response) {
                  let res = window.web3js.utils.fromWei(response.toString())
                  that.token_from_balance = Math.floor(res * 10000) / 10000
                })
          }
        }
      }

      let token_to = Icontract.getSelectToken(this.token_to_select, this.$store.state.defaultNetwork)

      if (token_to.address !== '') {
        let balanceAddress = this.defaultAccount
        if (token_to.symbol === 'ETH') {
          Icontract.getBalanceOf(balanceAddress)
              .then(function (response) {
                that.token_to_balance = response.format.toString()
                that.balance.ETH.format = response.format
                that.balance.ETH.meta = response.meta
              })
        } else {
          if (this.tokenContract._address === token_to.address) {
            this.tokenContract.methods.balanceOf(balanceAddress)
                .call()
                .then(function (response) {
                  let res = window.web3js.utils.fromWei(response.toString())
                  that.token_to_balance = Math.floor(res * 10000) / 10000

                  // that.$forceUpdate() // 用于对象内数据更新到界面
                })
                .catch(Error => {
                  console.log('tokenTo error', token_to, Error)
                })
          }

          if (this.EthContract._address === token_to.address) {
            this.EthContract.methods.balanceOf(balanceAddress)
                .call()
                .then(function (response) {
                  let res = window.web3js.utils.fromWei(response.toString())
                  that.token_to_balance = Math.floor(res * 10000) / 10000

                })
                .catch(Error => {
                  console.log('tokenTo error', token_to, Error)
                })
          }
        }
      }

      // 取当前配对token的储备量
      // if(token_from.address!=='' && token_to.address!=='') {
      //   IrouterPath.methods.getReserves(token_from.address, token_to.address)
      //       .then(function (response) {
      //         let token0_reserves = window.web3.utils.fromWei(response[0].toString())
      //         that.token_from_reserves = Math.floor(token0_reserves * 10000) / 10000
      //
      //         let token1_reserves = window.web3.utils.fromWei(response[1].toString())
      //         that.token_to_reserves = Math.floor(token1_reserves * 10000) / 10000
      //
      //       })
      //       .catch(Error => {
      //         console.log('getReserves error', token_from, token_to, Error)
      //       })
      // }

    },

    async test() {

      axios.get('https://opswap.io/webapi/api/common/getip')
          .then(res => {
            console.log('get ip server', res)
          })

      axios.defaults.baseURL = 'cityjson'
      axios.get('cityjson')
          .then(res => {
            console.log('get ip local', res)
          })

      // let url = 'https://api.coindog.com/api/v1/tick/HUOBIPRO:ETHUSDT?unit=usd'
      axios.defaults.baseURL = 'api'
      axios.get('api/v1/tick/HUOBIPRO:ETHUSDT?unit=usd')
          .then(res => {
            console.log('get price', res)
          })
    },

    async test2() {

      // eslint-disable-next-line no-undef
      console.log(returnCitySN['cip'], returnCitySN)

      // let url = 'https://api.coindog.com/api/v1/tick/HUOBIPRO:ETHUSDT?unit=usd'

      fetch('https://www.opswap.io/webapi/api/faucet')
          .then(response => {
            let result = response.json()
            result.then(res => {
              console.log('get result', res)
            })
          })
          .catch(err => {
            console.log('请求错误', err)
          })
    },

    async test3() {
      console.log('test3', this.$store.state.networkError, this.defaultAccount)
      if (this.$store.state.networkError) {
        this.$store.state.networkError=false
      } else {
        this.$store.state.networkError=true
      }
    },

    async test4() {

      let ss = await this.tokenContract.methods.balanceOf('0x5Fe1cCe9897Df484a918EA9446cec7D14dD96F2B').call()
      console.log('ss', ss)


    },

    // 下方交易提示信息
    async getSwapHint() {

      let token0 = Icontract.getSelectToken(this.token_from_select, this.$store.state.defaultNetwork)
      let token1 = Icontract.getSelectToken(this.token_to_select, this.$store.state.defaultNetwork)

      let pathForward = [token0.address, token1.address]
      let pathBackward = [token1.address, token0.address]
      // 确保以ETH在前为正向交换
      if (token0.symbol.indexOf('ETH') < 0) {
        pathForward = [token1.address, token0.address]
        pathBackward = [token0.address, token1.address]
      }
      let unit = '100000000000000000' // 0.1 eth wei
      let getAmountsOutForward = await IrouterPath.methods.getAmountsOut(unit, pathForward)
      let unitBackward = '1000000000000000000' // 1 OPS
      let getAmountsOutBackward = await IrouterPath.methods.getAmountsOut(unitBackward, pathBackward)

      if (!isStrEmpty(getAmountsOutForward) && !isStrEmpty(getAmountsOutBackward)) {
        this.SwapHint.forward = Math.floor(window.web3js.utils.fromWei(getAmountsOutForward[1].toString()) * 10000) / 10000
        this.SwapHint.backward = window.web3js.utils.fromWei(getAmountsOutBackward[1].toString())
      }
      // 根据当前行情取eth兑usdt汇率 计算Gas费
      // let rate = await this.$http.get('/api/v1/tick/HUOBIPRO:ETHUSDT?unit=usd')
      let gasPrice = await window.web3js.eth.getGasPrice()
      let gas = this.$store.state.gasDef.low * window.web3js.utils.fromWei(gasPrice.toString())
      this.SwapHint.gas= Math.floor(gas * 1000000) / 1000000
      // this.SwapHint.gasDollar =Math.floor( this.SwapHint.gas * rate.data.close * 100) / 100

    },

    /**
     * @dev 获取单个输出数额
     * @notice 给定一项资产的输入量和配对的储备，返回另一项资产的最大输出量
     */
    async AmountOut(inValue) {
      console.log('AmountOut in value', inValue)
      let _token0_address = Icontract.getSelectToken(this.token_from_select, this.$store.state.defaultNetwork).address
      let _token1_address = Icontract.getSelectToken(this.token_to_select, this.$store.state.defaultNetwork).address

      let that = this
      let dateNow = new Date()
      return new Promise((resolve) => {
        IrouterPath.methods.getReserves(_token0_address, _token1_address)
            .then(function (response1) {
              let token0_reserves = response1[0].toString()
              let token1_reserves = response1[1].toString()

              if (token0_reserves>0 && token1_reserves>0) {

                IrouterPath.methods.getAmountOut(inValue.toString(), token0_reserves.toString(), token1_reserves.toString())
                    .then(function (response2) {

                      if (isStrEmpty(response2)) {
                        resolve('')
                      } else {

                        let res = window.web3js.utils.fromWei(response2.toString())
                        let amountOut = Math.floor(res * 10000) / 10000

                        resolve({
                          time: dateNow.getTime(),
                          inValue: inValue,
                          meta: response2.toString(),
                          format: amountOut
                        })

                      }
                    })
              } else {
                resolve('')
                alert(that.token_from_select + '-' + that.token_to_select + ' ' + that.$t('error.NotLiquidity'))
              }
            })
            .catch(Error1 => {
              alert(that.token_from_select + '-' + that.token_to_select + that.$t('error.NotPair'))
              console.log('getReserves error', Error1)
              resolve('')
            })
      })
    },

    swapPosition() {
      // 交换symbol
      let res0symbol = this.token_from_select
      let res1symbol = this.token_to_select
      this.token_from_select = res1symbol
      this.token_to_select = res0symbol

      // 交换balance
      let res0balance = this.token_from_balance
      let res1balance = this.token_to_balance
      this.token_from_balance = res1balance
      this.token_to_balance = res0balance

      // 清理输入数据
      this.token0_value = ''
      this.token1_value = ''
    },

    swap() {

      if (this.token_from_select === this.token_to_select) {
        this.SnackbarShow = true
        this.Snackbar.type = this.$store.state.myColor.error
        this.Snackbar.text = this.$t('error.SameToken')
        return
      }

      if (isStrEmpty(this.token0_value)) {
        return
      }

      if (typeof (this.token0_value === null || this.token0_value) === 'undefined' || this.token0_value === '0' || this.token0_value === 0) {
        console.log('invalid token value')
        return
      }

      if (this.balance.ETH.format === 0 || this.balance.ETH.format==='0') {
        this.token_from_error = true
        this.token_from_errorMSG = this.$t('error.NotETHBalance')
        return
      }

      if (this.token_from_select === this.token_to_select) {
        this.token_from_error = true
        this.token_from_errorMSG = this.$t('error.SameToken')
        return
      }

      if (parseFloat(this.token0_value) > parseFloat(this.token_from_balance)) {
        this.token_from_error = true
        this.token_from_errorMSG = this.$t('error.OverBalance')
        this.swapDisabled = true
        return
      } else {
        this.token_from_error = false
        this.token_from_errorMSG = ''
        this.swapDisabled = false
      }

      if (this.token_from_select === 'ETH') {
        // eth->token
        this.swapExactETHForTokens()
      } else {
        if (this.token_to_select === 'ETH') {
          // token->eth
          this.swapExactTokensForETH()
        } else {
          // 都没有eth则为token换token
          this.swapExactTokensForTokens()
        }
      }
    },

    /**
     * @dev 根据精确的ETH交换尽量多的token
     */
    swapExactETHForTokens() {
      console.log('swapExactETHForTokens ETH->OPS')
      let token0_value = this.token0_value // from value
      if (token0_value === null || typeof (token0_value) === 'undefined' || token0_value === '' || token0_value === '0' || token0_value === 0) {
        this.token_from_error = true
        this.token_from_errorMSG = this.$t('error.InvalidValue')
        return
      }

      if (parseFloat(token0_value) > parseFloat(this.token_from_balance)) {
        this.token_from_error = true
        this.token_from_errorMSG = this.$t('error.OverBalance')
        return
      }

      let ethItem = Icontract.getSelectToken(this.token_from_select, this.$store.state.defaultNetwork)
      let tokenItem = Icontract.getSelectToken(this.token_to_select, this.$store.state.defaultNetwork)

      let swapValueWei = window.web3js.utils.toWei(token0_value)
      let amountOutMin = '0'
      let swapPath = [ethItem.address, tokenItem.address]
      let swapTo = this.defaultAccount

      // console.log('swapExactETHForTokens eth->usdt', amountOutMin, swapPath, swapTo, token0_value, swapValueWei)

      this.swapLoading = true
      this.swapDisabled = true
      IrouterPath.methods.swapExactETHForTokens(this.defaultAccount, amountOutMin, swapPath, swapTo, swapValueWei)
          .then(response => {
            console.log('swapExactETHForTokens response', response)
            // 判断状态必须
            if (response) {
              this.SnackbarShow = true
              this.Snackbar.type = this.$store.state.myColor.success
              this.Snackbar.text = 'success'
              this.updateDynamicData()
            }
            this.swapLoading = false
            this.swapDisabled = false
          })
          .catch(error => {
            console.log({error: error})
            this.SnackbarShow = true
            this.Snackbar.type = this.$store.state.myColor.error
            this.Snackbar.text = 'error'
            this.swapLoading = false
            this.swapDisabled = false
          })
    },

    async swapExactTokensForETH2() {
      console.log('swapExactTokensForETH', this.token0_value)
      let token0_value = this.token0_value.toString()
      if (typeof (token0_value) === 'undefined' || token0_value === '' || token0_value === '0' || token0_value === 0) {
        this.token_from_error = true
        this.token_from_errorMSG = this.$t('error.InvalidValue')
        return
      }

      if (token0_value > this.token_from_balance) {
        this.token_from_error = true
        this.token_from_errorMSG = this.$t('error.OverBalance')
        return
      }

      let tokenItem = Icontract.getSelectToken(this.token_from_select, this.$store.state.defaultNetwork)
      let ethItem = Icontract.getSelectToken(this.token_to_select, this.$store.state.defaultNetwork)

      let inputWei = window.web3js.utils.toWei(token0_value)
      let amountOutMin = '0'
      let swapPath = [tokenItem.address, ethItem.address]
      let swapTo = this.defaultAccount

      console.log('swapExactTokensForETH', inputWei, amountOutMin, swapPath, swapTo)

      this.swapLoading = true
      this.swapDisabled = true

      let myAllowance = await this.tokenContract.methods.allowance(this.defaultAccount, this.$store.state.ContractAddress.router).call()
      console.log('allowance', myAllowance.toString())
      if (myAllowance === 'error') {
        alert(this.$t('error.NetworkError'))
        return false
      }

      // 没有批准额度则先批准再还款
      if (myAllowance === null || myAllowance === 0 || myAllowance === '0' || BigInt(myAllowance) ===0n) {

        let approveRes = await this.tokenContract.methods.approve(this.$store.state.ContractAddress.router, inputWei).send({from: this.defaultAccount})
        console.log('approve', approveRes)
        if (approveRes) {
          let swapRes = await IrouterPath.methods.swapExactTokensForETH(this.defaultAccount, inputWei, amountOutMin, swapPath, swapTo)
          if (swapRes) {
            this.updateDynamicData()
          }
        }

      } else {
        if (BigInt(myAllowance) >= BigInt(inputWei)) {
          let swapRes = await IrouterPath.methods.swapExactTokensForETH(this.defaultAccount, inputWei, amountOutMin, swapPath, swapTo)
          if (swapRes) {
            this.updateDynamicData()
          }
        } else {
          // let res = window.web3.utils.fromWei(myAllowance.toString())
          // 重置approve
          if (confirm(this.$t('long.ResetApprove').toString())) {
            let approveRes = await this.tokenContract.methods.approve(this.$store.state.ContractAddress.router, '0').call()
            if (approveRes){
              alert(this.$t('long.ReSetDone'))
            }
          }
        }
      }

      this.swapLoading = false
      this.swapDisabled = false

    },

    /**
     * @dev 根据精确的token交换尽量多的ETH
     */
    async swapExactTokensForETH() {
      console.log('swapExactTokensForETH', this.token0_value)
      let token0_value = this.token0_value.toString()
      if (typeof (token0_value) === 'undefined' || token0_value === '' || token0_value === '0' || token0_value === 0) {
        this.token_from_error = true
        this.token_from_errorMSG = this.$t('error.InvalidValue')
        return
      }

      if (parseFloat(token0_value) > parseFloat(this.token_from_balance)) {
        this.token_from_error = true
        this.token_from_errorMSG = this.$t('error.OverBalance')
        return
      }

      let tokenItem = Icontract.getSelectToken(this.token_from_select, this.$store.state.defaultNetwork)
      let ethItem = Icontract.getSelectToken(this.token_to_select, this.$store.state.defaultNetwork)

      let inputWei = window.web3js.utils.toWei(token0_value)
      let amountOutMin = '0'
      let swapPath = [tokenItem.address, ethItem.address]
      let swapTo = this.defaultAccount

      // console.log('swapExactTokensForETH', inputWei, amountOutMin, swapPath, swapTo)

      this.swapLoading = true
      this.swapDisabled = true

      let myAllowance = await this.tokenContract.methods.allowance(this.defaultAccount, this.$store.state.ContractAddress.router).call()
      console.log('allowance', myAllowance.toString())
      if (myAllowance === 'error') {
        alert(this.$t('error.NetworkError'))
        return false
      }

      let approveRes = false
      // 没有批准额度则先批准再还款
      if (myAllowance === null || myAllowance === 0 || myAllowance === '0' || BigInt(myAllowance) ===0n) {
        // 一次受权总量 避免多次受权的GAS费
        let tokenSupply = await this.tokenContract.methods.totalSupply().call()
        approveRes = await this.tokenContract.methods.approve(this.$store.state.ContractAddress.router, tokenSupply).send({from: this.defaultAccount}).catch(error=>{
          console.log('approve1 error', error)
          this.swapLoading = false
          this.swapDisabled = false
          return false
        })

      } else {

        if (BigInt(myAllowance) < BigInt(inputWei)) {
          let approveClear = await this.tokenContract.methods.approve(this.$store.state.ContractAddress.router, '0').send({from: this.defaultAccount}).catch(error=>{
            console.log('approve clear error', error)
            this.swapLoading = false
            this.swapDisabled = false
            return false
          })
          console.log('approve clear', approveClear)
          if (approveClear) {
            // 一次受权批准最大量 避免多次受权的GAS费
            let tokenSupply = await this.tokenContract.methods.totalSupply().call()
            approveRes = await this.tokenContract.methods.approve(this.$store.state.ContractAddress.router, tokenSupply).send({from: this.defaultAccount}).catch(error=>{
              console.log('approve2 clear error', error)
              this.swapLoading = false
              this.swapDisabled = false
              return false
            })

          }
        }
      }

      if (BigInt(myAllowance) >= BigInt(inputWei) || approveRes) {
        let swapRes = await IrouterPath.methods.swapExactTokensForETH(this.defaultAccount, inputWei, amountOutMin, swapPath, swapTo)
        if (swapRes) {
          this.SnackbarShow = true
          this.Snackbar.type = this.$store.state.myColor.success
          this.Snackbar.text = 'success'
          this.updateDynamicData()
        } else {
          this.SnackbarShow = true
          this.Snackbar.type = this.$store.state.myColor.error
          this.Snackbar.text = 'error'
        }
      }

      this.swapLoading = false
      this.swapDisabled = false

    },

    /**
     * @dev 根据精确的token交换尽量多的token
     */
    swapExactTokensForTokens() {

    },

    /**
     * @dev 使用尽量少的token交换精确的token
     */
    swapTokensForExactTokens() {

    }
  }
}
</script>

<style scoped>
.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}
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

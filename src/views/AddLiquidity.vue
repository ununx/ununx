<template>
  <v-row justify="center">
          <v-col class="mx-1">
<!--            <v-row class="mt-3">-->
<!--&lt;!&ndash;              <v-col class="text-subtitle-1 px-0">{{ $t('web.AddLiquidity') }}</v-col>&ndash;&gt;-->
<!--              <v-spacer/>-->
<!--              <v-col>-->
<!--              <v-btn block outlined class="blue&#45;&#45;text" @click="goAddLoanLiquidity" >{{$t('web.ContractLiquidity')}}-->
<!--                <v-icon>mdi-cash-multiple</v-icon>-->
<!--              </v-btn>-->
<!--              </v-col>-->
<!--            </v-row>-->

<!--            <v-tabs-->
<!--                v-model="tab"-->
<!--                fixed-tabs-->
<!--                class="mt-3"-->
<!--            >-->
<!--              <v-tabs-slider color="blue"></v-tabs-slider>-->
<!--              <v-tab>-->
<!--                {{$t('web.SwapLiquidity')}}-->
<!--              </v-tab>-->
<!--              <v-tab @click="tabClick">-->
<!--                {{$t('web.ContractLiquidity')}}-->
<!--              </v-tab>-->
<!--            </v-tabs>-->

            <v-row class="mt-9">
              <h5 class="font-weight-medium">{{$t('web.SwapLiquidity')}} {{token0_select}}: {{Math.floor(token0_reserves * 10000) / 10000}}</h5>
              <h5 class="font-weight-medium ml-5">{{token1_select}}: {{Math.floor(token1_reserves * 10000) / 10000}}</h5>
            </v-row>
            <v-row class="mt-5 align-center">
              <h5 class="font-weight-medium">{{$t('web.MyRate')}}: </h5>
              <h3 class="blue--text font-weight-light ml-2">{{ Math.floor(pairLiquidity.myRate * 100000000) / 1000000}}%</h3>
              <h5 class="blue--text font-weight-light ml-2">OPL:{{ Math.floor(strSubFromWei(pairLiquidity.myBalance) * 10000) / 10000}}</h5>

              <v-btn text class="blue--text text-caption" @click="showRemoveLiquidity">{{ $t('web.Withdraw') }}</v-btn>
            </v-row>

            <v-row class="mt-9">
              <v-col class="pl-0 pr-0">
                <v-row class="justify-end mr-1 text-caption">{{$t('web.Balance')}}: {{token0_balance}}</v-row>
                <v-row>
                  <v-col cols="8" class="pr-0">
                    <v-text-field
                        v-model="token0_value"
                        label="Input"
                        placeholder="0.0"
                        :error="token0_input_error"
                        :error-messages="token0_input_errorMSG"
                        @input="inputChange"
                        type="number"
                        outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4" class="pl-0">
                    <v-combobox
                        class="shrink"
                        v-model="token0_select"
                        :items="$store.state.PairSymbolArray"
                        @change="combobox0Change"
                        label="token"
                        outlined
                    ></v-combobox>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row class="justify-center mb-5">
              <v-icon large color="blue" :disabled="addDisabled">vertical_align_center</v-icon>
              <!--<v-icon @click="AmountOut" class="mt-0 pt-0" large color="blue">arrow_downward</v-icon>-->
            </v-row>
            <v-row>

              <v-col class="pl-0 pr-0">
                <v-row class="justify-end mr-1 text-caption">{{$t('web.Balance')}} {{token1_balance}}</v-row>
                <v-row>
                  <v-col cols="8" class="pr-0">
                    <v-text-field
                        v-model="token1_value"
                        :error="token1_input_error"
                        :error-messages="token1_input_errorMSG"
                        @input="inputToken1Change"
                        label="Input"
                        placeholder="0.0"
                        type="number"
                        outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4" class="pl-0">
                    <v-combobox
                        class="shrink"
                        v-model="token1_select"
                        :items="$store.state.PairSymbolArray"
                        @change="combobox1Change"
                        label="token"
                        outlined
                    ></v-combobox>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row class="mt-3">
              <v-btn block class="white--text" color="blue" :loading="addLoading" :disabled="addDisabled" @click="add_liquidity">{{$t('web.AddLiquidity')}}</v-btn>
            </v-row>
<!--            <v-row class="mt-9">-->
<!--              <span>⭐️ By adding liquidity you'll earn 0.3% of all trades on this pair proportional to your share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.</span>-->
<!--            </v-row>-->

<!--            <v-row class="justify-center mt-5">-->
<!--              <a @click="goPair" class="pa-1">view pair analytics</a>-->
<!--            </v-row>-->

            <v-col class="mt-9 green--text pa-0">
              <h5>{{$t('long.AddLiquidityHint1')}}</h5>
              <h5>{{$t('long.AddLiquidityHint2')}}</h5>
            </v-col>

          </v-col>


    <v-dialog
        v-model="removeLiquidityDialog.show"
        persistent
        max-width="35rem"
    >
      <v-card>
        <v-card-title class="pl-2 pr-1">
          <span class="headline">{{$t('web.Withdraw')}}</span>
          <v-spacer/>
          <v-btn @click="dialogClose" :disabled="removeLiquidityDialog.disabled" icon>
            <v-icon color="blue">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row class="mt-2">{{ $t('web.MyRate') }}: {{ Math.floor(pairLiquidity.myRate * 100000000) / 1000000}}%</v-row>
          <v-row class="mt-2">{{ $t('web.MyDeposit') }} OPL: {{Math.floor(strSubFromWei(pairLiquidity.myBalance) * 10000) / 10000}}
            {{ $t('web.Withdraw') }}: {{Math.floor(strSubFromWei(rateSlider.withdrawLiquidity) * 10000) /10000}}</v-row>
          <v-row class="mt-5 blue--text text-h6 font-weight-light">ETH:{{Math.floor(rateSlider.withdrawA * 10000) / 10000}} OPS:{{Math.floor(rateSlider.withdrawB * 10000) / 10000}}</v-row>

          <v-row class="mt-9 mb-9 text-h2 justify-center font-weight-light">{{rateSlider.val}}%</v-row>
<!--          <v-row class="mt-9">-->
<!--            <v-text-field-->
<!--                v-model="removeLiquidityDialog.inputValue"-->
<!--                placeholder="0.0"-->
<!--                :error="removeLiquidityDialog.inputError"-->
<!--                :error-messages="removeLiquidityDialog.inputErrorMsg"-->
<!--                @input="dialogInputCheck"-->
<!--                type="number"-->
<!--                outlined-->
<!--            ></v-text-field>-->
<!--          </v-row>-->

          <v-slider
              v-model="rateSlider.val"
              thumb-color="blue"
              thumb-label="always"
              @input="sliderInput"
              :disabled="rateSlider.disabled"
              :error="rateSlider.error"
              :error-messages="rateSlider.errorMessages"
              class="mt-9"
          ></v-slider>

          <v-row>
            <v-btn-toggle
                v-model="btnToggleValue"
                @change="btnToggleChange"
                tile
                color="deep-purple accent-3"
                group
            >
              <v-btn value="0">
                0%
              </v-btn>
              <v-btn value="25">
                25%
              </v-btn>

              <v-btn value="50">
                50%
              </v-btn>

              <v-btn value="75">
                75%
              </v-btn>

              <v-btn value="100">
                100%
              </v-btn>
            </v-btn-toggle>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-btn block class="mb-12 white--text" color="blue" :loading="removeLiquidityDialog.loading" :disabled="removeLiquidityDialog.disabled" @click="removeLiquidity">{{$t('web.Confirm')}}
          </v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>

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

  </v-row>
</template>

<script>
import IrouterPath from '@/contract/router/interface'
import Ierc20 from '@/contract/ERC20/interface'
import Ipair from '@/contract/pair/interface'
import {Icontract, isStrEmpty, strFromWei} from "@/common"

export default {
  name: 'AddLiquidity',
  data: () => ({
    tab: null,
    pair: '',
    token0_value: '',
    token1_value: '',
    token0_select: '',
    token1_select: '',
    token0_balance: '',
    token1_balance: '',
    token0Contract: '',
    token1Contract: '',
    addLoading: false,
    addDisabled: false,
    token0_input_error: false,
    token0_input_errorMSG: '',
    token1_input_error: false,
    token1_input_errorMSG: '',
    defaultAccount: '',
    token0_reserves: '',
    token1_reserves: '',
    contrastTime: '',
    btnToggleValue: '0',
    pairLiquidity: {reserveA: 0, reserveB: 0, TotalSupply: 0, myBalance: 0, myRate: 0}, // 我添加的流动性及总量占比
    removeLiquidityDialog: {show:false, inputValue:'', inputError:false, inputErrorMsg:'', loading:false, disabled:false}, // 显示输入框
    rateSlider: {val: 0, disabled: false, withdrawLiquidity:0, withdrawA:0, withdrawB:0},
    SnackbarShow: false,
    Snackbar:{type:'success', text: 'ok'}, // 用于显示 公用提示信息 type=[info,success,warning,error]
  }),
  props: {
    dialog: {type: Boolean, default: false}
  },

  computed: {
    strSubFromWei() {
      return function (value) {
        let ss = strFromWei(value)
        // console.log('strSubFromWei', value, ss)
        return ss
      }
    }
  },
  mounted() {
    console.log('bonus')
    // console.log('pair', this.$store.state.currentPair)
    // 默认 token_from为token0, token_to为token1, 可用于换位
    // this.token_from = this.$store.state.currentPair.token0
    // this.token_to = this.$store.state.currentPair.token1

    // arbitrum test v3 id: 79377087078960
    // 取token列表
    // this.tokenSymbolS = Icontract.getTokenSymbolArray(this.$store.state.defaultNetwork)

    // token选择框设置默认值
    this.token0_select = 'ETH'
    this.token1_select = 'OPS'

    this.contractInit()
  },
  methods: {

    dialogClose() {
      this.removeLiquidityDialog.show=false
      console.log('dialogClose',this.removeLiquidityDialog.show)
    },

    dialogInputCheck() {
      if (isStrEmpty(this.removeLiquidityDialog.inputValue) || this.removeLiquidityDialog.inputValue <= 0) {
        this.removeLiquidityDialog.inputError = true
        this.removeLiquidityDialog.inputErrorMsg = this.$t('error.InvalidValue')
        return
      }

      if (isStrEmpty(this.pairLiquidity.myBalance === 0)) {
        this.removeLiquidityDialog.inputError = true
        this.removeLiquidityDialog.inputErrorMsg = this.$t('error.OverBalance')
        return
      }

      if (parseFloat(this.removeLiquidityDialog.inputValue) > parseFloat(this.pairLiquidity.myBalance)) {
        this.removeLiquidityDialog.inputError = true
        this.removeLiquidityDialog.inputErrorMsg = this.$t('error.OverBalance')
      } else {
        this.removeLiquidityDialog.inputError = false
        this.removeLiquidityDialog.inputErrorMsg = ''
      }
    },

    combobox0Change() {
      // 根据所选token更新余额
      let token0 = Icontract.getSelectToken(this.token0_select, this.$store.state.defaultNetwork)
      if (token0.address !== '') {
        let balanceAddress = this.defaultAccount
        if (token0.symbol === 'ETH') {

          Icontract.getBalanceOf(balanceAddress)
              .then(response=> {
                this.token0_balance = response.format
              })
        } else {

          if (token0.address === this.token1Contract._address.toString()) {
            this.token1Contract.methods.balanceOf(balanceAddress).call()
                .then(response=> {
                  let res = window.web3js.utils.fromWei(response.toString())
                  this.token0_balance = Math.floor(res * 10000) / 10000

                  // that.$forceUpdate() // 用于对象内数据更新到界面
                })
                .catch(Error => {
                  console.log('tokenFrom error', token0, Error)
                })
          }
        }
      }
    },

    combobox1Change() {
      // 根据所选token更新余额
      let token1 = Icontract.getSelectToken(this.token1_select, this.$store.state.defaultNetwork)
      if (token1.address !== '') {
        let balanceAddress = this.defaultAccount
        if (token1.symbol === 'ETH') {

          Icontract.getBalanceOf(balanceAddress)
              .then(response=> {
                this.token1_balance = response.format
              })
        } else {

          if (token1.address === this.token1Contract._address.toString()) {
            this.token1Contract.methods.balanceOf(balanceAddress).call()
                .then(response=> {
                  let res = window.web3js.utils.fromWei(response.toString())
                  this.token1_balance = Math.floor(res * 10000) / 10000

                  // that.$forceUpdate() // 用于对象内数据更新到界面
                })
                .catch(Error => {
                  console.log('tokenFrom error', token1, Error)
                })
          }
        }
      }
    },

    // 对话框确认按钮
    async removeLiquidity() {

      let token = this.token1Contract._address
      let to = this.defaultAccount
      let liquidity = this.rateSlider.withdrawLiquidity.toString()

      if (isStrEmpty(liquidity) || liquidity === '0') {

        this.SnackbarShow = true
        this.Snackbar.type = this.$store.state.myColor.error
        this.Snackbar.text = 'invalid liquidity rate'
        return

      }

      let pairAllowance = await Ipair.ABI.allowance(this.defaultAccount, this.$store.state.ContractAddress.router)
      console.log('Allowance', pairAllowance)

      this.removeLiquidityDialog.loading = true
      this.removeLiquidityDialog.disabled = true
      this.rateSlider.disabled = true
      let approveRes = false
      // 检查allowance 没有批准额度则先批准再还款
      if (isStrEmpty(pairAllowance) || pairAllowance === 0 || pairAllowance === '0' || BigInt(pairAllowance) === 0n) {
        // 无批准额度则先批准
        // 一次受权批准最大量 避免多次受权的GAS费
        approveRes = await Ipair.ABI.approve(this.defaultAccount, this.$store.state.ContractAddress.router, this.$store.state.approveTotal)

      } else {

        if (BigInt(pairAllowance) < BigInt(liquidity)) {
          console.log('allowance <')

          // 重置approve
          let approveClear = await Ipair.ABI.approve(this.defaultAccount, this.$store.state.ContractAddress.router, '0')
          console.log('approve clear', approveClear)
          if (approveClear) {
            approveRes = await Ipair.ABI.approve(this.defaultAccount, this.$store.state.ContractAddress.router, this.$store.state.approveTotal)
          }
        }
      }

      // 移除
      if (BigInt(liquidity) > 0 && (BigInt(pairAllowance) >= BigInt(liquidity) || approveRes)) {
        let removeLiquidityETHRes = await IrouterPath.methods.removeLiquidityETH(to, token, liquidity, '0', '0', to)

        if (removeLiquidityETHRes) {
          console.log('removeLiquidity res', removeLiquidityETHRes)
          this.removeLiquidityDialog.show = false
          this.SnackbarShow = true
          this.Snackbar.type = this.$store.state.myColor.success
          this.Snackbar.text = 'withdraw liquidity ' + this.rateSlider.val + '%'
          await this.updateDynamicData()
        } else {
          console.log('removeLiquidity res error', removeLiquidityETHRes)
          this.SnackbarShow = true
          this.Snackbar.type = this.$store.state.myColor.error
          this.Snackbar.text = 'withdraw error '
        }
      }

      this.removeLiquidityDialog.loading = false
      this.removeLiquidityDialog.disabled = false
      this.rateSlider.disabled = false

    },

    // 对话框确认按钮
    async removeLiquidity2() {

      let token = this.token0Contract._address
      let to = this.defaultAccount
      let liquidity = this.rateSlider.withdrawLiquidity.toString()

      if (isStrEmpty(liquidity) || liquidity === '0') {

        this.SnackbarShow = true
        this.Snackbar.type = this.$store.state.myColor.error
        this.Snackbar.text = 'invalid liquidity rate'
        console.log('invalie', liquidity)
        return
      }

      let pairAllowance = await Ipair.ABI.allowance(this.defaultAccount, this.$store.state.ContractAddress.router)
      console.log('Allowance', pairAllowance, liquidity, this.rateSlider)

      this.removeLiquidityDialog.loading = true
      this.removeLiquidityDialog.disabled = true
      this.rateSlider.disabled = true
      let pairApprove = ''
      // 检查allowance 没有批准额度则先批准再还款
      if (isStrEmpty(pairAllowance) || pairAllowance === 0 || pairAllowance === '0' || BigInt(pairAllowance) === 0n) {
        // 无批准额度则先批准
        pairApprove = await Ipair.ABI.approve(this.defaultAccount, this.$store.state.ContractAddress.router, liquidity)

      } else {

        if (BigInt(pairAllowance) < BigInt(liquidity)) {
          console.log('allowance <')

          // 重置approve
          if (confirm(this.$t('long.ResetApprove').toString())) {

            let approveRes = await Ipair.ABI.approve(this.defaultAccount, this.$store.state.ContractAddress.router, '0')

            if (isStrEmpty(approveRes)) {
              console.log('allowance reset error', approveRes)
            } else {
              alert(this.$t('long.ReSetDone'))
            }

            this.addLoading = false
            this.addDisabled = false

          }
        }
      }

      console.log('removeLiquidityETH pm', liquidity,pairAllowance,pairApprove)
      // 移除
      if (BigInt(liquidity)>0 && (BigInt(pairAllowance) >= BigInt(liquidity) || !isStrEmpty(pairApprove))) {
        let removeLiquidityETHRes = await IrouterPath.methods.removeLiquidityETH(to, token, liquidity, '0', '0', to)

        if (removeLiquidityETHRes) {
          console.log('removeLiquidity res', removeLiquidityETHRes)
          this.removeLiquidityDialog.show = false
          this.SnackbarShow = true
          this.Snackbar.type = this.$store.state.myColor.success
          this.Snackbar.text = 'withdraw liquidity ' + this.rateSlider.val + '%'
          await this.updateDynamicData()
        } else {
          console.log('removeLiquidity res error', removeLiquidityETHRes)
          this.SnackbarShow = true
          this.Snackbar.type = this.$store.state.myColor.error
          this.Snackbar.text = 'withdraw error '
        }
      }

      this.removeLiquidityDialog.loading = false
      this.removeLiquidityDialog.disabled = false
      this.rateSlider.disabled = false

    },

    // 在输入时做即时输出
    async inputChange() {

      if (isStrEmpty(this.token0_value)) {

        this.token0_input_error = false
        this.token0_input_errorMSG = ''
        return
      }

      if (this.token0_value === 0 || this.token0_value === '0') {
        this.token0_input_error = true
        this.token0_input_errorMSG = 'invalid input value'
        this.token1_value = ''
        return
      } else {
        this.token0_input_error = false
        this.token0_input_errorMSG = ''
      }

      let token0_valueWei = window.web3js.utils.toWei(this.token0_value) // from value
      if (token0_valueWei.toString() === '0') {
        this.token0_input_error = true
        this.token0_input_errorMSG = 'invalid input value'
        this.token1_value = ''
        return
      } else {
        this.token0_input_error = false
        this.token0_input_errorMSG = ''
      }

      if (parseFloat(window.web3js.utils.fromWei(token0_valueWei)) > parseFloat(this.token0_balance)) {
        this.token0_input_error = true
        this.token0_input_errorMSG = 'over token balance'
        this.addDisabled = true
        return
      } else {
        this.addDisabled = false
        this.token0_input_error = false
        this.token0_input_errorMSG = ''

      }

      // 多次异步查询 需对比输入时间和输入值 避免延迟覆盖
      let quoteRes = await this.quote(token0_valueWei)
      if (BigInt(quoteRes.time) > BigInt(this.contrastTime) && this.token0_value === window.web3js.utils.fromWei(quoteRes.inValue)) {
        this.contrastTime = quoteRes.time
        this.token1_value = quoteRes.format

        if (parseFloat(this.token1_value) > parseFloat(this.token1_balance)) {
          this.token1_input_error = true
          this.token1_input_errorMSG = 'over balance'
          this.addDisabled = true
        } else {
          this.token1_input_error = false
          this.token1_input_errorMSG = ''
          this.addDisabled = false
        }

      }
    },

    // 在输入时做即时输出
    async inputToken1Change() {
      if (parseFloat(this.token1_value) > parseFloat(this.token1_balance)) {
        this.token1_input_error = true
        this.token1_input_errorMSG = 'over balance'
        this.addDisabled = true
      } else {
        this.token1_input_error = false
        this.token1_input_errorMSG = ''
        this.addDisabled = false
      }
    },

    sliderInput() {
      let rate = this.rateSlider.val / 100
      this.rateSlider.withdrawLiquidity = BigInt(this.pairLiquidity.myBalance) * BigInt(this.rateSlider.val) / 100n
      this.rateSlider.withdrawA = (this.pairLiquidity.reserveA * this.pairLiquidity.myRate) * rate
      this.rateSlider.withdrawB = (this.pairLiquidity.reserveB * this.pairLiquidity.myRate) * rate
    },

    btnToggleChange() {
      this.rateSlider.val = this.btnToggleValue
    },

    showRemoveLiquidity(){
      this.removeLiquidityDialog.show = true
    },

    async test1() {
      // 30376986861375011777
      // let pair = '0xbE622d93cB0F73D4115636b5595A17c20DA42198'
      let router = this.$store.state.ContractAddress.router
      // //
      // let pairContract = Ipair.ABI.init(pair)
      // console.log('pair contract', pairContract, this.token0Contract)

      let approveQty = '9990000000000000'

      // let pairApprove = await pairContract.methods.approve(roter, approveQty).send({from: this.defaultAccount})
      // console.log('pairApprove', pairApprove)

      let pairApprove = await Ipair.ABI.approve(this.defaultAccount, router, approveQty)
      console.log('pairApprove', pairApprove)
    },

    async balance() {
      // 30376986861375011777
      // let testRouterAddress = '0x5dab8f527Ff0C6b339419B50EA55e6d3C174C23E'

      let roter = this.$store.state.ContractAddress.router

      let pairTotalSupply = await Ipair.ABI.totalSupply()
      console.log('pairTotalSupply', window.web3js.utils.fromWei(pairTotalSupply))

      let myLiquidity = await Ipair.ABI.balanceOf(this.defaultAccount)
      console.log('my Liquidity', window.web3js.utils.fromWei(myLiquidity))

      let roterAllowance = await Ipair.ABI.allowance(this.defaultAccount, roter)
      console.log('Allowance', roterAllowance)
    },

    async remove() {
      // 30376986861375011777
      // let testRouterAddress = '0x5dab8f527Ff0C6b339419B50EA55e6d3C174C23E'
      let usdt = '0x31A3cfF867E70fC8D62776F5258896B08B9c2080'
      let qty = '90000000000000'

      // let approveQty = '990000000000000'

      let removeLiquidityETH = await IrouterPath.methods.removeLiquidityETH(this.defaultAccount,usdt,qty,'0','0',this.defaultAccount)
      console.log('removeLiquidityETH', removeLiquidityETH)

    },

    async getMyRate() {

      let pairTotalSupplyByRouter = await Ipair.ABI.totalSupply() // 当前交易对流动性凭证总量
      let UserLiquidity = await Ipair.ABI.balanceOf(this.defaultAccount) // 我的流动性凭证数量
      let rate = UserLiquidity / pairTotalSupplyByRouter
      let rate2 = Math.floor(rate.toString() * 1000000) / 1000000

      // let balance0 = (this.token0_reserves * UserLiquidity) / pairTotalSupplyByRouter
      // let balance1 = (this.token1_reserves * UserLiquidity) / pairTotalSupplyByRouter

      this.pairLiquidity = {reserveA: this.token0_reserves, reserveB: this.token1_reserves, myBalance: UserLiquidity, myRate: rate, TotalSupply: pairTotalSupplyByRouter}
      // console.log('pairLiquidity ', this.pairLiquidity)
      return rate2

    },

    quote(inValue) {
      let token0 = Icontract.getSelectToken(this.token0_select, this.$store.state.defaultNetwork)
      let token1 = Icontract.getSelectToken(this.token1_select, this.$store.state.defaultNetwork)
      let dateNow = new Date()
      let that = this
      return new Promise((resolve) => {
        IrouterPath.methods.getReserves(token0.address, token1.address)
            .then(function (response1) {

              let token0_reserves = response1[0].toString()
              let token1_reserves = response1[1].toString()

              if (token0_reserves>0 && token1_reserves>0) {

                IrouterPath.methods.quote(inValue.toString(), token0_reserves, token1_reserves)
                    .then(function (response2) {
                      if (response2 !== '') {
                        let res = window.web3js.utils.fromWei(response2.toString())
                        // resRoundthat.token1_value = Math.floor(res * 10000) / 10000
                        let resRound = Math.floor(res * 10000) / 10000
                        // console.log('quote res', dateNow.getTime(), inValue.toString(), resRound)
                        resolve({
                          time: dateNow.getTime(),
                          inValue: inValue,
                          meta: response2.toString(),
                          format: resRound
                        })
                      }
                    })
              } else {
                console.log('pair getReserves 0')
              }
            })
            .catch(Error => {
              alert(that.token0_select + '-' + that.token1_select + '没有配对合约')
              console.log('getReserves error', Error)
            })
      })
    },

    async contractInit() {

      let net_version = await Icontract.checkMetaMask()
      if ( net_version === this.$store.state.defaultNetwork ) {

        let token_from = Icontract.getSelectToken(this.token0_select, this.$store.state.defaultNetwork)
        let token_to = Icontract.getSelectToken(this.token1_select, this.$store.state.defaultNetwork)

        this.token0Contract = Ierc20.ABI.init(token_from.address)
        this.token1Contract = Ierc20.ABI.init(token_to.address)

        // 取当前交易对的Pair
        Ipair.ABI.init(this.$store.state.ContractAddress.OPL)
        IrouterPath.methods.init(this.$store.state.ContractAddress.router)

        this.defaultAccount = this.$store.state.metamask.account

        if (this.defaultAccount !== '') {
         await this.updateDynamicData()
        }

      }
    },

    async getPair() {
      let token0 = Icontract.getSelectToken(this.token0_select, this.$store.state.defaultNetwork)
      let token1 = Icontract.getSelectToken(this.token1_select, this.$store.state.defaultNetwork)
      let pairRes = await IrouterPath.methods.getPair(token0.address, token1.address)
      if (!isStrEmpty(pairRes)) {
        let pair = {}
        pair.pairAddress = pairRes
        pair.token0 = token0
        pair.token1 = token1
        // 本地存储以免页面刷新数据丢失
        localStorage.setItem('pair', JSON.stringify(pair))

      } else {
        console.log('getPair error') // 失败
      }
    },

    tabClick(){
      // console.log('tab',this.tab)
      this.$router.push('/AddLoanLiquidity')
    },

    goAddLoanLiquidity() {
      this.$router.push('/AddLoanLiquidity')
    },

    goPair() {
      this.getPair()
      let getPair = JSON.parse(localStorage.getItem('pair'))

      if (isStrEmpty(getPair.token1.address)) {
        console.log('isStrEmpty pair')
      } else {
        this.$router.push('/pair')
      }
    },

    // 取动态数据
    async updateDynamicData() {
      let token0 = Icontract.getSelectToken(this.token0_select, this.$store.state.defaultNetwork)
      let token1 = Icontract.getSelectToken(this.token1_select, this.$store.state.defaultNetwork)

      let that = this
      if (token0.address !== '') {
        let balanceAddress = this.defaultAccount
        if (token0.symbol === 'ETH') {

          Icontract.getBalanceOf(balanceAddress)
              .then(response=> {
                this.token0_balance = response.format.toString()
              })
        } else {
          if (token0.address === this.token0Contract._address.toString()) {
            this.token0Contract.methods.balanceOf(balanceAddress).call()
                .then(function (response) {
                  let res = window.web3js.utils.fromWei(response.toString())
                  that.token0_balance = Math.floor(res * 10000) / 10000

                  // that.$forceUpdate() // 用于对象内数据更新到界面
                })
                .catch(Error => {
                  console.log('token0 error', token0, Error)
                })
          }

          if (token0.address === this.token1Contract._address.toString()) {
            this.token1Contract.methods.balanceOf(balanceAddress).call()
                .then(function (response) {
                  let res = window.web3js.utils.fromWei(response.toString())
                  that.token0_balance = Math.floor(res * 10000) / 10000

                  // that.$forceUpdate() // 用于对象内数据更新到界面
                })
                .catch(Error => {
                  console.log('token1 error', token1, Error)
                })
          }
        }
      }

      if (token1.address !== '') {
        let balanceAddress = this.defaultAccount
        if (token1.symbol === 'ETH') {
          window.web3js.eth.getBalance(balanceAddress)
              .then(function(response) {
                let res = window.web3js.utils.fromWei(response.toString())
                that.token1_balance = Math.floor(res * 10000) / 10000

                // that.$forceUpdate() // 用于对象内数据更新到界面
              })
              .catch(Error=>{
                console.log('token1 error', token1, Error )
              })
        } else {
          if (token1.address === this.token1Contract._address) {
            this.token1Contract.methods.balanceOf(balanceAddress).call()
                .then(function (response) {
                  let res = window.web3js.utils.fromWei(response.toString())
                  that.token1_balance = Math.floor(res * 10000) / 10000

                  // that.$forceUpdate() // 用于对象内数据更新到界面
                })
                .catch(Error => {
                  console.log('token1 error', token1, Error)
                })
          }

          if (this.token0Contract._address === token1.address) {
            this.token0Contract.methods.balanceOf(balanceAddress).call()
                .then(function (response) {
                  let res = window.web3js.utils.fromWei(response.toString())
                  that.token1_balance = Math.floor(res * 10000) / 10000

                  // that.$forceUpdate() // 用于对象内数据更新到界面
                })
                .catch(Error => {
                  console.log('token0 error', token0, Error)
                })
          }
        }
      }

      // 取当前配对token的储备量
      if(token0.address!=='' && token1.address!=='') {

        IrouterPath.methods.getReserves(token0.address, token1.address)
            .then(function (response) {
              if (response !== '') {
                that.token0_reserves = window.web3js.utils.fromWei(response[0].toString())
                that.token1_reserves = window.web3js.utils.fromWei(response[1].toString())
              }
            })
            .catch(Error => {
              console.log('getReserves error', Error)
            })
      }

      // 我的现货流动性占比
      this.pair = await IrouterPath.methods.getPair(token0.address, token1.address)

      this.myRate = await this.getMyRate(this.pair)

    },

    async add_liquidity() {

      if (this.token0_select === this.token1_select) {
        this.SnackbarShow = true
        this.Snackbar.type = this.$store.state.myColor.error
        this.Snackbar.text = this.$t('error.SameToken')
        return
      }

      if (this.token0_value === null || typeof (this.token0_value) === 'undefined' || this.token0_value === '' || this.token0_value === 0 || this.token0_value === '0') {
        this.token0_input_error = true
        this.token0_input_errorMSG = this.$t('error.InvalidValue')
        return
      }

      if (parseFloat(this.token1_value) > parseFloat(this.token1_balance)) {
        this.token1_input_error = true
        this.token1_input_errorMSG = this.$t('error.OverBalance')
        return
      }

      // 默认顺序 ETH -> Token
      let token = Icontract.getSelectToken(this.token1_select, this.$store.state.defaultNetwork)
      let amountTokenDesired = window.web3js.utils.toWei(this.token1_value.toString())
      let ethValueWei = window.web3js.utils.toWei(this.token0_value.toString())

      // 切换顺序
      if (this.token1_select === 'ETH') {
        token = Icontract.getSelectToken(this.token0_select, this.$store.state.defaultNetwork)
        ethValueWei = window.web3js.utils.toWei(this.token1_value.toString())
        amountTokenDesired = window.web3js.utils.toWei(this.token0_value.toString())
      }

      let amountTokenMinWei = 0
      let amountETHMinWei = 0

      // token 检查当前账号的批准额度
      let fromAccount = this.defaultAccount
      let routerAddress = this.$store.state.ContractAddress.router

      this.addLoading = true
      this.addDisabled = true

      // 添加流动性
      // 需先将Erc20 token批准给router合约
      let allowance = await this.token1Contract.methods.allowance(fromAccount, routerAddress).call()
      console.log('allowance', allowance, amountTokenDesired, allowance >= amountTokenDesired)

      let approveRes = false
      // 没有批准额度则先批准再还款
      if (isStrEmpty(allowance) || allowance === 0 || allowance === '0' || BigInt(allowance) === 0n) {
        // 无批准额度则先批准
        // 一次受权批准最大量 避免多次受权的GAS费
        let tokenSupply = await this.token1Contract.methods.totalSupply().call()
        approveRes = await this.token1Contract.methods.approve(routerAddress, tokenSupply).send({from: fromAccount}).catch(error=>{
          console.log('approve1 error', error)
          this.addLoading = false
          this.addDisabled = false
          return false
        })

      } else {

        if (BigInt(allowance) < BigInt(amountTokenDesired)) {
          console.log('allowance <')
          let approveClear = await this.token1Contract.methods.approve(routerAddress, '0').send({from: fromAccount}).catch(error=>{
            console.log('approve clear', error)
            this.addLoading = false
            this.addDisabled = false
            return false
          })

          if (approveClear) {
            // 一次受权批准最大量 避免多次受权的GAS费
            let tokenSupply = await this.token1Contract.methods.totalSupply().call()
            approveRes = await this.token1Contract.methods.approve(routerAddress, tokenSupply).send({from: fromAccount}).catch(error=>{
              console.log('approve2', error)
              this.addLoading = false
              this.addDisabled = false
              return false
            })
          }
        }
      }

      if (BigInt(allowance) >= BigInt(amountTokenDesired) || approveRes) {

        let addLiquidityETHRes = await IrouterPath.methods.addLiquidityETH(fromAccount, token.address, amountTokenDesired.toString(), amountTokenMinWei.toString(), amountETHMinWei.toString(), fromAccount, ethValueWei.toString())

        if (addLiquidityETHRes) {
          this.SnackbarShow = true
          this.Snackbar.type = this.$store.state.myColor.success
          this.Snackbar.text = 'success'
          await this.updateDynamicData()
        } else {
          this.SnackbarShow = true
          this.Snackbar.type = this.$store.state.myColor.error
          this.Snackbar.text = 'error'
        }

      }

      this.addLoading = false
      this.addDisabled = false

    },

    async add_liquidity2() {

      if (this.token0_value === null || typeof (this.token0_value) === 'undefined' || this.token0_value === '' || this.token0_value === 0 || this.token0_value === '0') {
        this.token0_input_error = true
        this.token0_input_errorMSG = this.$t('error.InvalidValue')
        return
      }

      if (parseFloat(this.token1_value) > parseFloat(this.token1_balance)) {
        this.token1_input_error = true
        this.token1_input_errorMSG = this.$t('error.OverBalance')
        return
      }

      let token0 = Icontract.getSelectToken(this.token0_select, this.$store.state.defaultNetwork)
      // let token1 = Icontract.getSelectToken(this.token1_select, this.$store.state.defaultNetwork)

      let amountTokenMinWei = 0
      let amountETHMinWei = 0
      let amountTokenDesired = window.web3js.utils.toWei(this.token0_value)

      // token 检查当前账号的批准额度
      let fromAccount = this.defaultAccount
      let routerAddress = this.$store.state.ContractAddress.router
      let ethValueWei = window.web3js.utils.toWei(this.token1_value.toString())

      this.addLoading = true
      this.addDisabled = true

      // 添加流动性
      // 需先将Erc20 token批准给router合约
      let that = this
      let allowance = await this.token0Contract.methods.allowance(fromAccount, routerAddress).call()
      console.log('allowance', allowance, amountTokenDesired, allowance >= amountTokenDesired)

      // 没有批准额度则先批准再还款
      if (isStrEmpty(allowance) || allowance === 0 || allowance === '0' || BigInt(allowance) === 0n) {
        // 无批准额度则先批准
        this.token0Contract.methods.approve(routerAddress, amountTokenDesired).send({from: fromAccount})
            .then(response => {
              console.log('approve res', response)
              // 添加流动性 分为token token和token ETH
              if (this.token1_select === 'ETH') {

                // console.log('addLiquidityETH',fromAccount, token0.address, amountTokenDesired.toString(), amountTokenMinWei, amountETHMinWei, to, ethValueWei)
                IrouterPath.methods.addLiquidityETH(fromAccount, token0.address, amountTokenDesired.toString(), amountTokenMinWei.toString(), amountETHMinWei.toString(), fromAccount, ethValueWei.toString())
                    .then(function (response) {
                      console.log('addLiquidityETH res', response)

                      that.updateDynamicData()
                      that.addLoading = false
                      that.addDisabled = false

                    })
                    .catch(error => {

                      console.log('addLiquidityETH error', error)
                      that.addLoading = false
                      that.addDisabled = false

                    })
              } else {
                console.log('token to token')
                this.addLoading = false
                this.addDisabled = false
              }
            })
            .catch(error => {
              console.log('error', error)
              // 批准取消
              this.addLoading = false
              this.addDisabled = false
            })

      } else {

        if (BigInt(allowance) >= BigInt(amountTokenDesired)) {
          console.log('allowance >=')
          if (this.token1_select === 'ETH') {

            // console.log('addLiquidityETH', fromAccount, token0.address, amountTokenDesired.toString(), amountTokenMinWei, amountETHMinWei, to, ethValueWei)
            IrouterPath.methods.addLiquidityETH(fromAccount, token0.address, amountTokenDesired.toString(), amountTokenMinWei.toString(), amountETHMinWei.toString(), fromAccount, ethValueWei.toString())
                .then(function (response) {
                  console.log('addLiquidityETH res', response)

                  that.updateDynamicData()
                  that.addLoading = false
                  that.addDisabled = false

                })
                .catch(error => {
                  console.log('addLiquidityETH error', error)
                  that.addLoading = false
                  that.addDisabled = false
                })
          } else {
            console.log('token to token')
            this.addLoading = false
            this.addDisabled = false
          }
        } else {
          // 重置approve
          if (confirm(this.$t('long.ResetApprove').toString())) {

            this.token0Contract.methods.approve(routerAddress, '0').send({from: fromAccount})
                .then(response => {
                  alert(this.$t('long.ReSetDone'))
                  console.log('allowance reset done', response)
                  this.addLoading = false
                  this.addDisabled = false
                })
                .catch(error => {
                  console.log('allowance reset no', error)
                  this.addLoading = false
                  this.addDisabled = false
                })
          }
        }

      }
    },

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

<template>
  <v-row justify="center">
    <h2 v-if="this.pair.address ===''">not pair</h2>
    <v-dialog
        v-else
        v-model="this.$store.state.swapShow"
        persistent
        max-width="600px"
    >
      <v-card>
        <v-card-title class="pa-2">
          <span class="headline">Swap</span>
<!--          <v-row class="justify-center">-->
<!--            <h5 class="ml-3">{{this.token_from.symbol}} - {{this.token_to.symbol}}</h5>-->
<!--          </v-row>-->
          <v-spacer/>
          <v-btn @click="close" icon>
            <v-icon color="blue">
              mdi-close
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0 mt-2">
          <v-container>
            <v-col>
              <v-row>
                <v-col class="px-0">
                  <v-row class="justify-end mr-1 mb-2">balance: {{this.token_from.balance}}</v-row>
                  <v-text-field
                      v-model="token0_value"
                      label="From"
                      placeholder="0.0"
                      :suffix="this.token_from.symbol"
                      :error="token_from_error"
                      @input="fromInput"
                      type="number"
                      outlined
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row class="justify-center">
                <v-icon class="ml-3" color="blue" large @click="swapPosition">swap_calls</v-icon>
                <!--                <v-icon @click="AmountOut" class="mt-0 pt-0" large color="blue">arrow_downward</v-icon>-->
              </v-row>
              <v-row>

                <v-col class="pl-0 pr-0">
                  <v-row class="justify-end mr-1 mb-2">balance: {{this.token_to.balance}}</v-row>
                  <v-text-field
                      class="pt-0 pb-0 mt-0 mb-0"
                      v-model="token1_value"
                      label="To"
                      placeholder="0.0"
                      :suffix="this.token_to.symbol"
                      readonly
                      type="number"
                      outlined
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row class="mt-3">
                <v-btn block class="white--text" color="blue" :loading="swapLoading" :disabled="swapDisabled" @click="swap">swap
                  <template v-slot:loader>
                    <span class="custom-loader">
                      <v-icon light>mdi-cached</v-icon>
                    </span>
                  </template>
                </v-btn>
              </v-row>
              <v-row class="mt-10">
                <span>⭐️ By adding liquidity you'll earn 0.3% of all trades on this pair proportional to your share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.</span>
              </v-row>

            </v-col>
          </v-container>
        </v-card-text>

        <v-alert v-model="this.alertWarning" dense type="warning">{{this.alertWarningMsg}}</v-alert>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import Istore from '@/store'
import Ierc20 from '@/contract/ERC20/interface'
import {Icontract, isStrEmpty} from "@/common"
import IRouterPath from "@/contract/router/interface"
import Iusdt from "@/contract/USDT/interface"
export default {
  name: 'comSwap',
  data: () => ({
    defaultAccount:'',
    alertWarning: false,
    alertWarningMsg: 'invalid from value',
    pair: '',
    token0_value: '',
    token1_value: '',
    token_from: {},
    token_to: {},
    token_from_error: false,
    swapLoading: false,
    swapDisabled: false,
    token0Contract: '',
    token1Contract: '',
    contrastTime: 0,
  }),
  props: {
    dialog: {type: Boolean, default: false}
  },
  created() {
    console.log('com swap')
    this.pair = JSON.parse(localStorage.getItem('pair'))
    // 默认 token_from为token0, token_to为token1, 可用于换位
    this.token_from = this.pair.token0
    this.token_to = this.pair.token1
    this.contractInit()
  },
  methods: {
    // 在输入时做即时输出
    async fromInput() {

      console.log('AmountOut')
      this.alertWarning = false

      if (isStrEmpty(this.token0_value) || this.token0_value === 0 || this.token0_value === '0') {
        this.alertWarning = true
        this.token_from_error = true
        this.alertWarningMsg = 'invalid input value'
        this.token1_value = ''
        return
      } else {
        this.alertWarning = false
        this.token_from_error = false
      }

      if (this.token0_value > this.token_from.balance) {
        this.alertWarningMsg = 'over token balance'
        this.alertWarning = true
        this.swapDisabled = true
        return
      } else {
        this.alertWarning = false
        this.swapDisabled = false
      }

      let token_from_valueWei = window.web3js.utils.toWei(this.token0_value.toString())

      // 多次异步查询 需对比输入时间和输入值 避免延迟覆盖
      let amountOutRes = await this.AmountOut(token_from_valueWei)
      if (BigInt(amountOutRes.time.toString()) > BigInt(this.contrastTime.toString()) && this.token0_value === window.web3js.utils.fromWei(amountOutRes.inValue)) {
        this.contrastTime = amountOutRes.time
        this.token1_value = amountOutRes.format
      }
    },

    close() {
      this.$store.commit('setSwapShow', false)
      this.alertWarning = false
    },

    async contractInit() {
      let net_version = await Icontract.checkMetaMask()

      if ( net_version === this.$store.state.defaultNetwork ) {
        this.defaultAccount = this.$store.state.metamask.account
        this.token0Contract = Ierc20.ABI.init(this.token_from.address)
        this.token1Contract = Ierc20.ABI.init(this.token_to.address)
        Iusdt.methods.init(this.$store.state.ContractAddress.USDT)
        IRouterPath.methods.init(this.$store.state.ContractAddress.router)
        this.getTokenBalance()
      }
    },

    getTokenBalance() {
      let that = this
      if (this.token_from.address !== '') {

        if (this.token_from.symbol === 'WETH') {

          window.web3js.eth.getBalance(this.defaultAccount)
              .then(function(response) {
                let res = window.web3js.utils.fromWei(response.toString())
                let resRound = Math.floor(res * 10000) / 10000
                that.token_from.balance = resRound

                that.$forceUpdate() // 用于对象内数据更新到界面
                console.log(that.token_from.symbol, resRound)
              })
        } else {
          if (that.token_from.address === this.token0Contract._address.toString()) {
            this.token0Contract.methods.balanceOf(this.defaultAccount).call().then(function(response) {
              let res = window.web3js.utils.fromWei(response.toString())
              let resRound = Math.floor(res * 10000) / 10000
              that.token_from.balance = resRound

              that.$forceUpdate() // 用于对象内数据更新到界面
              console.log(that.token_from.symbol, resRound)
            })
          }

          if (that.token_from.address === this.token1Contract._address.toString()) {
            this.token1Contract.methods.balanceOf(this.defaultAccount).call().then(function(response) {
              let res = window.web3js.utils.fromWei(response.toString())
              let resRound = Math.floor(res * 10000) / 10000
              that.token_from.balance = resRound

              that.$forceUpdate() // 用于对象内数据更新到界面
              console.log(that.token_from.symbol, resRound)
            })
          }
        }
      }

      if (this.token_to.address !== '') {

        if (this.token_to.symbol === 'WETH') {
          window.web3js.eth.getBalance(this.defaultAccount)
              .then(function(response) {
                let res = window.web3js.utils.fromWei(response.toString())
                let resRound = Math.floor(res * 10000) / 10000
                that.token_to.balance = resRound

                that.$forceUpdate() // 用于对象内数据更新到界面
                console.log(that.token_to.symbol, resRound)
              })
        } else {
          if (this.token1Contract._address === this.token_to.address) {
            this.token1Contract.methods.balanceOf(this.defaultAccount).call().then(function(response) {
              let res = window.web3js.utils.fromWei(response.toString())
              let resRound = Math.floor(res * 10000) / 10000
              that.token_to.balance = resRound

              that.$forceUpdate() // 用于对象内数据更新到界面
              console.log(that.token_to.symbol, resRound)
            })
          }

          if (this.token0Contract._address === this.token_to.address) {
            this.token0Contract.methods.balanceOf(this.defaultAccount).call().then(function(response) {
              let res = window.web3js.utils.fromWei(response.toString())
              let resRound = Math.floor(res * 10000) / 10000
              that.token_to.balance = resRound

              that.$forceUpdate() // 用于对象内数据更新到界面
              console.log(that.token_to.symbol, resRound)
            })
          }
        }
      }
    },

    /**
     * @dev 获取单个输出数额
     * @notice 给定一项资产的输入量和配对的储备，返回另一项资产的最大输出量
     * @param amountIn 输入数额
     * @param reserveIn 储备量In
     * @param reserveOut 储备量Out
     * @return amounts  输出数额
     */
    async AmountOut(inValue) {
      let dateNow = new Date()
      return new Promise((resolve) => {
        let that = this
        IRouterPath.methods.getReserves(this.token_from.address, this.token_to.address)
            .then(function (response) {
              let token0_reserves = response[0].toString()
              let token1_reserves = response[1].toString()
              IRouterPath.methods.getAmountOut(inValue.toString(), token0_reserves.toString(), token1_reserves.toString())
                  .then(function (response) {
                    let res = window.web3js.utils.fromWei(response.toString())
                    let amountOut = Math.floor(res * 10000) / 10000

                    resolve({time:dateNow.getTime(), inValue:inValue, meta:response.toString(),format:amountOut})
                  })
                  .catch(Error => {
                    console.log('getAmountOut error', Error)
                    resolve('')
                  })
            })
            .catch(Error => {
              alert(that.token_from_select + '-' + that.token_to_select + '没有配对合约')
              console.log('getReserves error', Error)
              resolve('')
            })
      })
    },

    /**
     * @dev 获取单个输入数额
     * @notice 给定一项资产的输出量和对储备，返回其他资产的所需输入量
     * @param amountOut 输出数额
     * @param reserveIn 储备量In
     * @param reserveOut 储备量Out
     * @return amounts  输入数额
     */
    async getAmountIn() {
      console.log('getAmountIn')
      this.alertWarning = false

      if (isStrEmpty(this.token0_value) || isStrEmpty(this.token1_value)  || this.token0_value === 0 || this.token1_value === 0) {
        console.log('invalid token value')
        this.alertWarning = true
        return
      }

      let _token0_address = this.pair.token0.address
      let _token1_address = this.pair.token1.address
      let _amountTokenDesired = this.token0_value
      // let _amountTokenMin = 0
      // let _amountETHMin = 0
      // let _to = '0x379F025b37E04d9d5ec4e3198b36717FA54C513c'
      let _ethValue = this.token1_value

      let nowTime = parseInt((new Date().getTime() / 1000).toString())
      let deadline = nowTime + Istore.state.ensure

      let amountTokenDesired = _amountTokenDesired * 10 ** Istore.state.decimals
      // let amountTokenMin = _amountTokenMin * 10 ** Istore.state.decimals
      // let amountETHMin = _amountETHMin * 10 ** Istore.state.decimals
      let ethWeiValue = _ethValue * 10 ** Istore.state.decimals

      console.log('AmountIn', deadline, _token0_address, _token1_address, amountTokenDesired, this.defaultAccount, ethWeiValue)

      let that = this
      this.routerContract.methods.getReserves(_token0_address, _token1_address).call().then(function(response) {
        let token0_reserves = response[0].toString()
        let token1_reserves = response[1].toString()
        that.routerContract.methods.getAmountIn(amountTokenDesired.toString(), token0_reserves, token1_reserves).call().then(function(response) {
          console.log('AmountIn', response)
        })
      })
    },

    // 交换位置
    swapPosition() {
      // 可用于存放token返回值
      let token0 = this.pair.token0
      let token1 = this.pair.token1
      this.token0_value = null // from value
      this.token1_value = null // to value

      // console.log('swapPosition', token0, token1)

      if (this.token_from.symbol === token0.symbol) {
        this.token_from = token1
        this.token_to = token0
      } else {
        this.token_from = token0
        this.token_to = token1
      }

    },

    swap() {

      if (isStrEmpty(this.token0_value) || this.token0_value === '0' || this.token0_value === 0) {
        console.log('invalid token value')
        return
      }

      if (this.token_from.symbol === 'WETH') {
        // eth -> usdt
        this.swapExactETHForTokens()
      } else {
        if (this.token_to.symbol === 'WETH') {
          // usdt -> eth
          this.swapExactTokensForETH()
        } else {
          // 都没有eth则为token换token
          this.swapExactTokensForTokens()
        }
      }
    },

    /**
     * @dev 根据精确的ETH交换尽量多的token
     * @param amountOutMin 最小输出数额
     * @param path 路径数组
     * @param to to地址
     * @param deadline 最后期限
     * @return amounts[]  数额数组
     */
    swapExactETHForTokens() {
      console.log('swapExactETHForTokens')
      this.alertWarning = false

      // let token1_value = this.$refs.token1_value.$data.lazyValue // to value
      if (isStrEmpty(this.token0_value) || this.token0_value === '0' || this.token0_value === 0) {
        console.log('invalid from token value')
        this.alertWarning = true
        this.token_from_error = true
        return
      }

      if (this.token0_value > this.token_from.balance) {
        this.alertWarningMsg = 'over token balance'
        this.alertWarning = true
        return
      }

      let fromValueWei = window.web3js.utils.toWei(this.token0_value)
      let amountOutMin = '0'
      let swapPath = [this.token_from.address, this.token_to.address]
      let swapTo = this.defaultAccount

      console.log('swapExactETHForTokens', amountOutMin, swapPath, swapTo, this.token0_value, fromValueWei)

      this.swapLoading = true
      this.swapDisabled = true
      let that = this
      IRouterPath.methods.swapExactETHForTokens(this.defaultAccount, amountOutMin, swapPath, swapTo, fromValueWei)
          .then(function (response) {
            if (response) {
              that.getTokenBalance()
            }
            that.swapLoading = false
            that.swapDisabled = false
          })
          .catch(error=>{
            that.swapLoading = false
            that.swapDisabled = false
            console.log('swapExactETHForTokens error', error)
          })
    },

    /**
     * @dev 根据精确的token交换尽量多的ETH
     * @param amountIn 精确输入数额
     * @param amountOutMin 最小输出数额
     * @param path 路径数组
     * @param to to地址
     * @param deadline 最后期限
     * @return amounts[]  数额数组
     */
    async swapExactTokensForETH() {
      console.log('swapExactTokensForETH')
      this.alertWarning = false

      if (isStrEmpty(this.token0_value) || this.token0_value === '0' || this.token0_value === 0) {
        console.log('invalid from token value')
        this.alertWarning = true
        return
      }

      if (this.token0_value > this.token_from.balance) {
        this.alertWarningMsg = 'over token balance'
        this.alertWarning = true
        return
      }

      let amountIn = window.web3js.utils.toWei(this.token0_value.toString())
      let amountOutMin = '0'
      let swapPath = [this.token_from.address, this.token_to.address]
      let swapTo = this.defaultAccount

      let myAllowance = await Iusdt.methods.allowance(this.defaultAccount, this.$store.state.ContractAddress.router)

      if (isStrEmpty(myAllowance)) {
        alert('网络错误未能取得的批准数据')
        return false
      }

      this.swapLoading = true
      this.swapDisabled = true
      let approveRes = false
      console.log('swapExactTokensForETH', amountIn, amountOutMin, swapPath, swapTo, myAllowance)

      // 没有批准额度则先确认批准额度
      if (myAllowance === null || myAllowance === 0 || myAllowance === '0' || BigInt(myAllowance) ===0n) {

        approveRes=await Iusdt.methods.approve(this.defaultAccount,this.$store.state.ContractAddress.router,amountIn)
        if (isStrEmpty(approveRes)) {
          console.log('approve error', approveRes)
          this.swapLoading = false
          this.swapDisabled = false
          return
        }

      } else {
        if (BigInt(myAllowance) < BigInt(amountIn)) {
          // 重置approve
          if (confirm('您有未使用的批准余额 需要先重置该额度')) {
            let approveSignStatus=await Iusdt.methods.approve(this.defaultAccount,this.$store.state.ContractAddress.router,'0')
            if (approveSignStatus){
              alert('重置完成请重新交易')
            }
            this.swapLoading = false
            this.swapDisabled = false
            return
          }
          this.swapLoading = false
          this.swapDisabled = false
        }
      }

      //
      if (BigInt(myAllowance) >= BigInt(amountIn) || approveRes) {

        let that = this
        IRouterPath.methods.swapExactTokensForETH(swapTo, amountIn.toString(), amountOutMin, swapPath, swapTo)
            .then(function (response) {
              console.log('swapExactTokensForETH', response)
              if (response) {
                that.getTokenBalance()
              }

              that.swapLoading = false
              that.swapDisabled = false
            })
            .catch(Error => {
              that.swapLoading = false
              that.swapDisabled = false
              console.log('swapExactTokensForETH', Error)
            })
      }
    },

    /**
     * @dev 根据精确的token交换尽量多的token
     * @param amountIn 精确输入数额
     * @param amountOutMin 最小输出数额
     * @param path 路径数组
     * @param to to地址
     * @param deadline 最后期限
     * @return amounts[]  数额数组
     */
    swapExactTokensForTokens() {

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

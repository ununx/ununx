<template>
  <v-row justify="center">
    <v-dialog
        v-model="this.$store.state.add_liquidity_Show"
        persistent
        max-width="600px"
    >
      <v-card>
        <v-card-title class="pa-2">
          <span class="headline">AddLiquidity</span>
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
                  <v-row class="justify-end mr-1 mb-2">balance: {{this.token_0.balance}}</v-row>
                  <v-text-field
                      v-model="token0_value"
                      label="Input"
                      placeholder="0.0"
                      :suffix="pair.token0.symbol"
                      :error="token0_input_error"
                      @input="inputChange"
                      type="number"
                      outlined
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col class="pl-0 pr-0">
                  <v-row class="justify-end mr-1 mb-2">balance: {{this.token_1.balance}}</v-row>
                  <v-text-field
                      v-model="token1_value"
                      label="Input"
                      placeholder="0.0"
                      :suffix="pair.token1.symbol"
                      type="number"
                      readonly
                      outlined
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-btn block class="white--text" color="blue" :loading="addLoading" :disabled="addDisabled" @click="add_liquidity">add liquidity</v-btn>
              </v-row>
              <v-row class="mt-10">
                <span>⭐️ By adding liquidity you'll earn 0.3% of all trades on this pair proportional to your share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.</span>
              </v-row>
            </v-col>
          </v-container>
        </v-card-text>

        <v-alert v-model="this.alertWarning" dense border="left" type="warning"> {{this.alertWarningMsg}}</v-alert>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import IrouterPath from '@/contract/router/interface'
import Ierc20 from '@/contract/ERC20/interface'
import {Icontract, isStrEmpty} from "@/common"
export default {
  name: 'comAddLiquidity',
  data: () => ({
    defaultAccount:'',
    alertWarning: false,
    pair:'',
    token0_value:'',
    token1_value:'',
    token_0: {},
    token_1: {},
    token0Contract: '',
    token1Contract: '',
    token0_input_error: false,
    addLoading: false,
    addDisabled: false,
    contrastTime: 0,
    alertWarningMsg: 'invalid input value'
  }),
  created() {
    this.pair= JSON.parse(localStorage.getItem('pair'))
    this.token_0 = this.pair.token0
    this.token_1 = this.pair.token1

    this.contractInit()
  },

  methods: {
    close() {
      this.$store.commit('setAddLiquidityShow', false)
      this.alertWarning = false
    },

    async inputChange() {
      this.alertWarning = false
      console.log('quote', this.token_0.balance, isStrEmpty(this.token0_value))
      if (isStrEmpty(this.token0_value) || this.token0_value === 0 || this.token0_value === '0') {
        this.alertWarning = true
        this.token0_input_error = true
        this.alertWarningMsg = 'invalid input value'
        this.token1_value = ''
        return
      } else {
        this.alertWarning = false
        this.token0_input_error = false
      }
      let token0_value = window.web3js.utils.toWei(this.token0_value.toString()) // from value
      if (window.web3js.utils.fromWei(token0_value) > this.token_0.balance) {
        this.alertWarningMsg = 'over token balance'
        this.alertWarning = true
        this.addDisabled = true
        return
      } else {
        this.alertWarning = false
        this.addDisabled = false
      }

      // 多次异步查询 需对比输入时间和输入值 避免延迟覆盖
      let quoteRes = await this.quote(token0_value)
      if (BigInt(quoteRes.time) > BigInt(this.contrastTime) && this.token0_value === window.web3js.utils.fromWei(quoteRes.inValue)) {
        this.contrastTime = quoteRes.time
        this.token1_value = quoteRes.format
      }

    },

    async contractInit() {
      let net_version = await Icontract.checkMetaMask()

      if ( net_version === this.$store.state.defaultNetwork ) {
        this.defaultAccount = this.$store.state.metamask.account
        this.token0Contract = Ierc20.ABI.init(this.token_0.address)
        this.token1Contract = Ierc20.ABI.init(this.token_1.address)
        IrouterPath.methods.init(this.$store.state.ContractAddress.router)
        this.getTokenBalance()
      }
    },

    quote(inValue) {
      let dateNow = new Date()
      return new Promise((resolve) => {
        IrouterPath.methods.getReserves(this.token_0.address, this.token_1.address)
            .then(function (response1) {
              let token0_reserves = response1[0].toString()
              let token1_reserves = response1[1].toString()

              IrouterPath.methods.quote(inValue.toString(), token0_reserves, token1_reserves)
                  .then(function (response2) {
                    let res = window.web3js.utils.fromWei(response2.toString())
                    let resRound = Math.floor(res * 10000) / 10000
                    console.log('quote res', dateNow.getTime(), inValue.toString(), resRound )
                    resolve({time:dateNow.getTime(), inValue:inValue, meta:response2.toString(),format:resRound})
                  })
            })
      })
    },

    async add_liquidity() {
      this.alertWarning = false

      if (isStrEmpty(this.token0_value) || this.token0_value === 0 || this.token0_value === '0') {
        console.log('invalid token value')
        this.alertWarning = true
        this.token0_input_error = true
        return
      }

      let _token0_address = this.pair.token0.address
      let _to = this.defaultAccount

      let amountTokenDesired = window.web3js.utils.toWei(this.token0_value.toString())

      let token1Value = await this.quote(amountTokenDesired)
      let ethValueWei = token1Value.meta

      console.log('addLiquidityETH', this.defaultAccount, amountTokenDesired, ethValueWei, this.$store.state.currentRouter, this.pair)

      // token 检查可转余额
      let erc20Owber = this.pair.token0.owner
      let routerAddress = this.$store.state.ContractAddress.router

      if (this.pair.token1.symbol === 'WETH') {

        let myAllowance = await this.token0Contract.methods.allowance(erc20Owber, routerAddress).call()

        if (isStrEmpty(myAllowance)) {
          alert('网络错误未能取得的批准数据')
          return false
        }

        this.addLoading = true
        this.addDisabled = true
        let approveRes = false
        // 没有批准额度则先确认批准额度
        if (myAllowance === null || myAllowance === 0 || myAllowance === '0' || BigInt(myAllowance) === 0n) {
          approveRes = await this.token0Contract.methods.approve(this.defaultAccount, this.$store.state.ContractAddress.router, amountTokenDesired).call()

          if (isStrEmpty(approveRes)) {
            console.log('approve error', approveRes)
            this.addLoading = false
            this.addDisabled = false
            return
          }

        } else {
          if (BigInt(myAllowance) < BigInt(ethValueWei)) {
            // 重置approve
            if (confirm('您有未使用的批准余额 需要先重置该额度')) {
              let approveSignStatus = await this.token0Contract.methods.approve(this.defaultAccount, this.$store.state.ContractAddress.router, '0')
              if (approveSignStatus) {
                alert('重置完成请重新交易')
              }
              this.addLoading = false
              this.addDisabled = false
              return
            }
            this.addLoading = false
            this.addDisabled = false
          }
        }

        if (BigInt(myAllowance) >= BigInt(ethValueWei) || approveRes) {
          let amountTokenMin = 0
          let amountETHMin = 0
          let that = this
          IrouterPath.methods.addLiquidityETH(this.defaultAccount, _token0_address, amountTokenDesired.toString(), amountTokenMin, amountETHMin, _to, ethValueWei)
              .then(function (response) {
                if (response) {
                  that.getTokenBalance()
                }
                that.addLoading = false
                that.addDisabled = false
              })
              .catch(error => {
                that.addLoading = false
                that.addDisabled = false
                console.log('addLiquidityETH', error)
              })
        }
      } else {
        console.log('token to token')
      }
    },

    getTokenBalance() {
      let that = this
      if (this.token_0.address !== '') {
        if (this.token_0.symbol === 'WETH') {
          window.web3js.eth.getBalance(this.defaultAccount)
              .then(function(response) {
                let res = window.web3js.utils.fromWei(response.toString())
                let resRound = Math.floor(res * 10000) / 10000
                that.token0.balance = resRound

                that.$forceUpdate() // 用于对象内数据更新到界面
                console.log(that.token0.symbol, resRound)
              })
        } else {
          if (that.token_0.address === this.token0Contract._address.toString()) {
            this.token0Contract.methods.balanceOf(this.defaultAccount).call().then(function(response) {
              let res = window.web3js.utils.fromWei(response.toString())
              let resRound = Math.floor(res * 10000) / 10000
              that.token_0.balance = resRound

              that.$forceUpdate() // 用于对象内数据更新到界面
              console.log(that.token_0.symbol, resRound)
            })
          }

          if (that.token_0.address === this.token1Contract._address.toString()) {
            this.token1Contract.methods.balanceOf(this.defaultAccount).call().then(function(response) {
              let res = window.web3js.utils.fromWei(response.toString())
              let resRound = Math.floor(res * 10000) / 10000
              that.token_0.balance = resRound

              that.$forceUpdate() // 用于对象内数据更新到界面
              console.log(that.token_0.symbol, resRound)
            })
          }
        }
      }

      if (this.token_1.address !== '') {
        if (this.token_1.symbol === 'WETH') {
          window.web3js.eth.getBalance(this.defaultAccount)
              .then(function(response) {
                let res = window.web3js.utils.fromWei(response.toString())
                let resRound = Math.floor(res * 10000) / 10000
                that.token_1.balance = resRound

                that.$forceUpdate() // 用于对象内数据更新到界面
                console.log(that.token_1.symbol, resRound)
              })
        } else {
          if (this.token1Contract._address === this.token_1.address) {
            this.token1Contract.methods.balanceOf(this.defaultAccount).call().then(function(response) {
              let res = window.web3js.utils.fromWei(response.toString())
              let resRound = Math.floor(res * 10000) / 10000
              that.token_1.balance = resRound

              that.$forceUpdate() // 用于对象内数据更新到界面
              console.log(that.token_1.symbol, resRound)
            })
          }

          if (this.token0Contract._address === this.token_1.address) {
            this.token0Contract.methods.balanceOf(this.defaultAccount).call().then(function(response) {
              let res = window.web3js.utils.fromWei(response.toString())
              let resRound = Math.floor(res * 10000) / 10000
              that.token_1.balance = resRound

              that.$forceUpdate() // 用于对象内数据更新到界面
              console.log(that.token_1.symbol, resRound)
            })
          }
        }
      }
    }

  }
}
</script>

<style scoped>

</style>

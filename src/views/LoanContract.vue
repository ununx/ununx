<template>
  <v-row justify="center" class="ma-1 px-0">
    <v-col cols="12" class="px-0 mx-0">
      <v-row class="headline justify-end">Layer2 Contract Swap</v-row>
      <v-row class="mt-9">
      <v-col class="col-6">
        <v-combobox
            v-model="selectPair"
            :items="pairArray"
            label="TOKEN"
            outlined
            shaped
            class="shrink"
        ></v-combobox>
      </v-col>

      </v-row>
      <h4 class="font-weight-light" style="text-overflow: ellipsis; overflow: hidden">{{$t('web.Account')}}</h4>
      <h5 class="font-weight-light" style="text-overflow: ellipsis; overflow: hidden">{{defaultAccount}}</h5>
      <v-row class="mt-2" style="margin-left: 1px">
        <h5 class="font-weight-light">ETH: {{assetsBalance.ETH.format}}</h5>
        <h5 class="ml-5 font-weight-light">{{tokenFromSymbol}}: {{assetsBalance.USDT.format}}</h5>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon small color="blue" v-bind="attrs" v-on="on" class="ml-9" @click="goMyAccount">mdi-expand-all-outline</v-icon>
          </template>
          <span>添加 查看资产</span>
        </v-tooltip>

      </v-row>

      <v-row class="mt-9">
        <v-col class="px-0">
          <v-tabs
              v-model="tab"
              fixed-tabs
          >
            <v-tabs-slider color="blue"></v-tabs-slider>
            <v-tab><h3>{{ $t('web.Opening') }}</h3></v-tab>
            <v-tab><h3>{{ $t('web.Closing') }}</h3></v-tab>
          </v-tabs>
          <v-divider/>
          <v-tabs-items v-model="tab">
            <!--          开仓-->
            <v-tab-item>
              <v-row class="mt-9 px-0">
                <v-col>
<!--                  <v-row class="mb-9 ml-1">-->
<!--                    <h4 class="font-weight-light">buy price {{ethPrice}}</h4>-->
<!--                    <h4 class="font-weight-light ml-3">short price {{ethShortPrice}}</h4>-->
<!--                  </v-row>-->

                    <h5 class="font-weight-light ml-1 mb-1">USDT -> ETH  max:{{buyInputCheck.max}}</h5>
                    <v-row>
                      <v-col class="col-8 pr-1">
                    <v-text-field
                        v-model="inputQty"
                        ref="inputQty"
                        label="ETH"
                        @input="InputQtyCheck"
                        :error="inputQtyError"
                        :error-messages="inputQtyErrorMsg"
                        placeholder="0.0"
                        type="number"
                        outlined
                    ></v-text-field>
                      </v-col>
                    <v-col class="col-4 pl-0">
                      <v-btn block x-large color="blue" class="white--text" @click="loanBorrowSign" :loading="btnLoading" :disabled="btnLoading">{{$t('web.Long')}}</v-btn>
                    </v-col>
                    </v-row>
                    <h5 class="font-weight-light ml-1 mb-1">ETH -> USDT  max:{{shortInputCheck.max}}</h5>
                    <v-row>
                      <v-col class="col-8 pr-1">
                      <v-text-field
                          v-model="inputShort"
                          label="ETH"
                          @input="inputShortCheck"
                          :error="inputShortError"
                          :error-messages="inputShortErrorMsg"
                          placeholder="0.0"
                          type="number"
                          outlined
                      ></v-text-field>
                      </v-col>
                      <v-col class="col-4 pl-0">
                      <v-btn block x-large color="blue" outlined @click="ShortBorrowSign" :loading="btnLoading" :disabled="btnLoading">{{$t('web.Short')}}
                    </v-btn>
                      </v-col>
                    </v-row>
                </v-col>
              </v-row>

              <!-- 汇率 -->
              <v-card outlined class="mt-9 pa-0" >
                <v-row class="my-2">
                  <v-col class="col-4 py-0 ml-1">
                    <v-card-subtitle class="pa-0">Rate</v-card-subtitle>
                  </v-col>
                  <v-col class="text-end py-0 mr-1">
                    <v-card-subtitle class="pa-0">1 eth = {{SwapHint.forward}} usdt</v-card-subtitle>
                    <v-card-subtitle class="pa-0">1 usdt = {{SwapHint.backward}} eth</v-card-subtitle>
                  </v-col>
                </v-row>

                <v-row class="my-0 pb-2">
                  <v-col class="col-4 py-0 ml-1">
                    <v-card-subtitle class="pa-0">Gas Fee</v-card-subtitle>
                  </v-col>
                  <v-col class="text-end py-0 mr-1">
                    <v-card-subtitle class="pa-0">{{SwapHint.gas}} eth</v-card-subtitle>
                    <v-card-subtitle class="pa-0">{{SwapHint.gasDollar}} $</v-card-subtitle>
                  </v-col>
                </v-row>
              </v-card>

<!--              <v-btn @click="test1">dfsfd</v-btn>-->
              <v-row class="mt-3 ml-1 green--text"><h6>{{$t('long.swapHint1')}}</h6></v-row>
              <v-row class="ml-1 green--text"><h6>{{$t('long.swapHint2')}}</h6></v-row>
              <v-row class="ml-1 green--text"><h6>{{$t('long.swapHint3')}}</h6></v-row>
              <v-row class="mb-1 ml-1 green--text"><h6>{{$t('long.swapHint4')}}</h6></v-row>

              <v-chip
                  class="ml-n3 mt-7 mb-3" style="height: 19px"
                  color="blue"
                  outlined
              >
                {{$t('web.Position')}}
              </v-chip>


              <v-row class="mt-3" v-if="tokenFromContractData.borrower.position>0">
                <v-col>
                  <v-row class="ml-1 mb-1 align-center">
                    <h4>{{tokenFromContractData.borrower.tradeType}}</h4>
                    <h5 class="ml-2 font-weight-light">{{tokenFromContractData.borrower.date}}</h5>
                  </v-row>
                  <v-divider/>
                  <v-row class="mt-2 caption desc">
                    <v-col class="pt-0">
                      {{$t('web.Position')}}: {{tokenFromContractData.borrower.position}}
                    </v-col>
                    <v-col class="pt-0 pl-0">
                      {{$t('web.PositionPrice')}}: {{tokenFromContractData.borrower.price}}
                    </v-col>
                    <v-col class="pt-0 pl-0">
                      {{$t('web.MarginCloseout')}}: {{Math.floor(tokenFromContractData.borrower.forced * 10000) / 10000}}
                    </v-col>
                  </v-row>

                  <v-row class="desc caption mt-0 pt-0">
                    <v-col>
                      {{$t('web.MarketPrice')}}: {{ethShortPrice}}
                    </v-col>
                    <v-col class="pl-0">
                      {{$t('web.ROE')}}: {{Math.floor(tokenFromContractData.borrower.breakRate * 100) / 100}}%
                    </v-col>
                    <v-col class="pl-0">
                      {{$t('web.Profit')}}: {{Math.floor(tokenFromContractData.borrower.breakValue * 10000 ) / 10000}}
                    </v-col>
                  </v-row>
                  <v-row class="pb-0 mt-3 mb-0 justify-end" >
                    <v-btn outlined min-width="99" class="white--text mr-3" color="blue" :loading="btnLoading" :disabled="btnLoading" @click="goClosePanel">{{$t('web.Closing')}}</v-btn>
                  </v-row>
                </v-col>
              </v-row>

              <v-row class="mt-3" v-if="tokenToContractData.borrower.position>0">
                <!--平空-->
                <v-col>
                  <v-row class="ml-1 mb-1 align-center">
                    <h4>{{tokenToContractData.borrower.tradeType}}</h4>
                    <h5 class="ml-2 font-weight-light">{{tokenToContractData.borrower.date}}</h5>
                  </v-row>
                  <v-divider/>
                  <v-row dense class="mt-2 shrink caption">

                    <v-col class="pt-0">
                      {{$t('web.Position')}}: {{tokenToContractData.borrower.wadNet}}
                    </v-col>
                    <v-col class="pt-0 pl-0">
                      {{$t('web.PositionPrice')}}: {{tokenToContractData.borrower.price}}
                    </v-col>
                    <v-col class="pt-0 pl-0">
                      {{$t('web.MarginCloseout')}}: {{Math.floor(tokenToContractData.borrower.forced * 10000) / 10000}}
                    </v-col>

                  </v-row>
                  <v-row dense class="pt-0 mt-0 desc caption">

                    <v-col>
                      {{$t('web.MarketPrice')}}: {{ethPrice}}
                    </v-col>
                    <v-col class="pl-0">
                      {{$t('web.ROE')}}: {{Math.floor(tokenToContractData.borrower.breakRate * 100) / 100}}%
                    </v-col>
                    <v-col class="pl-0">
                      {{$t('web.Profit')}}: {{Math.floor(tokenToContractData.borrower.breakValue * 10000) / 10000}}
                    </v-col>
                  </v-row>
                  <v-row class="pb-0 mt-3 mb-0 justify-end">
                    <v-btn outlined width="99" class="mr-3 white--text" color="blue" @click="goClosePanel" :loading="btnLoading" :disabled="btnLoading">{{$t('web.Closing')}}</v-btn>
                  </v-row>
                </v-col>
              </v-row>

            </v-tab-item>

            <!--平仓-->
            <v-tab-item>
              <v-row class="mt-5 px-0">
                  <v-col>

                    <h4 class="mt-9">{{$t('web.LongClosing')}} USDT</h4>
                    <v-divider/>

                    <v-row class="mt-1 align-center">
                      <v-col class="pr-0" >
                        <h6 class="font-weight-light">{{ $t('web.Position') }}: {{tokenFromContractData.borrower.position}}</h6>
                      </v-col>
                      <v-col class="px-0" >
                        <h6 class="font-weight-light">{{ $t('web.PositionPrice')}}: {{tokenFromContractData.borrower.price}}</h6>
                      </v-col>
                      <v-col class="px-0" >
                        <h6 class="font-weight-light">{{ $t('web.MarketPrice') }}: {{ethShortPrice}}</h6>
                      </v-col>
                      <v-col class="px-0" >
                        <h6 class="font-weight-light">{{ $t('web.Profit')}}: {{Math.floor(tokenFromContractData.borrower.breakValue * 10000 ) / 10000}}</h6>
                      </v-col>
                    </v-row>

                    <!--平多-->
                    <v-row class="pb-0 mt-5 mb-0">
                      <v-col>
                        <v-text-field
                            v-model="inputSell"
                            label="ETH"
                            @input="inputSellCheck"
                            :error="inputSellError"
                            :error-messages="inputSellErrorMsg"
                            placeholder="0.0"
                            type="number"
                            outlined
                            :hint="inputSellHint"
                        >
                        </v-text-field>
                        <v-row class="justify-end">
                          <v-btn outlined min-width="99" class="mt-2 mr-3 white--text" color="blue" @click="loanCloseRepay" :loading="btnLoading" :disabled="btnLoading">{{$t('web.LongClosing')}}
                          </v-btn>
                        </v-row>
                      </v-col>

                      <!---->

<!--                      <v-col class="pl-0">-->
<!--                        <v-text-field-->
<!--                            v-model="inputRepayQty"-->
<!--                            label="还款 USDT"-->
<!--                            @input="InputRepayQtyCheck"-->
<!--                            :error="inputRepayQtyError"-->
<!--                            :error-messages="inputRepayQtyErrorMsg"-->
<!--                            placeholder="0.0"-->
<!--                            type="number"-->
<!--                            outlined-->
<!--                        >-->
<!--                        </v-text-field>-->
<!--                        <v-btn outlined width="99" class="mt-3 white&#45;&#45;text" color="blue" @click="loanRepay" :loading="btnLoading" :disabled="btnLoading">还款-->
<!--                        </v-btn>-->
<!--                        <v-btn outlined width="99" class="mt-3 white&#45;&#45;text" color="blue" @click="loanRepayTest" :loading="btnLoading" :disabled="btnLoading">test-->
<!--                        </v-btn>-->
<!--                      </v-col>-->

                      <!---->

                    </v-row>
                  </v-col>
              </v-row>

              <v-row>
                <v-col>
                    <!--平空-->
                    <h4 class="mt-9">{{$t('web.ShortClosing')}} ETH</h4>
                    <v-divider/>
                    <v-row class="mt-1 align-center">
                      <v-col class="pr-0">
                        <h6 class="font-weight-light"> {{ $t('web.Position') }}: {{tokenToContractData.borrower.wadNet}}</h6>
                      </v-col>
                      <v-col class="px-0">
                        <h6 class="font-weight-light">{{ $t('web.PositionPrice')}}: {{tokenToContractData.borrower.price}}</h6>
                      </v-col>
                      <v-col class="px-0">
                        <h6 class="font-weight-light">{{ $t('web.MarketPrice') }}: {{ethPrice}}</h6>
                      </v-col>
                      <v-col class="px-0">
                        <h6 class="font-weight-light">{{ $t('web.Profit')}}: {{Math.floor(tokenToContractData.borrower.breakValue * 10000 ) / 10000}}</h6>
                      </v-col>
                    </v-row>
                    <v-row class="pb-0 mt-5 mb-0">
                      <v-col>
                        <v-text-field
                            v-model="inputShortClose"
                            label="ETH"
                            @input="inputShortCloseCheck"
                            :error="inputShortCloseError"
                            :error-messages="inputShortCloseErrorMsg"
                            placeholder="0.0"
                            type="number"
                            outlined
                            :hint="inputShortCloseHint"
                        >
                        </v-text-field>
                        <v-row class="justify-end">
                          <v-btn outlined min-width="99" class="mt-2 mr-3 white--text" color="blue" @click="shortCloseRepay" :loading="btnLoading" :disabled="btnLoading">{{$t('web.ShortClosing')}}</v-btn>
                        </v-row>
                      </v-col>

<!--                      <v-col class="pl-0">-->
<!--                        <v-text-field-->
<!--                            v-model="inputRepayShort"-->
<!--                            label="还款 ETH"-->
<!--                            @input="InputRepayShortCheck"-->
<!--                            :error="inputRepayShortError"-->
<!--                            :error-messages="inputRepayShortErrorMsg"-->
<!--                            placeholder="0.0"-->
<!--                            type="number"-->
<!--                            outlined-->
<!--                        >-->
<!--                        </v-text-field>-->
<!--                        <v-btn outlined width="99" class="mt-3 white&#45;&#45;text" color="blue" @click="shortRepay" :loading="btnLoading" :disabled="btnLoading">还款-->
<!--                        </v-btn>-->
<!--                      </v-col>-->

                    </v-row>
                  </v-col>
              </v-row>

            </v-tab-item>

          </v-tabs-items>

          <v-row class="mt-5 mb-1" style="background: #F9F9FE; height: 1rem"></v-row>

          <v-chip
              class="ml-n4 mt-5" style="height: 19px"
              color="blue"
              outlined
          >
            {{$t('web.Record')}}
          </v-chip>

          <!-- 表头     -->
          <v-row class="text-button mt-5">
            <v-col>{{$t('web.Type')}}</v-col>
            <v-col>{{$t('web.Token')}}</v-col>
            <v-col>{{$t('web.Volume')}}</v-col>
            <v-col>{{$t('web.Price')}}</v-col>
          </v-row>
          <!--数据          -->
          <v-col class="px-0"
                 v-for="(item, i) in tableDesserts"
                 :key="i"
          >
            <v-divider/>
            <v-row class="text-caption font-weight-light" >
              <v-col >{{item.tradeType}}</v-col>
              <v-col >{{item.tokenOut}}</v-col>
              <v-col >{{item.outQty}}</v-col>
              <v-col >{{item.price}}</v-col>
            </v-row>
            <div class="text-caption font-weight-light">{{item.sysTime}}</div>
          </v-col>

        </v-col>
      </v-row>
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
import IrouterPath from '@/contract/router/interface'
import Iusers from '@/contract/users/interface'
import axios from 'axios'
import {
  Icontract,
  containerPack,
  ellipsisString,
  tradeTypeUnPack,
  tradeType,
  isStrEmpty,
} from '@/common'

export default {
  name: "LoanContract",
  data: () => ({
    loanBaseInfo: {}, // 杠杆合约的基础信息
    loanUsdtBalance: '', // 合约代币余额(usdt)
    loanEthBalance: '', // eth合约流动性余额
    defaultAccount: '',
    assetsAccount: '',
    ethPrice: '', // 买入价格
    ethShortPrice: '', // 卖出价格
    assetsBalance: {ETH: {meta: 0, format: 0}, USDT: {meta: 0, format: 0}}, // 资产货币余额
    tokenBalanceNet: 0, // usdt净值(减去因借代增加的的值)
    ethBalanceNet: 0, // eth净值(减去因借代增加的的值)
    inputQty: '', // 开多仓
    inputQtyError: false,
    inputQtyErrorMsg: '',
    inputShort: '', // 开空仓
    inputShortError: false,
    inputShortErrorMsg: '',
    inputSell: '', // 平多仓
    inputSellError: false,
    inputSellErrorMsg: '',
    inputSellHint: '', //用于显示卖出所得USDT
    inputRepayQty: '',
    inputRepayQtyError: false,
    inputRepayQtyErrorMsg: '',
    inputShortClose: '', // 平空仓
    inputShortCloseError: false,
    inputShortCloseErrorMsg: '',
    inputShortCloseHint: '', //用于显示卖出所得USDT
    inputRepayShort: '',
    inputRepayShortError: false,
    inputRepayShortErrorMsg: '',
    myRate: 0, // 我的应还利息 usdt
    myRateEth: 0, // 我的应还利息 ETH
    tokenFromSymbol: 'USDT',
    tokenToSymbol: 'ETH',
    tokenFrom:{symbol: 'USDT', address: ''},
    tokenTo:{symbol: 'ETH', address: ''},
    tokenFromContractData: {borrower:{userShort: '', price: '', wad: '', forced:'', repay: '', position: 0, breakValue: 0, breakRate: 0}},
    tokenToContractData: {borrower:{userShort: '', price: '', wad: '', forced:'', repay: '', position: 0, breakValue: 0, breakRate: 0}},
    pairArray: ['USDT-ETH'],
    selectPair: 'USDT-ETH',
    tab: 'contractTab',
    leveraged: 10, // 默认杠杆
    OpenMax: 10, //单次开仓限额 10 eth 可用于开多和开空
    buyInputCheck:{max: 0,min: 0}, // 买入框输入检查值
    shortInputCheck:{max: 0,min:0}, // 卖出框输入检查值
    sliderError: false,
    sliderErrorMessages: '',
    btnLoading: false,
    btnDisabled: false,
    token_from_reserves: '',
    token_to_reserves: '',
    SwapHint:{forward:'0',backward:'0',gas:'0',gasDollar:'0.77'},
    SnackbarShow: false,
    vSnackbar:{type:'success', text: 'ok'}, // 用于显示 公用提示信息 type=[info,success,warning,error]
    tableHeaders: [
      {text: '日期', sortable: false, value: 'sysTime'},
      {text: '类型', sortable: false, value: 'tradeType'},
      {text: '币种', sortable: false, value: 'tokenOut'},
      {text: '数量', sortable: false, value:'outQty'},
      {text: '价格', sortable: false, value: 'price'}
    ],
    tableDesserts: [{sysTime: '', tradeType: '', tokenOut: '', outQty: '', price: ''}]
  }),
  filters: {
    ellipsis(value) {
      if (!value) return ''
      if (value.length > 20) {
        return value.slice(0, 8) + '...' + value.slice(-5)
      }
      return value
    }
  },
  computed: {

    // 杠杆多段变色
    sliderColor: function () {
      if (this.leveraged < 4) return 'blue'
      if (this.leveraged < 7) return 'orange'
      console.log('sliderColor')
      return 'red'
    },

    // 杠杆融资金额(代币usdt)
    // 取当前余额整数部分*杠杆
    // loanValue: function () {
    //   console.log('loanValue', this.leveraged, this.leveraged * parseInt(this.tokenBalance))
    //   return this.leveraged * parseInt(this.tokenBalance)
    // },

    // 加杠杆后的最大可交易的ETH
    // maxBuyEth: function () {
    //   // 无杠杆
    //   let res = Math.floor((this.tokenBalance / this.ethPrice) * 10000) / 10000
    //   // 加杠杆
    //   if (this.leveraged > 0) {
    //     res = Math.floor((this.leveraged * this.tokenBalance / this.ethPrice) * 10000) / 10000
    //   }
    //   console.log('maxBuyEth', this.leveraged, res)
    //   return res
    // }

  },
  mounted() {
    this.init()
  },
  methods: {
    goMyAccount() {
      this.$router.push('/myAccount')
    },
    // 开仓杠杆滑动检查
    sliderCheck() {
      if (this.assetsBalance.USDT.format === 0) {
        alert(this.tokenFromSymbol + ' balance 0')
        console.log(this.tokenFromSymbol, 'balance 0')
      } else {
        if (this.leveraged * this.assetsBalance.USDT.format > this.loanUsdtBalance) {
          this.sliderError = true
          this.sliderErrorMessages = this.$t('error.OverContract')
          // this.leveraged = this.leveraged - 1
        } else {
          this.sliderError = false
          this.sliderErrorMessages = ''
        }
      }
    },

    // 开多 输入检查
    InputQtyCheck() {

      if (this.tokenBalanceNet===0 || this.tokenBalanceNet==='0') {
        this.inputQtyError = true
        this.inputQtyErrorMsg = this.$t('error.NotAsset')
        return
      }

      if (this.inputQty > this.buyInputCheck.max) {
        this.inputQtyError = true
        this.inputQtyErrorMsg = this.$t('error.OverMax') + this.buyInputCheck.max.toString()
        return
      }

      if (this.inputQty > this.OpenMax) {
        this.inputQtyError = true
        this.inputQtyErrorMsg = this.$t('error.OverOpenMax') + this.OpenMax.toString()
        return
      }

      if (this.inputQty > this.token_from_reserves) {
        this.inputQtyError = true
        this.inputQtyErrorMsg = this.$t('error.OverPair') + this.token_from_reserves.toString()
        return
      }

      if ((this.inputQty * this.ethPrice) > this.loanUsdtBalance) {
        this.inputQtyError = true
        this.inputQtyErrorMsg = this.$t('error.OverContract')
        return
      }

      this.inputQtyError = false
      this.inputQtyErrorMsg = ''
    },

    // 开空仓 输入检查
    inputShortCheck() {

      // console.log('short input check')
      if (this.ethBalanceNet===0 || this.ethBalanceNet === '0') {
        this.inputShortError = true
        this.inputShortErrorMsg = this.$t('error.NotAsset')
        return
      }

      if (this.inputShort > this.shortInputCheck.max) {
        this.inputShortError = true
        this.inputShortErrorMsg = this.$t('error.OverMax') + this.shortInputCheck.max.toString()
        return
      }

      if (this.inputShort > this.OpenMax) {
        this.inputShortError = true
        this.inputShortErrorMsg = this.$t('error.OverOpenMax') + this.OpenMax.toString()
        return
      }

      if (this.inputShort > this.token_from_reserves) {
        this.inputShortError = true
        this.inputShortErrorMsg = this.$t('error.OverPair') + this.token_from_reserves.toString()
        return
      }

      if (parseFloat(this.inputShort) > parseFloat(this.loanEthBalance)) {
        this.inputShortError = true
        this.inputShortErrorMsg = this.$t('error.OverContract') + this.loanEthBalance.toString()
        return
      }

      this.inputShortError = false
      this.inputShortErrorMsg = ''
    },

    // 平多卖出输入检查
    async inputSellCheck() {

      if (isStrEmpty(this.inputSell)) {
        // 无值
        this.inputSellError = false
        this.inputSellErrorMsg = ''
        return
      }

      if (parseFloat(this.inputSell.toString())<0) {
        this.inputSellError = true
        this.inputSellErrorMsg = this.$t('error.InvalidValue')
        return
      }

      if (isStrEmpty(this.tokenFromContractData.borrower.position) || (this.tokenFromContractData.borrower.position) === 0) {
        this.inputSellError = true
        this.inputSellErrorMsg = this.$t('error.NotPosition')
        return
      }

      if (this.inputSell > this.tokenFromContractData.borrower.position) {
        this.inputSellError = true
        this.inputSellErrorMsg = this.$t('error.OverPosition') + this.tokenFromContractData.borrower.position.toString()
        return
      }

      let inputSellWei = window.web3js.utils.toWei(this.inputSell.toString())

      // 卖出数量不能超出账号余额
      if (BigInt(this.assetsBalance.ETH.meta) < (BigInt(inputSellWei) + BigInt(this.$store.state.retentionEth))) {
        this.inputSellError = true
        this.inputSellErrorMsg = this.$t('error.OverBalanceByClose') + this.assetsBalance.ETH.format
        return
      }

      this.inputSellError = false
      this.inputSellErrorMsg = ''

      if (!isStrEmpty(this.inputSell.toString()) && parseFloat(this.inputSell.toString())>0) {

        // 显示卖出所得
        // 平仓的路径与开仓相反
        let tokenFrom = Icontract.getSelectToken(this.tokenToSymbol, this.$store.state.defaultNetwork)
        let tokenTo = Icontract.getSelectToken(this.tokenFromSymbol, this.$store.state.defaultNetwork)

        let that = this
        IrouterPath.methods.getReserves(tokenFrom.address, tokenTo.address)
            .then(function (response1) {
              let token0_reserves = response1[0].toString()
              let token1_reserves = response1[1].toString()
              IrouterPath.methods.getAmountOut(inputSellWei.toString(), token0_reserves.toString(), token1_reserves.toString())
                  .then(function (response2) {
                    let res = window.web3js.utils.fromWei(response2.toString())
                    let amountOut = Math.floor(res * 10000) / 10000

                    that.inputSellHint = amountOut.toString()

                  })
            })
            .catch(Error => {
              alert(that.token_from_select + '-' + that.token_to_select + that.$t('error.NotPair'))
              console.log('getReserves error', Error)
            })
      } else {
        this.inputSellHint = ''
      }

    },

    // 平多还款输入检查
    InputRepayQtyCheck() {

      console.log('input', this.inputRepayQty.toString())

      if (isStrEmpty(this.inputRepayQty.toString())) {
        return
      }

      if (parseFloat(this.inputRepayQty.toString()) <= 0) {
        this.inputRepayQtyError = true
        this.inputRepayQtyErrorMsg = this.$t('error.InvalidValue')
        return
      }

      if (parseFloat(this.inputRepayQty.toString()) > parseFloat(this.assetsBalance.USDT.format)) {
        this.inputRepayQtyError = true
        this.inputRepayQtyErrorMsg = '还款数量不可大于你的余额' + this.assetsBalance.USDT.format.toString()
        return
      }

      if (isStrEmpty(this.tokenFromContractData.borrower) || (parseFloat(this.tokenFromContractData.borrower.wad) - parseFloat(this.tokenFromContractData.borrower.repay)) === 0) {
        alert('你没有需要归还的款项')
      } else {

        if (parseFloat(this.inputRepayQty.toString()) > parseFloat(this.tokenFromContractData.borrower.wadNet.toString())) {
          this.inputRepayQtyError = true
          this.inputRepayQtyErrorMsg = '还款数量不可大于您的欠款' + this.tokenFromContractData.borrower.wadNet.toString()
          return
        }

      }

      this.inputRepayQtyError = false
      this.inputRepayQtyErrorMsg = ''
    },

    // 平空买入输入检查
    async inputShortCloseCheck() {

      if (isStrEmpty(this.inputShortClose)) {
        // 无值
        this.inputShortCloseError = false
        this.inputShortCloseErrorMsg = ''
        return
      }

      if (parseFloat(this.inputShortClose.toString())<0) {
        this.inputShortCloseError = true
        this.inputShortCloseErrorMsg = this.$t('error.InvalidValue')
        return
      }

      if (isStrEmpty(this.tokenToContractData.borrower.wadNet) || this.tokenToContractData.borrower.wadNet === 0) {
        this.inputShortCloseError = true
        this.inputShortCloseErrorMsg = this.$t('error.NotPosition')
        return
      }

      if (this.inputShortClose > this.tokenToContractData.borrower.wadNet) {
        this.inputShortCloseError = true
        this.inputShortCloseErrorMsg = this.$t('error.OverPosition') + this.tokenToContractData.borrower.wadNet.toString()
        return
      }

      this.inputShortCloseError = false
      this.inputShortCloseErrorMsg = ''

      if (!isStrEmpty(this.inputShortClose.toString()) && parseFloat(this.inputShortClose.toString())>0) {
        let inputShortCloseWei = window.web3js.utils.toWei(this.inputShortClose.toString())

        // 显示卖出所得
        // 平仓的路径与开仓相反
        let tokenFrom = Icontract.getSelectToken(this.tokenFromSymbol, this.$store.state.defaultNetwork)
        let tokenTo = Icontract.getSelectToken(this.tokenToSymbol, this.$store.state.defaultNetwork)

        let that = this
        IrouterPath.methods.getReserves(tokenTo.address, tokenFrom.address)
            .then(function (response1) {
              let token0_reserves = response1[0].toString()
              let token1_reserves = response1[1].toString()

              IrouterPath.methods.getAmountIn(inputShortCloseWei.toString(), token0_reserves.toString(), token1_reserves.toString())
                  .then(function (response2) {
                    let res = window.web3js.utils.fromWei(response2.toString())
                    let amountOut = Math.floor(res * 10000) / 10000

                    that.inputShortCloseHint = amountOut.toString()

                  })
            })
            .catch(Error => {
              alert(that.token_from_select + '-' + that.token_to_select + that.$t('error.NotPair'))
              console.log('getReserves error', Error)
            })
      } else {
        this.inputShortCloseHint = ''
      }
    },

    // 平空还款输入检查
    InputRepayShortCheck() {

      if (this.inputRepayShort.toString() === '' || window.web3js.utils.toWei(this.inputRepayShort.toString()) === '0') {
        return
      }

      if (isStrEmpty(this.tokenToContractData.borrower) || this.tokenToContractData.borrower.position === 0) {
        alert(this.$t('error.NotPosition'))
      } else {

        if (this.inputRepayShort > this.tokenToContractData.borrower.position) {
          this.inputRepayShortError = true
          this.inputRepayShortErrorMsg = this.$t('error.OverPosition')
          return
        }
      }
      this.inputRepayShortError = false
      this.inputRepayShortErrorMsg = ''
    },

    async init() {

      let net_version = await Icontract.checkMetaMask()
      console.log('init net version:', net_version)
      if (net_version === this.$store.state.defaultNetwork) {

        Iusdt.methods.init(this.$store.state.ContractAddress.USDT)
        IrouterPath.methods.init(this.$store.state.ContractAddress.router)
        IloanUSDT.methods.init(this.$store.state.ContractAddress.loanUSDT)
        IloanEth.methods.init(this.$store.state.ContractAddress.loanETH)
        Iusers.methods.init(this.$store.state.ContractAddress.Users)

        // 取metamask当前账号
        this.defaultAccount = this.$store.state.metamask.account

        if (this.defaultAccount !== '') {
          await this.updateStaticData()

          //usdt 动态数据
          await this.updateDynamicData()

        }
      }
    },

    // 下方交易提示信息
    async getSwapHint() {
      // forward
      let unit = '1000000000000000000' // wei

      let pathForward = [this.tokenFrom.address, this.tokenTo.address]
      let pathBackward = [this.tokenTo.address, this.tokenFrom.address]
      // 确保以ETH在前为正向交换
      if (this.tokenFrom.symbol.indexOf('ETH') < 0) {
        pathForward = [this.tokenTo.address, this.tokenFrom.address]
        pathBackward = [this.tokenFrom.address, this.tokenTo.address]
      }
      // 取交易对两币种的单价
      let getAmountsOutForward = await IrouterPath.methods.getAmountsOut(unit.toString(), pathForward)
      let getAmountsOutBackward = await IrouterPath.methods.getAmountsOut(unit.toString(), pathBackward)
      let ForwardValue = Math.floor(window.web3js.utils.fromWei(getAmountsOutForward[1].toString()) * 10000) / 10000
      let BackwardValue = Math.floor(window.web3js.utils.fromWei(getAmountsOutBackward[1].toString()) * 1000000) / 1000000
      this.SwapHint.forward = ForwardValue
      this.SwapHint.backward = BackwardValue

      // 根据当前行情取eth兑usdt汇率 计算Gas费
      // let rate = await this.$http.get('/')
      let gasPrice = await window.web3js.eth.getGasPrice()
      let gas = this.$store.state.gasDef.low * window.web3js.utils.fromWei(gasPrice.toString())
      this.SwapHint.gas= Math.floor(gas * 10000) / 10000
      // this.SwapHint.gasDollar =Math.floor( this.SwapHint.gas * rate.data.close * 100) / 100
      // console.log('gas', rate.usd, gasPrice, this.SwapHint)
    },

    // 记录存入数据库
    postMyLeverageRecord(owner, account, principal, lever, tradeType, tokenIn, tokenOut, inQty, outQty, price, status) {
      let urlHeader = 'https://www.opswap.io/webapi/api/Leverage?'

      let url = urlHeader + 'owner=' + owner + '&account=' + account + '&principal=' + principal + '&lever=' + lever + '&tradeType=' + tradeType + '&tokenIn=' + tokenIn + '&tokenOut=' + tokenOut + '&inQty=' + inQty + '&outQty=' + outQty + '&price=' + price +'&status=' + status
      axios.post(url)
          .then(function (Response) {
            console.log('post Leverage', Response)
          })
          .catch(Error => {
            console.log('post error', Error)
          })
    },

    // 取交易记录
    getMyLeverageRecord(myAccount) {
      let url = 'https://www.opswap.io/webapi/api/Leverage?account=' + myAccount.toString()
      let that = this
      axios.get(url).then(function (Response) {
            let table = JSON.parse(Response.data).Table
            let tableLength = table.length
            if (tableLength > 0) {
              // 先清空数组
              that.tableDesserts.splice(0, that.tableDesserts.length)

              for (let i = 0; i < tableLength; i++) {
                if (table[i].tokenIn !== null && table[i].tokenOut !== null && table[i].tokenIn !== '' && table[i].tokenOut !== '') {

                  let record = {
                    sysTime: table[i].sysTime,
                    owner: table[i].owner,
                    account: table[i].account,
                    accountShort: ellipsisString(table[i].account.toString(), 7, 5),
                    principal: table[i].principal,
                    lever: table[i].lever,
                    tradeType: tradeTypeUnPack(table[i].tradeType),
                    tokenIn: table[i].tokenIn,
                    tokenOut: table[i].tokenOut,
                    inQty: table[i].inQty,
                    outQty: Math.floor( window.web3js.utils.fromWei(table[i].outQty.toString()) * 10000) / 10000,
                    price: Math.floor(window.web3js.utils.fromWei(table[i].price.toString()) * 10000) / 10000,
                    status: table[i].status
                  }
                  that.tableDesserts.push(record)
                }
              }
            }
          })
          .catch(error => {
            console.log('getMyLeverageRecord error', error)
          })
    },

    async updateStaticData() {

      // this.tokenFromSymbol = await Iusdt.methods.symbol()

      this.loanBaseInfo = await IloanUSDT.methods.getStaticData()

      // 检查上是否有平台账号
      this.assetsAccount = await Iusers.methods.getMyAccount(this.defaultAccount)

    },

    // 加多
    testBtn(){
      console.log('test111', this.tokenFromContractData.borrower.position, this.tokenFromContractData.borrower)
      // 原持仓成本
      let acost = this.tokenFromContractData.borrower.price * this.tokenFromContractData.borrower.position
      // 现成本
      let bcost = this.test.bprice * this.test.bqty
      // 总持仓
      let countQty = BigInt(this.tokenFromContractData.borrower.position) + BigInt(this.test.bqty)
      // 原成本+现成本 / 总数量
      let newPrice = (BigInt(acost) + BigInt(bcost)) / BigInt(countQty)
      //
      console.log('test222 lever', acost, bcost, countQty, newPrice)
    },

    // 加空
    testBtn2(){
      // 原持仓成本
      let acost = this.test.aprice * this.test.aqty
      // 现成本
      let bcost = this.test.bprice * this.test.bqty
      // 总持仓
      let countQty = BigInt(this.test.aqty) + BigInt(this.test.bqty)
      // 原成本+现成本 / 总数量
      let newPrice = (BigInt(acost) + BigInt(bcost)) / BigInt(countQty)
      console.log('test111',this.test)
      console.log('test222 lever', acost, bcost, countQty, newPrice)
    },

    // 减多
    testBtn3(){
      // 原持仓成本
      let acost = this.tokenToContractData.borrower.price * this.tokenToContractData.borrower.position
          // 现成本
      let bcost = this.test.bprice * this.test.bqty
      // 总持仓
      let countQty = this.tokenToContractData.position - this.test.bqty
      // 原成本+现成本 / 总数量
      let newPrice = (acost - bcost) / countQty
      console.log('test111',this.test, this.tokenToContractData.borrower.position, this.tokenToContractData.borrower)
      console.log('test222 lever', acost, bcost, countQty, newPrice)
    },

    // 减空
    testBtn4(){

      this.SnackbarShow = true
      this.vSnackbar = {type:"success",text: this.$t('web.Closing') + this.$t('web.Success')}

    },

    // 更新界面动态数据
    async updateDynamicData() {
      console.log('updateDynamicData')

      let tokenFrom = Icontract.getSelectToken(this.tokenFrom.symbol, this.$store.state.defaultNetwork)
      let tokenTo = Icontract.getSelectToken(this.tokenTo.symbol, this.$store.state.defaultNetwork)
      this.tokenFrom.address = tokenFrom.address
      this.tokenTo.address = tokenTo.address

      // usdt合约余额
      this.loanUsdtBalance = await IloanUSDT.methods.getTokenBalance()
      // ETH合约余额
      this.loanEthBalance = await IloanEth.methods.getBalance()

      // 取当前配对token的储备量
      let pathBuy = [this.tokenFrom.address, this.tokenTo.address]
      let pathShort = [this.tokenTo.address, this.tokenFrom.address]

      if (this.tokenFrom.address !== '' && this.tokenTo.address !== '') {

        // 加载交易提示信息
        await this.getSwapHint()

        let reservesRes = await IrouterPath.methods.getReserves(this.tokenFrom.address, this.tokenTo.address)
        if (!isStrEmpty(reservesRes)) {
          let token0_reserves = reservesRes[0].toString()
          this.token_from_reserves = Math.floor(window.web3js.utils.fromWei(token0_reserves) * 10000) / 10000
          let token1_reserves = reservesRes[1].toString()
          this.token_to_reserves = Math.floor(window.web3js.utils.fromWei(token1_reserves) * 10000) / 10000
        }

        // get price
        // 以1为单位求当前交易对的单价(买入价和卖出价)
        let amountOut = window.web3js.utils.toWei('1')
        // 买入价 USDT -> ETH
        let getAmountsInRes = await IrouterPath.methods.getAmountsIn(amountOut.toString(), pathBuy)
        // 卖出价 ETH -> USDT
        let getAmountsOutRes = await IrouterPath.methods.getAmountsOut(amountOut.toString(), pathShort)

        // let getAmountInRes = await IrouterPath.methods.getAmountIn(amountOut.toString(), token1_reserves, token0_reserves)
        // // 以1为单位求当前交易对的单价(卖出价)
        // let getAmountOutRes = await IrouterPath.methods.getAmountOut(amountOut.toString(), token0_reserves, token1_reserves)
        // 买入价 usdt -> ETH
        if (getAmountsInRes.length > 0) {
          let res = window.web3js.utils.fromWei(getAmountsInRes[0].toString())
          this.ethPrice = Math.floor(res * 10000) / 10000
          console.log('buy price', this.ethPrice)
        }

        // 卖出价 ETH -> USDT
        if (getAmountsOutRes.length > 0) {
          let res = window.web3js.utils.fromWei(getAmountsOutRes[1].toString())
          this.ethShortPrice = Math.floor(res * 10000) / 10000
          console.log('short price', this.ethShortPrice)
        }
      }

      // 检查上是否有平台账号
      if (isStrEmpty(this.assetsAccount) || this.assetsAccount.owner!==this.defaultAccount ) {
        this.assetsAccount = await Iusers.methods.getMyAccount(this.defaultAccount)
        if (isStrEmpty(this.assetsAccount)) {
          alert(this.$t('error.NotAsset'))
          return
        }
      }

      if (!isStrEmpty(this.assetsAccount)) {

        let getMyETHBalanceRes = await Icontract.getBalanceOf(this.assetsAccount.address)
        if (!isStrEmpty(getMyETHBalanceRes)) {
          // console.log('getMyETHBalanceRes', getMyETHBalanceRes)
          this.assetsBalance.ETH.meta = getMyETHBalanceRes.meta
          this.assetsBalance.ETH.format = getMyETHBalanceRes.format

          // 计算最大卖出量(按默认倍数杠杆算) + 2 以避免溢出
          // this.maxShortEth = Math.floor((this.leveraged * this.EthBalance) * 10000) / 10000
        }

        // get balance
        let balanceRes = await Iusdt.methods.balanceOf(this.assetsAccount.address)

        if (!isStrEmpty(balanceRes)) {
          // console.log('balanceRes', balanceRes)
          this.assetsBalance.USDT.meta = balanceRes.meta
          this.assetsBalance.USDT.format = balanceRes.format
          // 根据可用量计算最大买入量(按默认倍数杠杆算)
          // that.maxBuyEth = Math.floor(this.tokenBalance / that.ethPrice) * 10000 / 10000
        }

        // 加载USDT合约借款记录
        this.tokenFromContractData.borrower = await IloanUSDT.methods.getBorrowerRecord(this.assetsAccount.address)
        // console.log('usdt borrow', this.tokenFromContractData.borrower)

        //加载ETH借款记录
        this.tokenToContractData.borrower = await IloanEth.methods.getBorrowerRecord(this.assetsAccount.address)
        // console.log('eth borrow', this.tokenToContractData.borrower)

        // 整理USDT借款数据
        if (!isStrEmpty(this.tokenFromContractData.borrower) && this.tokenFromContractData.borrower.position>0) {

          // 盈亏
          // ((最新价 * 持仓量) - (持仓价 * 持仓量)) / 最新价
          let breakValue = ((this.ethShortPrice * this.tokenFromContractData.borrower.position) - (this.tokenFromContractData.borrower.price * this.tokenFromContractData.borrower.position)) / this.tokenFromContractData.borrower.price
          // 盈亏值
          this.tokenFromContractData.borrower.breakValue = breakValue
          this.tokenFromContractData.borrower.breakRate = (breakValue / this.tokenFromContractData.borrower.position) * 100

          // 可用资产 需减去已开仓位所占用的资产
          // 当前币种余额 - 持仓所占用的本金
          let UsdtNet = this.assetsBalance.USDT.format - (this.tokenFromContractData.borrower.wadNet / (this.leveraged - 1))
          this.tokenBalanceNet = UsdtNet>0? UsdtNet: 0

          if (!isStrEmpty(this.tokenToContractData.borrower) && this.tokenToContractData.borrower.position>0) {
            // 净值需减去空方借款增加值
            this.tokenBalanceNet = this.tokenBalanceNet - this.tokenToContractData.borrower.position

          }
          // console.log('usdt net', this.tokenBalanceNet, UsdtNet, this.tokenToContractData.borrower)

          if (this.tokenBalanceNet > 0) {
            // 根据可用量计算最大买入量(按默认倍数杠杆算)
            this.buyInputCheck.max = Math.floor(((this.tokenBalanceNet * (this.leveraged - 1)) / this.ethPrice) * 10000) / 10000
            // 最小买入量应大于保证金(即1倍杠杆)
            this.buyInputCheck.min = Math.floor((this.tokenBalanceNet / this.ethPrice) * 10000) / 10000
          }

          // 初始保证金率 = 1 ／ 杠杆倍数  = 1/10=0.1
          // 维持保证金率 = 0.03 = 3%

          // 初始保证金 = (持仓数*开仓均价)／杠杆倍数 =2*3150/10=630 USDT
          let margin = (this.tokenFromContractData.borrower.position * this.tokenFromContractData.borrower.price) / this.tokenFromContractData.borrower.lever
          // 多仓强平价 = ((持仓数*开仓均价) - 初始保证金) / ((1 - 维持保证金率) * 持仓数)
          this.tokenFromContractData.borrower.forced=((this.tokenFromContractData.borrower.position * this.tokenFromContractData.borrower.price) - margin) / ((1-0.03) * this.tokenFromContractData.borrower.position)

          // [(计价货币总资产-计价货币借入资产-计价货币未还利息)/最新成交价+(交易货币总资产-交易货币借入资产-交易货币未还利息)]/(计价货币借入资产/最新成交价+交易货币借入资产)*100%
          // [(9000-0-0)/9710.28+(0-0.6-0.001)]/(0/9710.28+0.6)*100%=54.31%
          // let marginRate = usable / (this.tokenFromContractData.borrower.wad / this.ethShortPrice)

          // 算利息
          let rateUSDT = await IloanUSDT.methods.MyBorrowerRateCount(this.assetsAccount.address, window.web3js.utils.toWei(this.tokenFromContractData.borrower.position.toString()))
          if (rateUSDT !== '') {
            let rate = window.web3js.utils.fromWei(rateUSDT.toString())
            let rateFloor = Math.floor(rate * 10000) / 10000

            // 显示界面利息
            if (this.tokenFromContractData.borrower.position.toString() === this.tokenFromContractData.borrower.wadNet.toString()) {
              this.myRate = rateFloor
            }
          }

        } else {

          this.tokenBalanceNet = this.assetsBalance.USDT.format
          if (this.tokenBalanceNet>0) {

            // 如果有空方借款需减去
            if (!isStrEmpty(this.tokenToContractData.borrower) && this.tokenToContractData.borrower.position > 0) {

              this.tokenBalanceNet = this.tokenBalanceNet - this.tokenToContractData.borrower.position

            }
            // console.log('usdt net ', this.tokenBalanceNet, this.tokenToContractData.borrower.position)
            if (this.tokenBalanceNet > 0) {
              // 根据可用量计算最大买入量(按默认倍数杠杆算)
              this.buyInputCheck.max = Math.floor(((this.tokenBalanceNet * (this.leveraged - 1)) / this.ethPrice) * 10000) / 10000
              // 最小买入量应大于保证金(即1倍杠杆)
              this.buyInputCheck.min = Math.floor((this.tokenBalanceNet / this.ethPrice) * 10000) / 10000
            }
          }

        }

        //整理ETH借款记录
        if (!isStrEmpty(this.tokenToContractData.borrower) && this.tokenToContractData.borrower.position>0) {

          // 盈亏
          // 根据价格算出盈亏比例乘持仓量
          // (持仓价 - 最新价[买入价]) / 持仓价
          let breakRate = (this.tokenToContractData.borrower.price - this.ethPrice) / this.tokenToContractData.borrower.price
          this.tokenToContractData.borrower.breakRate = breakRate * 100
          this.tokenToContractData.borrower.breakValue = breakRate * this.tokenToContractData.borrower.position

          // 可用资产 需减去已开仓位所占用的资产
          // 当前币种余额 - 持仓所占用的本金
          let ETHNet = this.assetsBalance.ETH.format - (this.tokenToContractData.borrower.wadNet / (this.leveraged - 1))
          this.ethBalanceNet = ETHNet>0? ETHNet: 0

          // 如果有多方借款需减去
          if (!isStrEmpty(this.tokenFromContractData.borrower) && this.tokenFromContractData.borrower.position>0) {
            // 净值需减去多方借款增加值
            this.ethBalanceNet = this.ethBalanceNet - this.tokenFromContractData.borrower.position
          }

          if (this.ethBalanceNet > 0) {
            this.shortInputCheck.max = Math.floor(this.ethBalanceNet * (this.leveraged - 1) * 10000) / 10000
            this.shortInputCheck.min = Math.floor(this.ethBalanceNet * 10000) / 10000
          }

          // 初始保证金率 = 1 ／ 杠杆倍数  = 1/10=0.1
          // 维持保证金率 = 0.03 = 3%

          // 初始保证金 = (持仓数*开仓均价)／杠杆倍数 =2*3150/10=630 USDT
          let margin = (this.tokenToContractData.borrower.wadNet * this.tokenToContractData.borrower.price) / this.tokenToContractData.borrower.lever
          // 空仓强平价 = ((持仓数*开仓均价) + 初始保证金) / ((1 + 维持保证金率) * 持仓数)
          this.tokenToContractData.borrower.forced=((this.tokenToContractData.borrower.wadNet * this.tokenToContractData.borrower.price) + margin) / ((1+0.03) * this.tokenToContractData.borrower.wadNet)
          console.log('short forced', margin, this.tokenToContractData.borrower)
          // let forced = this.tokenToContractData.borrower.price + (((this.ethBalanceNet-(this.ethBalanceNet / this.tokenToContractData.borrower.lever)) / this.tokenToContractData.borrower.wadNet) * this.tokenToContractData.borrower.price)
          // this.tokenToContractData.borrower.forced = forced

          // console.log('short forced:', this.ethBalanceNet, this.tokenToContractData.borrower)

          let ethDebtWei = window.web3js.utils.toWei(this.tokenToContractData.borrower.position.toString())
          let rate = await IloanEth.methods.MyBorrowerRateCount(this.assetsAccount.address, ethDebtWei.toString())
          if (rate !== '') {
            let rate2 = window.web3js.utils.fromWei(rate.toString())
            this.myRateEth = Math.floor(rate2 * 10000) / 10000
          }

        } else {
          this.ethBalanceNet = this.assetsBalance.ETH.format

          if (this.ethBalanceNet>0) {

            // 如果有多方借款需减去
            if (!isStrEmpty(this.tokenFromContractData.borrower) && this.tokenFromContractData.borrower.position > 0) {

              this.ethBalanceNet = this.ethBalanceNet - this.tokenFromContractData.borrower.position

            }
            if (this.ethBalanceNet>0) {
              // 根据可用量计算最大买入量(按默认倍数杠杆算)
              this.shortInputCheck.max = Math.floor((this.ethBalanceNet * (this.leveraged - 1)) * 10000) / 10000
              // 最小买入量应大于保证金(即1倍杠杆)
              this.shortInputCheck.min = Math.floor(this.ethBalanceNet * 10000) / 10000
            }

          }
        }

        // 加载交易记录
        this.getMyLeverageRecord(this.assetsAccount.address)
      }
    },

    // load
    /////////////////////////////////

    // 转去平仓选项卡
    goClosePanel() {
      this.tab = 1
    },

    async test1() {

      // 显示提示信息
      this.SnackbarShow=true
      this.vSnackbar={type: this.$store.state.myColor.info, text: 'test'}
      console.log('balance', this.assetsBalance)
      console.log('assets', this.assetsAccount)
      console.log('test0', this.tokenFromContractData.borrower.position, this.tokenFromContractData.borrower)
      console.log('test1', this.tokenToContractData.borrower.position, this.tokenToContractData.borrower)

    },

    // 开多仓
    // 基于用户平台签名账号
    // Gas和交换值均为用户平台账号
    async loanBorrowSign() {
      console.log('买多', this.loanUsdtBalance)

      if (isStrEmpty(this.inputQty) || parseFloat(this.inputQty.toString()) <= 0) {
        this.inputQtyError = true
        this.inputQtyErrorMsg = this.$t('error.InvalidValue')
        return
      }

      if (this.tokenBalanceNet===0 || this.tokenBalanceNet==='0') {
        this.inputQtyError = true
        this.inputQtyErrorMsg = this.$t('error.NotAsset')
        return
      }

      if (this.inputQty > this.OpenMax) {
        this.inputQtyError = true
        this.inputQtyErrorMsg = this.$t('error.OverOpenMax') + this.OpenMax.toString()
        return
      }

      if (this.inputQty > this.buyInputCheck.max) {
        this.inputQtyError = true
        this.inputQtyErrorMsg = this.$t('error.OverMax') + this.buyInputCheck.max.toString()
        return
      }

      if ((this.inputQty * this.ethPrice) > this.loanUsdtBalance) {
        this.inputQtyError = true
        this.inputQtyErrorMsg = this.$t('error.OverContract')
        return
      }

      // 检查上是否有平台账号
      if (isStrEmpty(this.assetsAccount)) {
        alert(this.$t('error.NotAsset'))
        return
      }

      // ETH资产不能空 最少0.01ETH用于Gas检查
      if (parseFloat(this.assetsBalance.ETH.format) < 0.01) {
        alert(this.$t('error.NotETHBalance'))
        return
      }

      let tokenFrom = Icontract.getSelectToken(this.tokenFromSymbol, this.$store.state.defaultNetwork)
      let tokenTo = Icontract.getSelectToken(this.tokenToSymbol, this.$store.state.defaultNetwork)
      let path = [tokenFrom.address, tokenTo.address]

      // 用户输入需要交易的数量ETH
      let tradeValue = window.web3js.utils.toWei(this.inputQty.toString())

      this.btnLoading = true
      this.btnDisabled = true

      let spender = this.$store.state.ContractAddress.router
      let myAllowance = await Iusdt.methods.allowance(this.assetsAccount.address, spender)
      if (isStrEmpty(myAllowance)) {
        alert(this.$t('error.NetworkError'))
        console.log('网络错误未能取得的批准数据')
        this.btnLoading = false
        this.btnDisabled = false
        return
      }

      // 将输入的ETH换算成需借出的USDT
      // 本金不参与交易
      let getAmountsInRes = await IrouterPath.methods.getAmountsIn(tradeValue.toString(), path)
      let amountInMax = getAmountsInRes[0].toString() // 最大输入(借款值) 多的会退回
      if (getAmountsInRes.length===0) {
        this.btnLoading = false
        this.btnDisabled = false
        return
      }

      // console.log('borrow data',this.assetsAccount, path, tradeValue, getAmountsInRes, myAllowance)

      let approveRes = false
      // 没有批准额度则先批准再还款
      if (myAllowance === null || myAllowance === 0 || myAllowance === '0' || BigInt(myAllowance) ===0n) {

        approveRes = await Iusdt.methods.approveSign(this.assetsAccount.address,this.assetsAccount.key,spender,amountInMax)

      } else {
        if (BigInt(myAllowance) < BigInt(amountInMax)) {
          // 先清零在 批准
          let approveSignClear = await Iusdt.methods.approveSign(this.assetsAccount.address, this.assetsAccount.key, spender, '0')
          if (approveSignClear) {
            approveRes = await Iusdt.methods.approveSign(this.assetsAccount.address, this.assetsAccount.key, spender, amountInMax)
          }

        }
      }

      console.log('myAllowance', myAllowance, approveRes)
      if (BigInt(myAllowance) >= BigInt(amountInMax) || approveRes) {

        // 计算所需借款的USDT数量
        // +1 取整 忽略小数
        // let borrow = parseInt((window.web3.utils.fromWei(getAmountsInRes[0]))) + 1
        // let borrowWei = window.web3.utils.toWei(borrow.toString())
        let toAddress = this.assetsAccount.address

        // 原持仓成本
        let acost = 0
        let bcost = this.ethPrice * this.inputQty
        let countQty = parseFloat(this.inputQty.toString())
        // 如果已有持仓 成本价需要计算原有持仓
        if (!isStrEmpty(this.tokenFromContractData.borrower)) {
          // 开仓或加仓时计算持仓成本价
          // 原持仓成本
          acost = this.tokenFromContractData.borrower.price * this.tokenFromContractData.borrower.position
          // 总持仓
          countQty = parseFloat(this.tokenFromContractData.borrower.position.toString()) + parseFloat(this.inputQty.toString())

        }

        // 持仓成本价= 原成本+现成本 / 总数量
        let countPrice = (parseFloat(acost.toString()) + parseFloat(bcost.toString())) / countQty
        let price = window.web3js.utils.toWei(countPrice.toString())

        // 默认状态为正常 1
        let container = containerPack('1', this.leveraged, tradeType.loan)

        // [弃用]本金占用 = 为当前余额 + 杠杆资金 + 1倍杠杆占用金
        // let cost = (this.buyInputCheck.netBalance / this.leveraged) + (this.buyInputCheck.netBalance * (this.inputQty / this.buyInputCheck.max))
        let cost = 0

        // 借款
        let borrowRes = await IloanUSDT.methods.borrow(this.defaultAccount, cost, amountInMax, tradeValue, toAddress, price.toString(), container)
        if (!isStrEmpty(borrowRes)) {

          if (amountInMax !== '0' && amountInMax > 0) {
            let swapTokensForExactETHRes = await IrouterPath.methods.swapTokensForExactETHSign(toAddress, this.assetsAccount.key, tradeValue.toString(), amountInMax.toString(), path, toAddress)

            if (swapTokensForExactETHRes) {
              let parameter = {
                owner: this.defaultAccount,
                account: this.assetsAccount.address,
                principal: this.assetsBalance.USDT.format,
                lever: this.leveraged,
                tradeType: tradeType.loan, // 10开多 11 平多 20开空 21平多
                tokenIn: tokenFrom.symbol,
                tokenOut: tokenTo.symbol,
                inQty: amountInMax,
                outQty: tradeValue,
                price: price,
                status: '1'
              }

              // 交易记录保存到数据库并刷新界面
              await this.postMyLeverageRecord(parameter.owner, parameter.account, parameter.principal, parameter.lever, parameter.tradeType, parameter.tokenIn, parameter.tokenOut, parameter.inQty, parameter.outQty, parameter.price, parameter.status)
              await this.updateDynamicData()

            }
          }
        }
      } else {
        alert(this.$t('error.TFailure'))
        console.log('开多失败', myAllowance, approveRes)
      }
      this.btnLoading = false
      this.btnDisabled = false
    },

    // 开多仓
    // 基于metamask 当前账号弹窗
    // Gas和交易对象均为当前账号
    async loanBorrowLocal() {
      console.log('买多')

      if (this.inputQty === 0 || this.inputQty === '') {
        this.inputQtyError = true
        this.inputQtyErrorMsg = this.$t('error.InvalidValue')
        return
      }

      if (this.inputQty > this.buyInputCheck.max) {
        this.inputQtyError = true
        this.inputQtyErrorMsg = this.$t('error.OverMax') + this.buyInputCheck.max.toString()
        return
      }

      if (this.inputQty > this.loanEthBalance) {
        this.inputQtyError = true
        this.inputQtyErrorMsg = this.$t('error.OverContract') + this.loanEthBalance.toString()
        return
      }

      // 将输入的ETH换算成需借出的USDT
      // let valueUsdt = this.loanValue
      // 默认杠杆下借款数量 以实际交易所需数量 - 本金
      // 本金不参与交易
      this.btnLoading = true
      this.btnDisabled = true

      let fromAccount = this.defaultAccount
      let spender = this.$store.state.ContractAddress.router
      // 用户输入需要交易的数量ETH
      let tradeValue = window.web3js.utils.toWei(this.inputQty.toString())

      let tokenFrom = Icontract.getSelectToken(this.tokenFromSymbol, this.$store.state.defaultNetwork)
      let tokenTo = Icontract.getSelectToken(this.tokenToSymbol, this.$store.state.defaultNetwork)

      let amountOut = tradeValue // 需要购买的数量
      let path = [tokenFrom.address, tokenTo.address]

      let myAllowance = await Iusdt.methods.allowance(fromAccount, spender)
      if (isStrEmpty(myAllowance)) {
        alert(this.$t('error.NetworkError'))
        console.log('网络错误未能取得的批准数据')
        this.btnLoading = false
        this.btnDisabled = false
        return
      }

      // 取输入数量
      let getAmountsInRes = await IrouterPath.methods.getAmountsIn(amountOut.toString(), path)
      let amountInMax = getAmountsInRes[0].toString() // 最大输入 多的会退回
      if (getAmountsInRes.length===0) {
        this.btnLoading = false
        this.btnDisabled = false
        return
      }

      // 没有批准额度则先批准再还款
      if (myAllowance === null || myAllowance === 0 || myAllowance === '0' || BigInt(myAllowance) ===0n) {
        // 需先将from地址approve给合约
        let approveRes = await Iusdt.methods.approve(fromAccount, spender, amountInMax)
        if (isStrEmpty(approveRes)) {
          console.log('approve error', approveRes)
          this.btnLoading = false
          this.btnDisabled = false
          return
        }
      } else {
        if (BigInt(myAllowance) < BigInt(amountInMax)) {
          // 重置approve
          if (confirm(this.$t('long.ResetApprove').toString())) {
            let approveStatus = await Iusdt.methods.approve(fromAccount, spender, '0')
            if(approveStatus){
              alert(this.$t('long.ReSetDone'))
            }
            this.btnLoading = false
            this.btnDisabled = false
            return
          }
          this.btnLoading = false
          this.btnDisabled = false
        }
      }

      // +1 取整 忽略小数
      let borrow = parseInt((window.web3js.utils.fromWei(getAmountsInRes[0]))) + 1
      let borrowWei = window.web3js.utils.toWei(borrow.toString())
      let price = window.web3js.utils.toWei(this.ethPrice.toString())

      // console.log('borrow data', borrow, price.toString(), tradeValue, this.leveraged)
      // 借款
      let borrowRes = await IloanUSDT.methods.borrow(fromAccount, borrowWei.toString(), fromAccount, price.toString(), this.leveraged.toString())
      if (borrowRes) {

        if (amountInMax !== '0' && amountInMax > 0) {
          let swapPath = [tokenFrom.address, tokenTo.address]
          let swapTo = fromAccount
          let swapTokensForExactETHRes = await IrouterPath.methods.swapTokensForExactETH(fromAccount, amountOut.toString(), amountInMax.toString(), swapPath, swapTo)

          if (swapTokensForExactETHRes) {
            let parameter = {
              owner: fromAccount,
              account: swapTo,
              principal: this.assetsBalance.USDT.format,
              lever: this.leveraged,
              tradeType: tradeType.loan, // 10开多 11 平多 20开空 21平多
              tokenIn: tokenFrom.symbol,
              tokenOut: tokenTo.symbol,
              inQty: amountInMax,
              outQty: tradeValue,
              price: price,
              status: '1'
            }

            // 交易记录保存到数据库并刷新界面
            this.postMyLeverageRecord(parameter.owner,parameter.account,parameter.principal,parameter.lever,parameter.tradeType,parameter.tokenIn,parameter.tokenOut,parameter.inQty,parameter.outQty,parameter.price,parameter.status)

          }

          this.btnLoading = false
          this.btnDisabled = false
        }
      }
    },

    async getbalance() {
      let aa = setInterval(async () => {
        let ff = await Iusdt.methods.balanceOf(this.assetsAccount.address)
        console.log('balance', ff.format, this.inputRepayQty)
        if (parseFloat(ff.format) >= parseFloat(this.inputRepayQty)) {
          let ff2 = await Iusdt.methods.balanceOf(this.assetsAccount.address)
          console.log('clear', ff2.format)
          clearInterval(aa)
        }
      }, 1000)
    },

    async loanRepayTest() {

      // repaySign 0xaC8cbc537BF1a68D077631D00aF77ED7D1bf229e
      // 3312832981286370496903 2084181925000000300000 1500000000000000000

      // 0x1DD3482Cb433F33a2d96D87C3B3679A7B390524F
      // 2900246951347648390042 1922315200000000000000 1500000000000000000

      // 17587040459652389816431 1761568900000000000000 10000000000000000000

      let spender = this.$store.state.ContractAddress.loanUSDT
      let repayWei = '2900246951347648390042'

      // let price = '2084181925000000300000' // '1000000000000000000'
      // // 手动还款等于持仓 (单价和借款可随意) 可重置借款数据
      // let repayPosition = '1500000000000000000' // '700000000000000000'

      let myAllowance = await Iusdt.methods.allowance(this.assetsAccount.address, spender)
      console.log('myAllowance', myAllowance, this.tokenFromContractData)

      // // 取当前还款额的利息
      let reRate = await IloanUSDT.methods.MyBorrowerRateCount(this.assetsAccount.address, repayWei)
      let repayCount = (BigInt(repayWei) + BigInt(reRate)).toString()
      console.log('rateCount', reRate, repayWei, repayCount)

      await this.getbalance()

      console.log('out time')
      // let repayStatus = await IloanUSDT.methods.repaySign(this.assetsAccount.address, this.assetsAccount.key, repayCount, price.toString(), repayPosition.toString())
      // console.log('repaySign', repayStatus)

    },

    // 多头还款[手动还USDT]
    // 根所输入还款数量独立还款
    async loanRepay() {

      console.log('loanRepay usdt', this.inputRepayQty, this.assetsAccount, this.tokenFromContractData)

      if (this.inputRepayQty.toString() === '' || window.web3js.utils.toWei(this.inputRepayQty.toString()) === '0') {
        this.inputRepayQtyError = true
        this.inputRepayQtyErrorMsg = this.$t('error.InvalidValue')
        return
      }

      if (parseFloat(this.inputRepayQty) > parseFloat(this.assetsBalance.USDT.format)) {
        this.inputRepayQtyError = true
        this.inputRepayQtyErrorMsg = this.$t('error.OverBalance') + this.assetsBalance.USDT.format.toString()
        return
      }

      let spender = this.$store.state.ContractAddress.loanUSDT
      let repayWei = window.web3js.utils.toWei(this.inputRepayQty.toString())

      this.btnLoading = true
      this.btnDisabled = true

      let myAllowance = await Iusdt.methods.allowance(this.assetsAccount.address, spender)

      if (isStrEmpty(myAllowance)) {
        alert(this.$t('error.NetworkError'))
        console.log('网络错误未能取得的批准数据')
        this.btnLoading = false
        this.btnDisabled = false
        return
      }

      // 取当前还款额的利息
      // let reRate = await IloanUSDT.methods.MyBorrowerRateCount(this.assetsAccount.address, repayWei)
      // let repayCount = BigInt(repayWei.toString()) + BigInt(reRate.toString())

      // let reRate = await IloanUSDT.methods.MyBorrowerRateCount(this.assetsAccount.address, repayWei)
      let repayCount = BigInt(repayWei.toString()).toString()
      console.log('reRate', repayWei)

      // repaySign 0xaC8cbc537BF1a68D077631D00aF77ED7D1bf229e
      // 0x0efe5fc1c191c8ae0cf239ebdb45eb6db34820ccc123bbd90ff96ef2504049bf
      // 1104793340965272781703 3633311433333333300000 300000000000000000

      let price = '1894348420000000000000' // '1000000000000000000'
      // 手动还款等于持仓 (单价和借款可随意) 可重置借款数据
      let repayPosition = '2000000000000000' // '700000000000000000'

      console.log('spender myAllowance', myAllowance, repayCount)
      // 有批准额度直接还款
      if (BigInt(myAllowance) >= BigInt(repayCount)) {
        console.log('Allowance >= ')

        IloanUSDT.methods.repaySign(this.assetsAccount.address, this.assetsAccount.key, repayCount.toString(), price, repayPosition)
        .then(repayStatus=>{
          console.log('repayStatus', repayStatus)
          if (repayStatus) {
            return true
          } else {
            alert(this.$t('error.TFailure'))
            this.btnLoading = false
            this.btnDisabled = false
            return false
          }
        })

      } else {
        // 如果没有批准额度或小于还款额度 则先清零
        let approveClear = await Iusdt.methods.approveSign(this.assetsAccount.address, this.assetsAccount.key, spender, '0')
        if (approveClear) {
          // 需先将from地址approve给loan合\
          let approveRes = await Iusdt.methods.approveSign(this.assetsAccount.address, this.assetsAccount.key, spender, repayCount.toString())
          if (approveRes) {
            // 减仓加权价格
            // (原价格 * 原数量 - 现价格 * 现数量) / 现数量
            // let countPrice = this.tokenFromContractData.borrower.price * this.tokenFromContractData.borrower.position
            let repayStatus = await IloanUSDT.methods.repaySign(this.assetsAccount.address, this.assetsAccount.key, repayCount.toString(), price, repayPosition)
            console.log('repayStatus', repayStatus)
            if (repayStatus) {
              return true
            } else {
              alert(this.$t('error.TFailure'))
              this.btnLoading = false
              this.btnDisabled = false
              return false
            }
          } else {
            console.log('usdt approve error')
            return false
          }
        }
      }

    },

    // 与交易组合还款
    // 基于metamask操作
    async usdtRepayByMetamask(fromAccount, repayWei) {

      let spender = this.$store.state.ContractAddress.loanUSDT

      let myAllowance = await Iusdt.methods.allowance(fromAccount, spender)

      if (myAllowance === '') {
        alert(this.$t('error.NetworkError'))
        console.log('网络错误未能取得的批准数据')
        return false
      }
      // 没有批准额度则先批准再还款
      if (myAllowance === null || myAllowance === 0 || myAllowance === '0') {
        console.log('myAllowance', myAllowance, repayWei)
        // 取当前还款额的利息
        let reRate = await IloanUSDT.methods.MyBorrowerRateCount(fromAccount, repayWei)

        let repayCount = BigInt(repayWei) + BigInt(reRate)
        console.log('reRate', repayWei, reRate, repayCount)
        // 需先将from地址approve给loan合\
        let approveRes = await Iusdt.methods.approve(fromAccount, spender, repayCount.toString())
        // approve res 45604846000000000000
        console.log('approve res', approveRes)
        if (reRate > 0 && approveRes !== '') {

          let repayStatus = await IloanUSDT.methods.repay(fromAccount, repayWei.toString(), reRate.toString())

          if (repayStatus !== '') {
            await this.updateDynamicData()
            return true
          } else {
            alert('未能正确归还杠杆资产, 请在资产管理中手工还款')
            return false
          }
        }
      } else {
        alert('已有批准额度未使用, 请在资产管理优先使用批准额度还款')
        return false
      }
    },

    // 与交易组合还款 签名
    async usdtRepaySign(fromAccount, key, repayCount, repayPosition) {

      let spender = this.$store.state.ContractAddress.loanUSDT

      let myAllowance = await Iusdt.methods.allowance(fromAccount, spender)
      if (isStrEmpty(myAllowance)) {
        alert(this.$t('error.NetworkError'))
        console.log('网络错误未能取得的批准数据')
        return false
      }

      // // 取当前还款额的利息
      // let reRate = await IloanUSDT.methods.MyBorrowerRateCount(fromAccount, repayWei)
      // let repayCount = BigInt(repayWei) + BigInt(reRate)

      // 平仓或减仓时计算持仓成本价
      // 原持仓成本
      let acost = this.tokenFromContractData.borrower.price * this.tokenFromContractData.borrower.position
      // 现成本
      let bcost = this.ethShortPrice * this.inputSell
      // 总持仓To
      let countQty = this.tokenFromContractData.borrower.position - this.inputSell

      // 如果是清仓 持仓数量等于0 显示最新价
      let countPrice = this.ethShortPrice
      if (countQty > 0) {
        // 持仓成本价= 原成本-现成本 / 总数量
        if(acost>bcost) {
          countPrice = (acost - bcost) / countQty
        }
      }

      console.log('myAllowance', myAllowance, repayCount)

      let price = window.web3js.utils.toWei(countPrice.toString())

      // 有批准额度直接还款
      if (BigInt(myAllowance) >= BigInt(repayCount)) {
        let repayStatus = await IloanUSDT.methods.repaySign(fromAccount, key, repayCount.toString(), price, repayPosition)

        if (repayStatus) {
          return true
        } else {
          alert(this.$t('error.TFailure'))
          return false
        }

      } else {
        // 如果没有批准额度或小于还款额度 则先清零
        let approveClear = await Iusdt.methods.approveSign(fromAccount, key, spender, '0')
        if (approveClear) {
          // 需先将from地址approve给loan合约
          let approveValue =  BigInt(repayCount) * 2n // 以防额度不足
          let approveRes = await Iusdt.methods.approveSign(fromAccount, key, spender, approveValue.toString())
          if (approveRes) {
            // 减仓加权价格
            // (原价格 * 原数量 - 现价格 * 现数量) / 现数量
            // let countPrice = this.tokenFromContractData.borrower.price * this.tokenFromContractData.borrower.position
            let repayStatus = await IloanUSDT.methods.repaySign(fromAccount, key, repayCount.toString(), price.toString(), repayPosition.toString())
            if (repayStatus) {
              return true
            } else {
              alert(this.$t('error.TFailure'))
              return false
            }
          } else {
            console.log('usdt approve error')
            return false
          }
        }
      }
    },

    // 与交易组合还款 签名
    async usdtRepaySign2(fromAccount, key, repayWei, repayPosition) {

      let spender = this.$store.state.ContractAddress.loanUSDT

      let myAllowance = await Iusdt.methods.allowance(fromAccount, spender)
      if (isStrEmpty(myAllowance)) {
        alert(this.$t('error.NetworkError'))
        console.log('网络错误未能取得的批准数据')
        return false
      }

      // 取当前还款额的利息
      let reRate = await IloanUSDT.methods.MyBorrowerRateCount(fromAccount, repayWei)
      let repayCount = BigInt(repayWei) + BigInt(reRate)

      // 平仓或减仓时计算持仓成本价
      // 原持仓成本
      let acost = this.tokenFromContractData.borrower.price * this.tokenFromContractData.borrower.position
      // 现成本
      let bcost = this.ethShortPrice * this.inputSell
      // 总持仓To
      let countQty = this.tokenFromContractData.borrower.position - this.inputSell

      // 如果是清仓 持仓数量等于0 显示最新价
      let countPrice = this.ethShortPrice
      if (countQty>0) {
        // 持仓成本价= 原成本-现成本 / 总数量
        countPrice = (acost - bcost) / countQty
      }
      let price = window.web3js.utils.toWei(countPrice.toString())

      // 没有批准额度则先批准再还款
      if (myAllowance === null || myAllowance === 0 || myAllowance === '0' || BigInt(myAllowance.toString()) ===0n) {

        // 需先将from地址approve给loan合\
        let approveRes = await Iusdt.methods.approveSign(fromAccount, key, spender, repayCount.toString())
        if (approveRes) {
          // 减仓加权价格
          // (原价格 * 原数量 - 现价格 * 现数量) / 现数量
          // let countPrice = this.tokenFromContractData.borrower.price * this.tokenFromContractData.borrower.position
          let repayStatus = await IloanUSDT.methods.repaySign(fromAccount, key, repayCount.toString(), price, repayPosition)

          if (repayStatus) {
            return true
          } else {
            alert(this.$t('error.TFailure'))
            return false
          }
        } else {
          console.log('usdt approve error')
          return false
        }
      } else {
        // 有Allowance
        if (BigInt(myAllowance) >= BigInt(repayCount)) {

          let repayStatus = await IloanUSDT.methods.repaySign(fromAccount, key, repayCount.toString(),price,repayPosition)

          if (repayStatus) {
            return true
          } else {
            alert(this.$t('error.TFailure'))
            return false
          }

        } else {

          // let res = window.web3.utils.fromWei(myAllowance.toString())
          if (confirm(this.$t('long.ResetApprove').toString())) {
            let approveStatus=await Iusdt.methods.approveSign(fromAccount, key, this.$store.state.ContractAddress.router, 0)
            if(approveStatus){
              alert(this.$t('long.ReSetDone'))
            }
          }

          return false
        }
      }
    },

    /**
     * sign 签名账号
     * 平多+还款
     * 以本次交易所得用于还款
     * */
    async loanCloseRepay() {
      console.log('loanCloseRepay sign')

      if (isStrEmpty(this.inputSell.toString()) || parseFloat(this.inputSell.toString())<=0) {
        this.inputSellError = true
        this.inputSellErrorMsg = this.$t('error.InvalidValue')
        return
      }

      if (isStrEmpty(this.tokenFromContractData.borrower.wadNet) || isStrEmpty(this.tokenFromContractData.borrower.position) || this.tokenFromContractData.borrower.position===0) {
        this.inputSellError = true
        this.inputSellErrorMsg = this.$t('error.NotPosition')
        return
      }

      if (parseFloat(this.inputSell) > parseFloat(this.tokenFromContractData.borrower.position)) {
        this.inputSellError = true
        this.inputSellErrorMsg = this.$t('error.OverPosition') + this.tokenFromContractData.borrower.position.toString()
        return
      }

      let sellWei = window.web3js.utils.toWei(this.inputSell.toString())

      // 卖出数量不能超出账号余额
      if (BigInt(this.assetsBalance.ETH.meta) < (BigInt(sellWei) + BigInt(this.$store.state.retentionEth))) {
        this.inputSellError = true
        this.inputSellErrorMsg = this.$t('error.OverBalanceByClose') + this.assetsBalance.ETH.format
        return
      }

      // 检查上是否有平台账号
      if (isStrEmpty(this.assetsAccount)) {
        alert(this.$t('error.NotAsset'))
        return
      }

      this.btnLoading = true
      this.btnDisabled = true

      // 平仓数量大于等于持仓(以4位小数为准) 则算为清仓
      if ( parseFloat(this.inputSell.toString()) >= parseFloat(this.tokenFromContractData.borrower.position.toString())) {
        sellWei = this.tokenFromContractData.borrower.positionMeta
        console.log('loanClose all', sellWei)
      }

      let amountOutMin = '0'
      let swapPath = [this.tokenTo.address, this.tokenFrom.address]
      let to = this.assetsAccount.address
      let getAmountsOut = await IrouterPath.methods.getAmountsOut(sellWei, swapPath)
      console.log('getAmountsOut', getAmountsOut[1].toString(), getAmountsOut)
      let outQtyWei = getAmountsOut[1].toString()

      // ETH当前余额大于平仓数量+保留量则卖出否则直接从保证金还款
      let swapStatus = false
      if (BigInt(this.assetsBalance.ETH.meta) > (BigInt(sellWei) + BigInt(this.$store.state.retentionEth))) {
        swapStatus = await IrouterPath.methods.swapExactETHForTokensSign(to,this.assetsAccount.key, amountOutMin, swapPath, to, sellWei)
      }

      // if (swapStatus || BigInt(this.assetsBalance.ETH.meta) <= (BigInt(sellWei) + BigInt(this.$store.state.retentionEth))) {
      if (swapStatus) {

        // 如果卖出数量等于借款仓位(清仓) 则还款数量需等于借款数量 如果本次交易数量不足以还款视为亏损 从当前账号中扣除
        if ( BigInt(sellWei) === BigInt(this.tokenFromContractData.borrower.positionMeta)) {
          outQtyWei = this.tokenFromContractData.borrower.wadNetMeta
        }

        let reRate = await IloanUSDT.methods.MyBorrowerRateCount(this.assetsAccount.address, outQtyWei.toString())
        let repayCount = (BigInt(outQtyWei) + BigInt(reRate)).toString()
        // console.log('rate', outQtyWei, reRate)

        // 如果当前余额不够 循环查询余额以防交易后网络延迟导致余额未返回
          let setIntervalID = setInterval(async () => {
           let usdtBalance = await Iusdt.methods.balanceOf(this.assetsAccount.address)

            if (BigInt(usdtBalance.meta) >= BigInt(repayCount)) {

              clearInterval(setIntervalID)
              // 以本次交易数量还款
              let repayRes = await this.usdtRepaySign(this.assetsAccount.address, this.assetsAccount.key, repayCount.toString(), sellWei.toString())
              if (repayRes) {

                // 显示提示信息
                this.SnackbarShow = true
                this.vSnackbar = {type: this.$store.state.myColor.success,text: this.$t('web.Closing') + this.$t('web.Success')}

                // 更新数据库
                let parameter = {
                  owner: this.defaultAccount,
                  account: to,
                  principal: this.assetsBalance.USDT.format,
                  lever: this.leveraged,
                  tradeType: tradeType.loanClose,
                  tokenIn: this.tokenFrom.symbol,
                  tokenOut: this.tokenTo.symbol,
                  inQty: amountOutMin,
                  outQty: sellWei,
                  price: window.web3js.utils.toWei(this.ethPrice.toString()),
                  status: '1'
                }
                await this.postMyLeverageRecord(parameter.owner,parameter.account,parameter.principal,parameter.lever,parameter.tradeType,parameter.tokenIn,parameter.tokenOut,parameter.inQty,parameter.outQty,parameter.price,parameter.status)
                await this.updateDynamicData()
              }
              this.btnLoading = false
              this.btnDisabled = false

            }
          }, 1000)
      }

    },

    /**
     * MetaMask
     * 平多+还款
     * 以本次交易所得用于还款
     * gas和支出从当前账号
     * */
    async loanCloseRepayLocal() {

      let sellWei = window.web3js.utils.toWei(this.inputSell.toString())

      console.log('loanCloseRepay', this.inputSell)

      if (this.inputSell.toString() === '' || sellWei === '0') {
        this.inputSellError = true
        this.inputSellErrorMsg = 'invalid input 0'
        return
      }

      if (isStrEmpty(this.tokenFromContractData.borrower.wad) || this.tokenFromContractData.borrower.wad - this.tokenFromContractData.borrower.repay === 0){
        alert('您没有可平仓的仓位')
        return
      }

      if (this.inputSell > this.tokenFromContractData.borrower.position) {
        this.inputSellError = true
        this.inputSellErrorMsg = '卖出数量不可大于您的持仓' + this.tokenFromContractData.borrower.position.toString()
        return
      }

      this.btnLoading = true
      this.btnDisabled = true

      let tokenFrom = Icontract.getSelectToken(this.tokenFromSymbol, this.$store.state.defaultNetwork)
      let tokenTo = Icontract.getSelectToken(this.tokenToSymbol, this.$store.state.defaultNetwork)

      let amountOutMin = '0'
      let swapPath = [tokenTo.address, tokenFrom.address]
      let swapTo = this.defaultAccount

      let getAmountsOut = await IrouterPath.methods.getAmountsOut(sellWei, swapPath)
      let outQtyWei = getAmountsOut[1].toString()
      // console.log('getAmountsOut', getAmountsOut, outQtyWei)

      let swapStatus = await IrouterPath.methods.swapExactETHForTokens(this.defaultAccount, amountOutMin, swapPath, swapTo, sellWei)

      if (swapStatus) {

        let parameter = {
          owner: this.defaultAccount,
          account: swapTo,
          principal: this.assetsBalance.USDT.format,
          lever: this.leveraged,
          tradeType: tradeType.loanClose,
          tokenIn: tokenFrom.symbol,
          tokenOut: tokenTo.symbol,
          inQty: amountOutMin,
          outQty: sellWei,
          price: window.web3js.utils.toWei(this.ethPrice.toString()),
          status: '1'
        }

        this.postMyLeverageRecord(parameter.owner,parameter.account,parameter.principal,parameter.lever,parameter.tradeType,parameter.tokenIn,parameter.tokenOut,parameter.inQty,parameter.outQty,parameter.price,parameter.status)

        // 以本次交易数量还款
        await this.usdtRepay(this.defaultAccount, outQtyWei)
      }

      this.btnLoading = false
      this.btnDisabled = false

    },

    // 开空仓
    // 基于用户平台签名账号
    // Gas和交换值均为用户平台账号
    async ShortBorrowSign() {
      console.log('开空仓')

      if (isStrEmpty(this.inputShort) || parseFloat(this.inputShort.toString()) <= 0) {
        this.inputShortError = true
        this.inputShortErrorMsg = this.$t('error.InvalidValue')
        return
      }

      if (this.ethBalanceNet===0 || this.ethBalanceNet === '0') {
        this.inputShortError = true
        this.inputShortErrorMsg = this.$t('error.NotAsset')
        return
      }

      if (this.inputShort > this.shortInputCheck.max) {
        this.inputShortError = true
        this.inputShortErrorMsg = this.$t('error.OverMax') + this.shortInputCheck.max.toString()
        return
      }

      if (this.inputShort > this.OpenMax) {
        this.inputShortError = true
        this.inputShortErrorMsg = this.$t('error.OverOpenMax') + this.OpenMax.toString()
        return
      }

      if (parseFloat(this.inputShort) > parseFloat(this.loanEthBalance)) {
        this.inputShortError = true
        this.inputShortErrorMsg = this.$t('error.OverContract') + this.loanEthBalance.toString()
        return
      }

      // 检查上是否有平台账号
      if (isStrEmpty(this.assetsAccount)) {
        alert(this.$t('error.NotAsset'))
        return
      }

      // gas费由平台账号支出时 ETH资产不能空 最少0.01ETH用于Gas检查
      if (this.assetsBalance.ETH.format === 0) {
        alert(this.$t('error.NotETHBalance'))
        return
      }

      this.btnLoading = true
      this.btnDisabled = true

      let acost = 0
      // 现成本
      let bcost = this.ethShortPrice * this.inputShort
      let countQty = parseFloat(this.inputShort)
      // 如果已有持仓需计算原有持仓
      if (!isStrEmpty(this.tokenToContractData.borrower)) {
        // 开仓或加仓时计算持仓成本价
        // 原持仓成本
        acost = this.tokenToContractData.borrower.price * this.tokenToContractData.borrower.position
        countQty = parseFloat(this.tokenToContractData.borrower.position) + parseFloat(this.inputShort)
      }

      // 持仓成本价 = 原成本+现成本 / 总数量
      let countPrice = (parseFloat(acost.toString()) + parseFloat(bcost.toString())) / countQty
      let price = window.web3js.utils.toWei(countPrice.toString())

      let tradeValue = window.web3js.utils.toWei(this.inputShort.toString())

      let to=this.assetsAccount.address
      let container = containerPack('1',this.leveraged, tradeType.short)

      let tokenFrom = Icontract.getSelectToken(this.tokenFromSymbol, this.$store.state.defaultNetwork)
      let tokenTo = Icontract.getSelectToken(this.tokenToSymbol, this.$store.state.defaultNetwork)
      let amountOutMin = '0'
      let path = [tokenTo.address, tokenFrom.address] // 卖空用反向路径

      // 取可换取的对手币数量
      let getAmountsOutRes = await IrouterPath.methods.getAmountsOut(tradeValue.toString(), path)
      let swapPosition = getAmountsOutRes[1].toString()

      // [弃用]本金占用 = 为当前余额 + 杠杆资金 + 1倍杠杆占用金
      // let cost = (this.shortInputCheck.netBalance / this.leveraged) + (this.shortInputCheck.netBalance * (this.inputShort / this.shortInputCheck.max))
      let cost = 0

      // console.log('开空 参数:', this.ethShortPrice, this.assetsBalance.USDT.format, tradeValue, swapPosition)

      let that = this
      // 借ETH
      let borrowRes = await IloanEth.methods.borrow(this.defaultAccount, cost, tradeValue.toString(), swapPosition, to, price.toString(), container.toString())
      if (borrowRes) {

        // console.log('ShortSwap', amountOutMin, path, to, tradeValue, assetsAccount, tradeValue, price.toString(), container.toString())
        // 用借来的ETH交换token
        IrouterPath.methods.swapExactETHForTokensSign(to, this.assetsAccount.key, amountOutMin, path, to, tradeValue)
            .then(function (response) {
              if (response) {

                let parameter = {
                  owner: that.defaultAccount,
                  account: to,
                  principal: that.assetsBalance.USDT.format,
                  lever: that.leveraged,
                  tradeType: tradeType.short, // 10开多 20开空 11平多 21平空
                  tokenIn: tokenTo.symbol,
                  tokenOut: tokenFrom.symbol,
                  inQty: amountOutMin,
                  outQty: tradeValue,
                  price: price,
                  status: '1'
                }

                // 存入数据 刷新界面
                that.postMyLeverageRecord(parameter.owner,parameter.account,parameter.principal,parameter.lever,parameter.tradeType,parameter.tokenIn,parameter.tokenOut,parameter.inQty,parameter.outQty,parameter.price,parameter.status)
                that.updateDynamicData()

                that.btnLoading = false
                that.btnDisabled = false

              } else {
                that.btnLoading = false
                that.btnDisabled = false
              }

            })
            .catch((e) => {

              console.log('ShortBorrow swapExactETHForTokens error', e)
              alert(this.$t('error.TFailure'))
              that.btnLoading = false
              that.btnDisabled = false

            })
      } else {

        console.log('ShortBorrow invalid')
        that.btnLoading = false
        that.btnDisabled = false
      }
    },

    // 开空仓
    // 基于metamask当前账号钱包交易
    // Gas和交易对象均为当前账号
    async ShortBorrowLocal() {

      if (this.inputShort === 0 || this.inputShort === '') {
        this.inputShortError = true
        this.inputShortErrorMsg = 'invalid input 0'
        return
      }

      if (this.inputShort > this.shortInputCheck.max) {
        this.inputShortError = true
        this.inputShortErrorMsg = '当前融资最大可交易' + this.shortInputCheck.max.toString()
        return
      }

      if (this.inputShort < this.shortInputCheck.min) {
        this.inputShortError = true
        this.inputShortErrorMsg = '杠杆融资最小交易量' + this.shortInputCheck.min.toString()
        return
      }

      // 将输入的ETH换算成需借出的USDT
      // let valueUsdt = this.loanValue
      // 默认杠杆下借款数量 以实际交易所需数量 - 本金
      // 本金不参与交易
      this.btnLoading = true
      this.btnDisabled = true

      let tradeValue = window.web3js.utils.toWei(this.inputShort.toString())
      let price = window.web3js.utils.toWei(this.ethPrice.toString())
      let toAddress = this.defaultAccount

      let container = containerPack('1', this.leveraged, tradeType.short)

      console.log('ShortBorrow', toAddress, tradeValue, price.toString(), container.toString())

      let that = this
      // 借ETH
      let borrowRes = await IloanEth.methods.borrow(toAddress, tradeValue.toString(), toAddress, price.toString(), container.toString())

      if (borrowRes) {

        let tokenFrom = Icontract.getSelectToken(this.tokenFromSymbol, this.$store.state.defaultNetwork)
        let tokenTo = Icontract.getSelectToken(this.tokenToSymbol, this.$store.state.defaultNetwork)

        let fromUser = this.defaultAccount
        let amountOutMin = '0'
        let path = [tokenTo.address, tokenFrom.address] // 卖空用反向路径
        let to = this.defaultAccount

        console.log('ShortSwap', fromUser, amountOutMin, path, to, tradeValue)
        // 用借来的ETH交换token
        IrouterPath.methods.swapExactETHForTokens(fromUser, amountOutMin, path, to, tradeValue)
            .then(function (response) {
              console.log('ShortBorrow swapExactETHForTokens', response)
              if (response) {

                let parameter = {
                  owner: that.defaultAccount,
                  account: to,
                  principal: that.assetsBalance.USDT.format,
                  lever: that.leveraged,
                  tradeType: tradeType.short, // 10开多 20开空 11平多 21平空
                  tokenIn: tokenTo.symbol,
                  tokenOut: tokenFrom.symbol,
                  inQty: amountOutMin,
                  outQty: tradeValue,
                  price: price,
                  status: '1'
                }

                // 存入数据 刷新界面
                that.postMyLeverageRecord(parameter.owner, parameter.account, parameter.principal, parameter.lever, parameter.tradeType, parameter.tokenIn, parameter.tokenOut, parameter.inQty, parameter.outQty, parameter.price, parameter.status)

              }

              that.btnLoading = false
              that.btnDisabled = false
            })
            .catch((e) => {

              console.log('ShortBorrow swapExactETHForTokens error', e)
              alert('卖空交易 未能成交')
              that.btnLoading = false
              that.btnDisabled = false

            })
      } else {

        console.log('ShortBorrow invalid')
        that.btnLoading = false
        that.btnDisabled = false

      }
    },

    // 空头还款 (手动还ETH)
    async shortRepay() {
      console.log('空头还款')

      if (this.inputRepayShort.toString() === '' || window.web3js.utils.toWei(this.inputRepayShort.toString()) === '0') {
        this.inputRepayShortError = true
        this.inputRepayShortErrorMsg = 'invalid input 0'
        return
      }

      if (this.inputRepayShort > this.assetsBalance.ETH.format) {
        this.inputRepayShortError = true
        this.inputRepayShortErrorMsg = '还款数量不可大于您的持仓' + this.assetsBalance.ETH.format.toString()
        return
      }

      let fromUser = this.assetsAccount.address
      let key = this.assetsAccount.key

      this.btnLoading = true
      this.btnDisabled = true

      let repayWei = window.web3js.utils.toWei(this.inputRepayShort.toString())
      let reRateWei = await IloanEth.methods.MyBorrowerRateCount(fromUser, repayWei)
      let repayCount = BigInt(repayWei) + BigInt(reRateWei)

      let price = '1000000000000000000'
      // 手动还款等于持仓 可重置借款数据
      let repPosition = '1062418596713190947670'

      let that = this
      IloanEth.methods.repaySign(fromUser,key, repayCount.toString(), price,repPosition)
          .then(function (response) {
            console.log('repay eth', response)
            // 更新界面数据
            that.updateDynamicData()
            that.btnLoading = false
            that.btnDisabled = false
          })
          .catch((e) => {
            if (e) {
              console.log('repay eth', e)
              that.btnLoading = false
              that.btnDisabled = false
              alert('平仓时出现未知错误请通开发者')
            }
          })
    },

    // 与交易组合还款
    // 空头还款 (还ETH)
    async ethShortRepay(fromUser, key, repayWei, position) {
      // 取利息
      let reRateWei = await IloanEth.methods.MyBorrowerRateCount(fromUser, repayWei)
      let repayCount = (BigInt(repayWei) + BigInt(reRateWei)).toString()
      if (isStrEmpty(reRateWei)) {
        console.log('MyBorrowerRateCount error')
        return false
      } else {

        // 减仓时重算持仓成本价
        // 原持仓成本
        let acost = this.tokenToContractData.borrower.price * this.tokenToContractData.borrower.position
        // 现成本
        let bcost = this.ethPrice * this.inputShortClose
        // 总持仓To
        let countQty = this.tokenToContractData.borrower.position - this.inputShortClose

        // 如果是清仓 持仓数量等于0 显示最新价
        let countPrice = this.ethPrice
        if (countQty > 0) {
          // 持仓成本价= 原成本-现成本 / 总数量
          if(acost>bcost) {
            countPrice = (acost - bcost) / countQty
          }
        }

        let price = window.web3js.utils.toWei(countPrice.toString())

        // console.log('ethShortRepay', acost, bcost, countQty, countPrice, price)

        let repayRes = await IloanEth.methods.repaySign(fromUser, key, repayCount.toString(), price, position)
        if (repayRes) {
          return true
        } else {
          return false
        }
      }
    },

    /**
     * 平空+还款 sign
     * 以本次交易所得用于还款
     * */
    async shortCloseRepay() {
      console.log('平空仓+还款 sign')

      if (isStrEmpty(this.inputShortClose) || parseFloat(this.inputShortClose.toString()) === 0) {
        this.inputShortCloseError = true
        this.inputShortCloseErrorMsg = this.$t('error.InvalidValue')
        return
      }

      if (isStrEmpty(this.tokenToContractData.borrower) || isStrEmpty(this.tokenToContractData.borrower.wadNet)) {
        alert(this.$t('error.NotPosition'))
        return
      }

      if (parseFloat(this.inputShortClose) > parseFloat(this.tokenToContractData.borrower.wadNet)) {
        this.inputShortCloseError = true
        this.inputShortCloseErrorMsg = this.$t('error.OverPosition') + this.tokenToContractData.borrower.wadNet.toString()
        return
      }

      this.btnLoading = true
      this.btnDisabled = true

      let fromAccount = this.assetsAccount.address
      let key = this.assetsAccount.key
      let inputShortWei = window.web3js.utils.toWei(this.inputShortClose.toString())
      let path = [this.tokenFrom.address, this.tokenTo.address] // 卖空用反向路径

      // 如果卖出数量大于等于剩余借款(清仓) 则还款数量需等于借款数量 如果本次交易数量不足以还款视为亏损 从当前账号中扣除
      if (parseFloat(this.inputShortClose.toString()) >= parseFloat(this.tokenToContractData.borrower.wadNet)) {
        inputShortWei = this.tokenToContractData.borrower.wadNetMeta
        console.log('clear all', inputShortWei)
      }

      // 换回ETH需要的USDT数量用于还款
      let getAmountsIn = await IrouterPath.methods.getAmountsIn(inputShortWei, path)
      let repayPosition = getAmountsIn[0].toString()

      if (getAmountsIn.length === 0) {
        this.btnLoading = false
        this.btnDisabled = false
        console.log('getAmountsIn error')
      } else {

        // 先确认批准额度
        let myAllowance = await Iusdt.methods.allowance(fromAccount, this.$store.state.ContractAddress.router)

        if (isStrEmpty(myAllowance)) {
          alert(this.$t('error.NetworkError'))
          console.log('网络错误未能取得的批准数据')
          this.btnLoading = false
          this.btnDisabled = false
          return false
        }

        let approveRes = false
        // console.log('allowance', BigInt(myAllowance), BigInt(repayPosition))

        if (BigInt(myAllowance) < BigInt(repayPosition)) {

          let approveClear = await Iusdt.methods.approveSign(fromAccount, key, this.$store.state.ContractAddress.router, '0')
          if (approveClear) {
            let approveValue = BigInt(repayPosition) * 2n // 以防额度不足
            approveRes = await Iusdt.methods.approveSign(fromAccount, key, this.$store.state.ContractAddress.router, approveValue.toString())
          }

        }

        // let myAllowanceConfirm = await Iusdt.methods.allowance(fromAccount, this.$store.state.ContractAddress.router)
        if (BigInt(myAllowance) >= BigInt(repayPosition) || approveRes) {
          // 当前余额不足时 重新计算可交易余额
          // let inQtyWeiSwap = repayPosition // 换回输入的ETH所需要的usdt数量
          // let inputShortWeiSwap = inputShortWei // 输入需交易的eth数量
          let balanceRes = await Iusdt.methods.balanceOf(fromAccount) // 当前账号的usdt余额

          // 当前usdt余额不足以换回持仓的ETH 用完现有全部余额
          if (balanceRes.format>0 && BigInt(repayPosition) > BigInt(balanceRes.meta)) {
            // console.log('inQtyWei > balance', BigInt(inQtyWei.toString()), BigInt(balanceRes.meta.toString()))
            getAmountsIn = await IrouterPath.methods.getAmountsOut(balanceRes.meta, path)
            repayPosition = balanceRes.meta.toString() // 用于交换ETH的最大usdt数量
            inputShortWei = getAmountsIn[1].toString() // 重新取当前USDT可换回的ETH数量
          }

          // console.log('getAmountsOut', inputShortWei, inputShortWeiSwap, inQtyWei, inQtyWeiSwap)
          let swapRes = false
          if (balanceRes.format>0) {
            // usdt 有余额才能交换ETH
            let amountInMax = balanceRes.meta.toString()
            swapRes = await IrouterPath.methods.swapTokensForExactETHSign(fromAccount, key, inputShortWei, amountInMax, path, fromAccount)
          }

          // console.log('swapRes', swapRes, BigInt(this.assetsBalance.ETH.meta), BigInt(inputShortWei))
          // 账号余额要够还款
          // if (swapRes || BigInt(this.assetsBalance.ETH.meta) >= BigInt(inputShortWei)) {
          if (swapRes) {

            // 如果卖出数量等于剩余借款(清仓) 则还款数量需等于借款数量 如果本次交易数量不足以还款视为亏损 从当前账号中扣除
            if (this.inputShortClose >= this.tokenToContractData.borrower.wadNet) {
              repayPosition = this.tokenToContractData.borrower.positionMeta
            }

            // 还款
            // 判断余额够还款
            let ethBalance = await Icontract.getBalanceOf(fromAccount)
            if (BigInt(ethBalance.meta) < BigInt(inputShortWei) ) {
              console.log('eth balance small', ethBalance.meta, inputShortWei)
            }

            let rePayRes = await this.ethShortRepay(fromAccount, key, inputShortWei, repayPosition)
            if (rePayRes) {
              // 显示提示信息
              this.SnackbarShow = true
              this.vSnackbar = {type:this.$store.state.myColor.success,text: this.$t('web.Closing') + this.$t('web.Success')}
              await this.updateDynamicData()

              let parameter = {
                owner: fromAccount,
                account: fromAccount,
                principal: this.assetsBalance.USDT.format,
                lever: this.leveraged,
                tradeType: tradeType.shortClose,
                tokenIn: this.tokenFrom.symbol,
                tokenOut: this.tokenTo.symbol,
                inQty: repayPosition,
                outQty: inputShortWei,
                price: window.web3js.utils.toWei(this.ethPrice.toString()),
                status: '1'
              }
              this.postMyLeverageRecord(parameter.owner, parameter.account, parameter.principal, parameter.lever, parameter.tradeType, parameter.tokenIn, parameter.tokenOut, parameter.inQty, parameter.outQty, parameter.price, parameter.status)

            }
          }
        }

        this.btnLoading = false
        this.btnDisabled = false
      }
    },

    /**
     * 平空+还款 sign
     * 以本次交易所得用于还款
     * */
    async shortCloseRepay2() {
      console.log('平空仓+还款 sign', this.inputShortClose)

      if (isStrEmpty(this.inputShortClose) || parseFloat(this.inputShortClose.toString()) === 0) {
        this.inputShortCloseError = true
        this.inputShortCloserrorMsg = this.$t('error.InvalidValue')
        return
      }

      if (isStrEmpty(this.tokenToContractData.borrower.wadNet)) {
        alert(this.$t('error.NotPosition'))
        return
      }

      if (parseFloat(this.inputShortClose) > parseFloat(this.tokenToContractData.borrower.wadNet)) {
        this.inputShortCloseError = true
        this.inputShortCloseErrorMsg = this.$t('error.OverPosition') + this.tokenToContractData.borrower.wadNet.toString()
        return
      }

      this.btnLoading = true
      this.btnDisabled = true

      let fromAccount = this.assetsAccount.address
      let key = this.assetsAccount.key
      let inputShortWei = window.web3js.utils.toWei(this.inputShortClose.toString())
      let path = [this.tokenFrom.address, this.tokenTo.address] // 卖空用反向路径

      // 换回ETH需要的USDT数量
      let getAmountsIn = await IrouterPath.methods.getAmountsIn(inputShortWei, path)
      let inQtyWei = getAmountsIn[0].toString()

      if (getAmountsIn.length === 0) {
        this.btnLoading = false
        this.btnDisabled = false
        console.log('getAmountsIn error')
      } else {

        // 先确认批准额度
        let myAllowance = await Iusdt.methods.allowance(fromAccount, this.$store.state.ContractAddress.router)

        if (isStrEmpty(myAllowance)) {
          alert(this.$t('error.NetworkError'))
          console.log('网络错误未能取得的批准数据')
          this.btnLoading = false
          this.btnDisabled = false
          return false
        }

        let approveRes = false

        // 没有批准额度则先批准再还款
        if (myAllowance === null || myAllowance === 0 || myAllowance === '0' || BigInt(myAllowance) === 0n) {

          approveRes = await Iusdt.methods.approveSign(fromAccount, key, this.$store.state.ContractAddress.router, inQtyWei)

        } else {
          // 有Allowance但不够本次交易数量 则重置额度
          if (BigInt(myAllowance) < BigInt(inQtyWei)) {
            if (confirm(this.$t('long.ResetApprove').toString())) {

              let approveStatus = await Iusdt.methods.approveSign(fromAccount,key, this.$store.state.ContractAddress.router, 0)
              if(approveStatus){
                alert(this.$t('long.ReSetDone'))
              }
            }
            this.btnLoading = false
            this.btnDisabled = false
            return
          }
        }

        // let myAllowanceConfirm = await Iusdt.methods.allowance(fromAccount, this.$store.state.ContractAddress.router)

        if (BigInt(myAllowance) >= BigInt(inQtyWei) || approveRes) {

          // 当前余额不足时 重新计算可交易余额
          let inQtyWeiSwap = inQtyWei // 换回输入的ETH所需要的usdt数量
          let inputShortWeiSwap = inputShortWei // 输入需交易的eth数量
          let balanceRes = await Iusdt.methods.balanceOf(fromAccount) // 当前账号的usdt余额

          // 当前usdt余额不足以换回持仓的ETH
          if (balanceRes.format>0 && BigInt(inQtyWei) > BigInt(balanceRes.meta)) {
            // console.log('inQtyWei > balance', BigInt(inQtyWei.toString()), BigInt(balanceRes.meta.toString()))
            getAmountsIn = await IrouterPath.methods.getAmountsOut(balanceRes.meta, path)
            inQtyWeiSwap = balanceRes.meta.toString() // 用于交换ETH的最大usdt数量
            inputShortWeiSwap = getAmountsIn[1].toString() // 重新取当前USDT可换回的ETH数量
          }

          // console.log('getAmountsOut', inputShortWei, inputShortWeiSwap, inQtyWei, inQtyWeiSwap)
          let swapRes = false
          if (balanceRes.format>0) {
            // usdt 有余额才能交换ETH
            swapRes = await IrouterPath.methods.swapTokensForExactETHSign(fromAccount, key, inputShortWeiSwap, inQtyWeiSwap, path, fromAccount)
          }

          // 账号余额要够还款
          if (swapRes || BigInt(this.assetsBalance.ETH.meta) >= BigInt(inputShortWei)) {
            let parameter = {
              owner: fromAccount,
              account: fromAccount,
              principal: this.assetsBalance.USDT.format,
              lever: this.leveraged,
              tradeType: tradeType.shortClose,
              tokenIn: this.tokenFrom.symbol,
              tokenOut: this.tokenTo.symbol,
              inQty: 0,
              outQty: inputShortWeiSwap,
              price: window.web3js.utils.toWei(this.ethPrice.toString()),
              status: '1'
            }

            // 如果卖出数量等于剩余借款(清仓) 则还款数量需等于借款数量 如果本次交易数量不足以还款视为亏损 从当前账号中扣除
            if (this.inputShortClose === this.tokenToContractData.borrower.wadNet) {
              console.log('平空清仓')
              inQtyWeiSwap = this.tokenToContractData.borrower.positionMeta
            }

            // 还款
            // 判断余额够还款
            let ethBalance = await Icontract.getBalanceOf(fromAccount)
            console.log('eth balance', ethBalance.format)
            if (ethBalance.meta < inputShortWei ) {
              console.log('eth balance small')
            }

            let rePayRes = await this.ethShortRepay(fromAccount, key, inputShortWei, inQtyWeiSwap)
            if (rePayRes) {
              // 显示提示信息
              this.SnackbarShow = true
              this.vSnackbar = {type:this.$store.state.myColor.success,text: this.$t('web.Closing') + this.$t('web.Success')}

              this.postMyLeverageRecord(parameter.owner, parameter.account, parameter.principal, parameter.lever, parameter.tradeType, parameter.tokenIn, parameter.tokenOut, parameter.inQty, parameter.outQty, parameter.price, parameter.status)
              await this.updateDynamicData()
            }
          }
        }

        this.btnLoading = false
        this.btnDisabled = false
      }
    },

    /**
     * 平空+还款
     * 以本次交易所得用于还款
     * 基于metamask
     * */
    async shortCloseRepayByMetamask() {
      console.log('平空仓+还款')

      if (this.inputShortClose.toString() === '' || window.web3js.utils.toWei(this.inputShortClose.toString()) === '0') {
        this.inputShortCloseError = true
        this.inputShortCloserrorMsg = 'invalid input 0'
        return
      }

      if (this.inputShortClose > this.tokenToContractData.borrower.position) {
        this.inputShortCloseError = true
        this.inputShortCloseErrorMsg = '卖出数量不可大于您的持仓' + this.tokenToContractData.borrower.position.toString()
        return
      }

      if (isStrEmpty(this.tokenToContractData.borrower.wad) || this.tokenToContractData.borrower.wad - this.tokenToContractData.borrower.repay === 0) {
        alert('您没有可平仓的仓位')
        return
      }

      this.btnLoading = true
      this.btnDisabled = true

      let tokenFrom = Icontract.getSelectToken(this.tokenFromSymbol, this.$store.state.defaultNetwork)
      let tokenTo = Icontract.getSelectToken(this.tokenToSymbol, this.$store.state.defaultNetwork)

      let fromAccount = this.defaultAccount
      let inputShortWei = window.web3js.utils.toWei(this.inputShortClose.toString())
      let path = [tokenFrom.address, tokenTo.address] // 卖空用反向路径

      let getAmountsIn = await IrouterPath.methods.getAmountsIn(inputShortWei, path)

      console.log('getAmountsIn', getAmountsIn, getAmountsIn.length)

      if (getAmountsIn.length === 0) {
        this.btnLoading = false
        this.btnDisabled = false
        console.log('getAmountsIn error')
      } else {
        let inQtyWei = getAmountsIn[0].toString()

        let myAllowance = await Iusdt.methods.allowance(this.defaultAccount, this.$store.state.ContractAddress.router)

        if (isStrEmpty(myAllowance)) {
          alert(this.$t('error.NetworkError'))
          console.log('网络错误未能取得的批准数据')
          return false
        }

        // 没有批准额度则先批准再还款
        if (myAllowance === null || myAllowance === 0 || myAllowance === '0' || BigInt(myAllowance) === 0n) {

          let approveRes = await Iusdt.methods.approve(this.defaultAccount, this.$store.state.ContractAddress.router, inQtyWei)
          if (approveRes) {

            let swapRes = await IrouterPath.methods.swapTokensForExactETH(fromAccount, inputShortWei, inQtyWei, path, fromAccount)
            if (swapRes) {
              let parameter = {
                owner: fromAccount,
                account: fromAccount,
                principal: this.assetsBalance.USDT.format,
                lever: this.leveraged,
                tradeType: tradeType.shortClose,
                tokenIn: tokenFrom.symbol,
                tokenOut: tokenTo.symbol,
                inQty: 0,
                outQty: inputShortWei,
                price: window.web3js.utils.toWei(this.ethPrice.toString()),
                status: '1'
              }

              this.postMyLeverageRecord(parameter.owner, parameter.account, parameter.principal, parameter.lever, parameter.tradeType, parameter.tokenIn, parameter.tokenOut, parameter.inQty, parameter.outQty, parameter.price,parameter.status)

              await this.ethShortRepay(fromAccount, inputShortWei)
            }
          }
        } else {
          // 有Allowance
          if (BigInt(myAllowance) >= BigInt(inQtyWei)) {
            console.log('allowance > inQtyWei', myAllowance, inQtyWei)
            let swapRes = await IrouterPath.methods.swapTokensForExactETH(fromAccount, inputShortWei, inQtyWei, path, fromAccount)
            if (swapRes) {
              let parameter = {
                owner: fromAccount,
                account: fromAccount,
                principal: this.assetsBalance.USDT.format,
                lever: this.leveraged,
                tradeType: tradeType.shortClose,
                tokenIn: tokenFrom.symbol,
                tokenOut: tokenTo.symbol,
                inQty: 0,
                outQty: inputShortWei,
                price: window.web3js.utils.toWei(this.ethPrice.toString()),
                status: '1'
              }

              this.postMyLeverageRecord(parameter.owner, parameter.account, parameter.principal, parameter.lever, parameter.tradeType, parameter.tokenIn, parameter.tokenOut, parameter.inQty, parameter.outQty, parameter.price,parameter.status)

              await this.ethShortRepay(fromAccount, inputShortWei)
            }
          } else {
            // let res = window.web3.utils.fromWei(myAllowance.toString())
            if (confirm('您有未使用的批准余额 需要先重置该额度')) {

              let approveStatus = await Iusdt.methods.approve(this.defaultAccount, this.$store.state.ContractAddress.router, 0)
              if (approveStatus) {
                alert('重置完成请重新交易')
              }
            }
            this.btnLoading = false
            this.btnDisabled = false
          }
        }
        this.btnLoading = false
        this.btnDisabled = false
      }

    },

    // 统计借款利息
    MyBorrowerRateCount(user, borrowerQty) {
      return new Promise((resolve) => {
        let that = this
        IloanUSDT.methods.MyBorrowerRateCount(user, borrowerQty.toString())
            .then(function (response) {
              let rate = window.web3js.utils.fromWei(response.toString())
              let rateFloor = Math.floor(rate * 10000) / 10000
              let borrower = window.web3js.utils.fromWei(borrowerQty.toString())
              // 显示界面利息
              if (borrower.toString() === that.tokenFromContractData.borrower.wadNet.toString()) {
                that.myRate = rateFloor
              }
              resolve(rateFloor)
            })
      })
    }
  }
}
</script>

<style scoped>

</style>

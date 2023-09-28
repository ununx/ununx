<template>
  <v-container>
    <v-row>
      <v-col class="px-0">
        <v-col class="mt-5">
          <v-row>
            <v-col>
              <h4>{{ $t('home.TotalLiquidity') }}</h4>
              <h4>$939,754,34.</h4>
            </v-col>
            <v-col>
              <h4>{{ $t('home.TotalMarket') }}</h4>
              <h4>$939,754,3<i>+128%</i></h4>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <h4>{{ $t('home.TotalIncome') }}</h4>
              <h4>$939,754,34.</h4>
            </v-col>
            <v-col>
              <h4>{{ $t('home.TotalCurrentIncome') }}</h4>
              <h4>$939,754,3.00</h4>
            </v-col>
          </v-row>
        </v-col>

        <!-- pair list -->
        <v-row no-gutters class="mt-5 flat tile justify-space-between">
          <v-col class="xs6 px-0">
            <v-card class="my-1" @click="goAddLiquidity(pairToken[0])">
              <v-card-subtitle class="blue--text font-weight-bold">{{pairToken[0].token0.symbol}} - {{pairToken[0].token1.symbol}}</v-card-subtitle>
              <v-card-text>{{pairToken[0].Price01}}</v-card-text>
            </v-card>
          </v-col>
          <v-col class="xs6 px-0">
            <v-card class="my-1 mx-1 px-0" @click="goAddLiquidity(pairToken[1])">
              <v-card-subtitle class="blue--text font-weight-bold">{{pairToken[1].token0.symbol}} - {{pairToken[1].token1.symbol}}</v-card-subtitle>
              <v-card-text>{{pairToken[1].Price01}}</v-card-text>
            </v-card>
          </v-col>
          <v-col class="xs6 px-0">
            <v-card class="my-1 mx-1 px-0" @click="goAddLiquidity(pairToken[2])">
              <v-card-subtitle class="blue--text font-weight-bold">{{pairToken[2].token0.symbol}} - {{pairToken[2].token1.symbol}}</v-card-subtitle>
              <v-card-text>{{pairToken[2].Price01}}</v-card-text>
            </v-card>
          </v-col>
          <v-col class="xs6 px-0">
            <v-card class="my-1" @click="goAddLiquidity(pairToken[0])">
              <v-card-subtitle class="blue--text font-weight-bold">{{pairToken[0].token0.symbol}} - {{pairToken[0].token1.symbol}}</v-card-subtitle>
              <v-card-text>{{pairToken[0].Price01}}</v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-9">
          <v-col>
            <h3>收益记录</h3>
            <v-data-table
                :headers="recordHeaders"
                :items="recordDesserts">
            </v-data-table>
          </v-col>
        </v-row>

        <v-row class="mt-2">
          <v-col>
            <h3>合作单位</h3>
            <v-row class="mt-2">
              <v-img :src="require('/public/static/images/audit_cp1.png')" alt=""/>
              <v-img :src="require('/public/static/images/audit_cp1.png')" alt=""/>
            </v-row>
            <v-row>
              <v-img :src="require('/public/static/images/audit_cp1.png')" alt=""/>
              <v-img :src="require('/public/static/images/audit_cp1.png')" alt=""/>
            </v-row>
          </v-col>
        </v-row>

        <v-row class="mt-9 mb-5">
          <v-col>
            <h3>{{$t('home.FAQ')}}</h3>
<!--            <PanelsView class="mt-2"/>-->
          </v-col>
        </v-row>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// import PanelsView from '@/components/panels'

import Ifactory from '@/contract/factory/interface'
import IrouterPath from '@/contract/router/interface'
import Ierc20Set from '@/contract/ERC20/deploy.json'
import {Icontract} from "@/common";

export default {
  name: 'Home',
  data: () => ({
      pairToken: [
        {
          pairAddress: '0x9BB1d9a30DA73FA4d66Db130fF59258eC87D1039',
          Price01: NaN,
          token0: {
            address: "0xc430dBbE68d1dE6c24bA96Cf06adF13f2D35bd9F",
            chainID: "152709604825713",
            network: "arbitrum",
            owner: "0xe190c28bb3965C7013A523848181175228055e8f",
            symbol: "TTS4"
          },
          token1: {
            address: "0xC85BEd21057cA2b2A495652B2acb57ea96a6Eb62",
            chainID: "152709604825713",
            network: "arbitrum",
            owner: "0xe190c28bb3965C7013A523848181175228055e8f",
            symbol: "TTS3"
          }
        },
        {
          pairAddress: "0x42BB5485aE8484889C5a80ee5Ea6D7b68cC40b17",
          Price01: NaN,
          token0: {
            address: "0x84079F8E243Ec746Fc6Bf4C8A89830E8aeA503BC",
            chainID: "152709604825713",
            network: "arbitrum",
            owner: "0xe190c28bb3965C7013A523848181175228055e8f",
            symbol: "TTS1"
          },
          token1: {
            address: "0x8c855b0E93423e37302C54cf776CfFF1A0B9ACfD",
            chainID: "42",
            network: "kovan",
            owner: "0x379F025b37E04d9d5ec4e3198b36717FA54C513c",
            symbol: "WETH"
          },
        },
        {
          pairAddress: "0xd9DA6B60AE57621b2B0210cA6011C6EaC3966E4E",
          Price01: 0.0004,
          token0: {
            address: "0x84FaE1D873a2E06f84993447C92bcD1a78132439",
            chainID: "152709604825713",
            network: "arbitrum",
            owner: "0xe190c28bb3965C7013A523848181175228055e8f",
            symbol: "TTS6"
          },
          token1: {
            address: "0x8c855b0E93423e37302C54cf776CfFF1A0B9ACfD",
            chainID: "42",
            network: "kovan",
            owner: "0x379F025b37E04d9d5ec4e3198b36717FA54C513c",
            symbol: "WETH"
          }
        },
        {
          pairAddress: "0xd9DA6B60AE57621b2B0210cA6011C6EaC3966E4E",
          Price01: NaN,
          token0: {
            address: "0x84FaE1D873a2E06f84993447C92bcD1a78132439",
            chainID: "152709604825713",
            network: "arbitrum",
            owner: "0xe190c28bb3965C7013A523848181175228055e8f",
            symbol: "TTS6"
          },
          token1: {
            address: "0x8c855b0E93423e37302C54cf776CfFF1A0B9ACfD",
            chainID: "42",
            network: "kovan",
            owner: "0x379F025b37E04d9d5ec4e3198b36717FA54C513c",
            symbol: "WETH"
          }
        }
      ],
      routerContract: '',
      factoryContract: '',
      isShow: true,
      slides: [
        {
          src: require('/public/static/images/banner-1.jpg')
        },
        {
          src: require('/public/static/images/banner-2.jpg')
        },
        {
          src: require('/public/static/images/banner-3.jpg')
        },
        {
          src: require('/public/static/images/banner-4.jpg')
        }
      ],
      tabList: [
        {
          id: 0,
          text: 'home.ContractIncome'
        },
        {
          id: 1,
          text: 'home.RecomendIncome'
        }
        // {
        //   id: 2,
        //   text: 'home.MineIncome'
        // }
      ],
      recordHeaders: [
        {
          text: 'Dessert (100g serving)',
          align: 'start',
          sortable: false,
          value: 'name'
        },
        { text: 'Calories', value: 'calories' },
        { text: 'Fat (g)', value: 'fat' },
        { text: 'Carbs (g)', value: 'carbs' },
        { text: 'Protein (g)', value: 'protein' },
        { text: 'Iron (%)', value: 'iron' }
      ],
      recordDesserts: [
        {
          name: 'Frozen Yogurt',
          calories: 159,
          fat: 6.0,
          carbs: 24,
          protein: 4.0,
          iron: '1%'
        },
        {
          name: 'Ice cream sandwich',
          calories: 237,
          fat: 9.0,
          carbs: 37,
          protein: 4.3,
          iron: '1%'
        },
        {
          name: 'Eclair',
          calories: 262,
          fat: 16.0,
          carbs: 23,
          protein: 6.0,
          iron: '7%'
        },
        {
          name: 'Cupcake',
          calories: 305,
          fat: 3.7,
          carbs: 67,
          protein: 4.3,
          iron: '8%'
        },
        {
          name: 'Gingerbread',
          calories: 356,
          fat: 16.0,
          carbs: 49,
          protein: 3.9,
          iron: '16%'
        },
        {
          name: 'Jelly bean',
          calories: 375,
          fat: 0.0,
          carbs: 94,
          protein: 0.0,
          iron: '0%'
        },
        {
          name: 'Lollipop',
          calories: 392,
          fat: 0.2,
          carbs: 98,
          protein: 0,
          iron: '2%'
        },
        {
          name: 'Honeycomb',
          calories: 408,
          fat: 3.2,
          carbs: 87,
          protein: 6.5,
          iron: '45%'
        },
        {
          name: 'Donut',
          calories: 452,
          fat: 25.0,
          carbs: 51,
          protein: 4.9,
          iron: '22%'
        },
        {
          name: 'KitKat',
          calories: 518,
          fat: 26.0,
          carbs: 65,
          protein: 7,
          iron: '6%'
        }
      ]
    }),

  mounted() {
    console.log('Home')
  },
  methods: {
    goTest() {
      this.$router.push('/test')
    },
    onDetail() {
      this.$router.push('/about')
    },
    onTab(item) {
      this.tabList.forEach(n => {
        n.active = false
      })
      item.active = true
    },
    goAddLiquidity(item) {
      this.$store.commit('setCurrentPair', item)
      console.log('select pair', this.$store.state.currentPair)
      this.$router.push('/pair')
    },
    async contractInit() {

      if (await Icontract.checkMetaMask() === this.$store.state.defaultNetwork) {

        this.factoryContract = await Ifactory.factory.init()
        this.routerContract = await IrouterPath.methods.init()
        this.allPairs()
      }
    },

    // 从合约中取已有配对及token数据
    allPairs() {
      let that = this
      if (this.factory !== '') {
        this.factoryContract.methods.allPairsLength().call().then(function(response) {
          console.log('allPairsLength', response.toString())
          let _allPairsLength = parseInt(response.toString())
          for (let i = 0; i < _allPairsLength; i++) {
            that.factoryContract.methods.allPairs(i).call().then(function(response) {
              let pairAddress = response.toString()
              if (pairAddress !== '') {
                that.routerContract.methods.getPropertyfromPair(pairAddress).call().then(function(response) {
                  let token0 = response[1].toString()
                  let token1 = response[2].toString()
                  let pairItem = {}
                  let token0set = {}
                  let token1set = {}
                  for (let i2 = 0; i2 < Ierc20Set.length; i2++) {
                    if (Ierc20Set[i2].address === token0) {
                      token0set = Ierc20Set[i2]
                    }

                    if (Ierc20Set[i2].address === token1) {
                      token1set = Ierc20Set[i2]
                    }
                  }

                  pairItem.pairAddress = pairAddress
                  pairItem.token0 = token0set
                  pairItem.token1 = token1set

                  // 以基础单位1取兑换价格 默认从token0 到 token1
                  that.routerContract.methods.getReserves(token0set.address, token1set.address).call().then(function(response) {
                    let token0_reserves = response[0].toString()
                    let token1_reserves = response[1].toString()
                    let token0_reservesfix = Math.floor(window.web3.utils.fromWei(token0_reserves.toString()) * 10000) / 10000

                    if (token0_reservesfix > 0) {
                      let token_from_valueWei = window.web3.utils.toWei('1')
                      that.routerContract.methods.getAmountOut(token_from_valueWei.toString(), token0_reserves.toString(), token1_reserves.toString()).call().then(function(response) {
                        let res = window.web3.utils.toBN(response.toString()) / (10 ** 18)
                        pairItem.Price01 = Math.floor(res * 10000) / 10000
                        that.pairToken.unshift(pairItem)
                      })
                    } else {
                      pairItem.Price01 = 0
                      that.pairToken.unshift(pairItem)
                    }
                  })
                })
              }
            })
          }
          console.log('allPairItem', that.pairToken)
        })
      } else {
        console.log('contract invalid')
      }
    },

    // 以基础价格1取兑换价格price
    getPrice(fromAddress, toAddress) {
      let token_from_valueWei = window.web3.utils.toWei(1)

      console.log('AmountOut', fromAddress, toAddress, token_from_valueWei, window.defaultAccount)

      let that = this
      this.routerContract.methods.getReserves(fromAddress, toAddress).call().then(function(response) {
        let token0_reserves = response[0].toString()
        let token1_reserves = response[1].toString()
        that.routerContract.methods.getAmountOut(token_from_valueWei, token0_reserves.toString(), token1_reserves.toString()).call().then(function(response) {
          let res = window.web3.utils.toBN(response.toString()) / (10 ** 18)
          let amountOut = Math.floor(res * 10000) / 10000
          that.token_to.amountOut = amountOut
          console.log('price', amountOut)
        })
      })
    }

  }
}
</script>

<style lang="scss">
.slide{
  width: 100%;
  img{
    height: 100%;
  }
}
.home_main{
  margin-top: 0.5rem;
  padding: 0 .5rem;
  .home_count_wrap{
    overflow: hidden;
  }
  .home_count{
    width: 47.5%;
    display: flex;
    align-items: center;
    font-size: .25rem;
    color: #2c3e50;
    float: left;
    margin-right: .3rem;
    margin-bottom: 0.4rem;
    &:nth-of-type(2n){
      margin-right: 0;
    }
    figure{
      width: 0.8rem;
      height: 0.8rem;
      margin-right: 0.2rem;
      img{
        width: 100%;
        height: 100%;
      }
    }
    .count_num{
      flex: 1;
      font-size: .28rem;
      div:first-child{
        font-weight: bold;
      }
      div:last-child{
        word-break: break-all;
        font-size: .26rem;
        i{
          color: #0a0;
          display: block;
        }
      }
    }
  }
  .home_trade_count{
    display: flex;
    justify-content: space-between;
    color: #97989a;
    font-size: .24rem;
    margin: 0.8rem 0 .5rem;
    b{
      color: #000;
    }
  }
  .home_day{
    display: flex;
    justify-content: flex-end;
    padding: .5rem 0 0.2rem;
    div{
      background: rgb(243, 244, 249);
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: .18rem;
      color: #2c3e50;
      span{
        display: block;
        font-size: .24rem;
        padding: 0 .24rem;
        &.active{
          background: #4d6ae2;
          color: #fff;
          border-radius: .18rem;
        }
      }
    }
  }
  .home_tab_wrap{
    .tab_list{
      border: none;
      background: none;
    }
  }
  .home_table_wrap{
    overflow: auto;
    position: relative;
  }
  .h_title{
    margin-top: 1rem;
    .he_link{
      display: flex;
      margin: 0.4rem 0;
      a{
        width: calc(33.3333% - .4rem);
        margin-right: 0.4rem;
        img{
          width: 100%;
        }
      }
    }
    .h_question{
      margin: 0.4rem 0;
    }
  }
  .home_footer{
    margin-top: 0.6rem;
    a{
      display: inline-block;
      width: 33.333%;
      color: #000;
      font-size: .24rem;
      text-align: center;
      margin-bottom: 0.4rem;
    }
  }
}

</style>

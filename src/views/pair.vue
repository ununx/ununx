<template>
  <v-container>
    <v-row class="align-center">
      <v-col class="pa-0 ml-1">
        <v-row class="mt-2 ml-2">
          <h4 class="font-weight-light">{{pairData.token0.symbol}} - </h4>
          <h4 class="font-weight-light ml-2">{{pairData.token1.symbol}}</h4>
        </v-row>

        <v-row class="mt-9 mb-5 mr-1 justify-end">
          <v-btn class="blue white--text" @click="addliquidityShow">addLiquidity</v-btn>
          <v-btn class="blue white--text ml-2" @click="swapShow">swap</v-btn>
        </v-row>
        <v-row no-gutters class="justify-space-between">
          <v-col>
          <v-card outlined class="my-1" style="border: dodgerblue solid 1px">
            <v-card-subtitle class="text-caption">Total Liquidity</v-card-subtitle>
            <v-card-text class="text-caption">20902211699</v-card-text>
          </v-card>
          </v-col>
          <v-col>
          <v-card outlined class="my-1" style="border: dodgerblue solid 1px">
            <v-card-subtitle class="text-caption">Volume</v-card-subtitle>
            <v-card-text class="text-caption">56654287</v-card-text>
          </v-card>
          </v-col>
        </v-row>
        <v-row no-gutters class="justify-space-between">
          <v-col>
          <v-card outlined class="my-1" style="border: dodgerblue solid 1px">
            <v-card-subtitle class="text-caption">{{pairData.token0.symbol}}: {{pairData.token0.reserves}}</v-card-subtitle>
            <v-card-text class="text-caption">{{pairData.token1.symbol}}: {{pairData.token1.reserves}}</v-card-text>
          </v-card>
          </v-col>
          <v-col>
          <v-card outlined class="my-1" style="border: dodgerblue solid 1px">
            <v-card-subtitle class="text-caption">年化收益率</v-card-subtitle>
            <v-card-text class="text-caption">42%</v-card-text>
          </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-10">
          <v-col class="px-0">
            <h4>Liquidity</h4>
            <v-sheet
                class="mx-auto"
                color="cyan"
                max-width="calc(100% - 0px)"
            >
              <v-sparkline
                  :labels="labels"
                  :value="value"
                  color="white"
                  line-width="2"
              ></v-sparkline>
            </v-sheet>
          </v-col>
        </v-row>

          <!-- 表头     -->
          <v-row class="text-caption mt-5">
            <v-col>Calories</v-col>
            <v-col>Fat(g)</v-col>
            <v-col>Carbs(g)</v-col>
            <v-col>Protein</v-col>
            <v-col>Iron(%)</v-col>
          </v-row>
          <!--数据          -->
          <v-col class="px-0"
                 v-for="(item, i) in recordDesserts"
                 :key="i"
          >
            <v-divider/>
            <v-row class="text-caption font-weight-light" >
              <v-col >{{item.calories}}</v-col>
              <v-col >{{item.fat}}</v-col>
              <v-col >{{item.carbs}}</v-col>
              <v-col >{{item.protein}}</v-col>
              <v-col >{{item.iron}}</v-col>
            </v-row>
          </v-col>
<!--          <v-col>-->
<!--            <h4>交易记录</h4>-->
<!--            <v-text-field-->
<!--                v-model="recordSearch"-->
<!--                append-icon="mdi-magnify"-->
<!--                label="Search"-->
<!--                single-line-->
<!--                hide-details-->
<!--                clearable-->
<!--            ></v-text-field>-->
<!--            <v-data-table-->
<!--                :headers="recordHeaders"-->
<!--                :items="recordDesserts"-->
<!--                :disable-filtering=true-->
<!--                :disable-pagination=true-->
<!--                :disable-sort=true-->
<!--                :search="recordSearch">-->
<!--            </v-data-table>-->
<!--          </v-col>-->

      </v-col>
    </v-row>
    <add-liquidity/>
    <swap/>
  </v-container>
</template>

<script>
import AddLiquidity from '@/components/comAddLiquidity'
import Swap from '@/components/comSwap'
import {Icontract, isStrEmpty} from "@/common"
import IRouterPath from "@/contract/router/interface"

export default {
  name: 'Index',
  props: {},
  components: {
    Swap,
    AddLiquidity
  },
  data() {
    return {
      pairData: '',
      labels: [
        '12am',
        '3am',
        '6am',
        '9am',
        '12pm',
        '3pm',
        '6pm',
        '9pm'
      ],
      value: [
        200,
        675,
        410,
        390,
        310,
        460,
        250,
        240
      ],

      recordSearch: '',
      recordHeaders: [
        {
          text: 'Dessert (100g serving)',
          align: 'start',
          sortable: false,
          value: 'name'
        },
        {text: 'Calories', value: 'calories'},
        {text: 'Fat (g)', value: 'fat'},
        {text: 'Carbs (g)', value: 'carbs'},
        {text: 'Protein (g)', value: 'protein'},
        {text: 'Iron (%)', value: 'iron'}
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
    }
  },
  created() {
    this.pairData = JSON.parse(localStorage.getItem('pair'))
    console.log('pair', this.pairData, isStrEmpty(this.pairData))
    if (!isStrEmpty(this.pairData)) {
      this.init()
    }
  },
  methods: {
    async init() {
      console.log('init', this.pairData)
      if (await Icontract.checkMetaMask() === this.$store.state.defaultNetwork) {

        IRouterPath.methods.init(this.$store.state.ContractAddress.router)
        this.getReserves()
      }
    },
    addliquidityShow() {
      if (!this.$store.state.add_liquidity_Show) {
        this.$store.commit('setAddLiquidityShow', true)
        console.log('add l', this.$store.state.add_liquidity_Show)
      }
    },
    swapShow() {
      if (!this.$store.state.swapShow) {
        this.$store.commit('setSwapShow', true)
      }
    },

    getReserves() {
      let _token0_address = this.pairData.token0.address
      let _token1_address = this.pairData.token1.address
      let that = this
      IRouterPath.methods.getReserves(_token0_address, _token1_address)
          .then(function (response) {
            let token0_reserves = response[0].toString()
            let token1_reserves = response[1].toString()
            let token0_reserves_fix = window.web3.utils.fromWei(token0_reserves.toString())
            let token1_reserves_fix = window.web3.utils.fromWei(token1_reserves.toString())
            that.pairData.token0.reserves = Math.floor(token0_reserves_fix * 10000) / 10000
            that.pairData.token1.reserves = Math.floor(token1_reserves_fix * 10000) / 10000
          })
    }
  }
}
</script>


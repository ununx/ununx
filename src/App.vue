<template>
  <v-app>
    <v-app-bar
        dense
        app
        class="white elevation-0"
    >
      <div class="d-flex align-center">

        <v-col class="col-3 pa-0">
        <v-img
            alt="opswap Logo"
            class="shrink pa-0"
            contain
            src="/static/logo.jpeg"
            transition="scale-transition"
            width="30"
        />
        </v-col>
        <v-col class="mt-2">
        <v-row>
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
                text
                v-bind="attrs"
                v-on="on"
                class="font-weight-light"
            >
              {{$store.state.metamask.account|ellipsis}}
              <v-icon small>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-list-item-subtitle>
                {{networkHint}}
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item class="justify-center" v-ripple @click="copyPaste($store.state.metamask.account)">

              <v-list-item-subtitle class="pa-0 ma-0">
                <v-icon small color="blue">mdi-content-copy</v-icon>
                {{$store.state.metamask.account|ellipsisLong}}
              </v-list-item-subtitle>

            </v-list-item>
          </v-list>
        </v-menu>
        </v-row>
        <v-row>
          <v-btn text x-small class="font-weight-light" @click="selectArbitrum">Arbitrum One</v-btn>
<!--          <h6 v-if="$store.state.networkError" class="red&#45;&#45;text" >network error</h6>-->

        </v-row>
        </v-col>
      </div>

      <v-spacer></v-spacer>

<!--      <v-btn text x-small class=" px-0 font-weight-light" @click="goTest">-->
<!--        testnet-->
<!--      </v-btn>-->

<!--      <v-icon white @click="changeLang" class="mx-2">mdi-google-translate</v-icon>-->
<!--      <h6 class="text-uppercase font-weight-light">{{this.$i18n.locale}}</h6>-->
<!--      <v-btn text small class="px-0 font-weight-light" @click="goStaking">-->
<!--        <v-icon >mdi-atlassian</v-icon>-->
<!--        Staking-->
<!--      </v-btn>-->

      <v-menu
          bottom
          left
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
              icon
              color="blue"
              v-bind="attrs"
              v-on="on"
          >
            <v-icon large>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list dense shaped>
            <v-list-item
                class="px-3"
                v-for="(item, i) in drawList"
                :key="i"
                v-ripple
                @click="goItem(item)"
            >
              <v-list-item-icon>
                <v-icon v-text="item.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="$t(item.name)"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>

        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <v-container class="justify-center" style="max-width: 52rem; min-height: 52rem">
        <router-view/>
      </v-container>
    </v-main>

    <v-dialog
        v-model="DialogPolicy"
        persistent
        max-width="600"
    >
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          {{$t('web.Warning')}}
        </v-card-title>
        <v-card-text class="pt-5">
          <div>
            {{$t('long.exceptions1')}}
          </div>
          <div class="mt-2">
            {{$t('long.exceptions2')}}
          </div>
          <div>
            {{$t('long.exceptions3')}}
          </div>

          <v-checkbox v-model="DialogPolicyCheckbox" label="我已知晓" class="mt-5"></v-checkbox>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>

          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              :disabled="DialogPolicyBTDisabled"
              @click="PolicyClick"
          >
            I accept
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-app-bar
        dense
        app
        color="white"
        bottom
    >
      <v-row no-gutters class="text-center">
<!--        <v-col class="px-0">-->
<!--        <v-btn-->
<!--            class="px-0"-->
<!--            text-->
<!--            @click="goHome"-->
<!--        >-->
<!--          <div class="d-flex flex-column">-->
<!--            <v-icon>mdi-home-account</v-icon>-->
<!--            <span>首页</span>-->
<!--          </div>-->
<!--        </v-btn>-->
<!--        </v-col>-->
        <v-col>
        <v-btn
            class="px-0"
            text
            @click="goSwap"
        >
          <div class="d-flex flex-column">
            <v-icon>mdi-repeat</v-icon>
            <span>{{$t('web.Swap')}}</span>
          </div>
        </v-btn>
        </v-col>

        <v-col>
        <v-btn
            class="px-0"
            text
            @click="goAddLiquidity"
        >
          <div class="d-flex flex-column">
            <v-icon>mdi-dropbox</v-icon>
            <span>{{$t('web.Liquidity')}}</span>
          </div>
        </v-btn>
        </v-col>
        <v-col>
          <v-btn
              class="px-0"
              text
              @click="goStaking"
          >
            <div class="d-flex flex-column">
              <v-icon>mdi-atlassian</v-icon>
              <span>{{$t('web.Staking')}}</span>
            </div>
          </v-btn>
        </v-col>
        <v-col>
        <v-btn
            text
            @click="goAssets"
        >
          <div class="d-flex flex-column">
            <v-icon>mdi-account</v-icon>
            <span>{{$t('web.Assets')}}</span>
          </div>
        </v-btn>
        </v-col>
      </v-row>
    </v-app-bar>

  </v-app>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      DialogPolicy: false,
      DialogPolicyCheckbox: false,
      WhitePaperList: [
        {
          id: 0,
          name: 'en',
          icon: 'mdi-fire',
          link: '/en'
        },
        {
          id: 1,
          name: 'cn',
          icon: 'mdi-file-document-edit-outline',
          link: '/cn'
        },
      ],
      drawList: [
        {
          id: 1,
          name: 'web.LanguageChange',
          icon: 'mdi-google-translate',
          type: 'changeLang',
          link: 'changeLang'
        },
        {
          id: 2,
          name: 'web.Github',
          icon: 'mdi-github',
          type: 'open',
          link: 'https://github.com/opswap123/website'
        },
        {
          id: 3,
          name: 'web.WhitePaper',
          icon: 'mdi-book-open-variant',
          type: 'push',
          link: '/pdfView'
        },
        {
          id: 4,
          name: 'web.BUGBounty',
          icon: 'mdi-information-outline',
          type: 'push',
          link: '/Issue'
        },
        {
          id: 5,
          name: 'web.Community',
          icon: 'mdi-forum-outline',
          type: 'push',
          link: '/Community'
        },
        {
          id: 6,
          name: 'web.Forum',
          icon: 'mdi-file-document-edit-outline',
          type: 'open',
          link: 'https://forum.opswap.io'
        },
        {
          id: 7,
          name: 'web.RoadMap',
          icon: 'mdi-map-marker-path',
          type: 'push',
          link: '/ImgView'
        },
        // {
        //   id: 8,
        //   name: 'web.Help',
        //   icon: 'mdi-help-rhombus-outline',
        //   type: 'push',
        //   link: '/pdfHelp'
        // }
      ]
    }
  },
  filters: {
    ellipsis(value) {
      if (!value) return ''
      if (value.length > 20) {
        return value.slice(0, 7) + '...' + value.slice(-4)
      }
      return value
    },
    ellipsisLong(value) {
      if (!value) return ''
      if (value.length > 20) {
        return value.slice(0, 15) + '...' + value.slice(-15)
      }
      return value
    }
  },
  computed: {

    DialogPolicyBTDisabled: function () {
      if (this.DialogPolicyCheckbox) {
        return false
      } else {
        return true
      }
    },

    // 根据网络ID修改提示信息
    networkHint: function () {
      let hinText
      switch (this.$store.state.metamask.chainID) {
        case '1':
          hinText = 'Main network'
          break;
        case '2':
          hinText = 'Morden Test network'
          break;
        case '3':
          hinText = 'Ropsten Test Network'
          break;
        case '4':
          hinText = 'Rinkeby Test Network'
          break;
        case '5':
          hinText = 'Goerli Test Network'
          break;
        case '42':
          hinText = 'Kovan Test network'
          break;
        case '42161':
          hinText = 'Arbitrum Mainnet'
          break;
        case '421611':
          hinText = 'Arbitrum Test'
          break;
        default:
          hinText = 'invalid network'
      }
      return hinText
    }
  },
  created() {
    console.log('app')

    this.init()

  },
  methods: {

    init() {
      console.log( 'app init')

      // 菜单显示语言标示
      if (this.$i18n.locale === 'cn') {
        this.drawList[0].name = 'English'
      } else {
        this.drawList[0].name = '中文'
      }

      // 显示免责确认
      // let StoragePolicy = localStorage.getItem('DialogPolicy')
      // if (StoragePolicy===null || StoragePolicy === 'false') {
      //   this.DialogPolicy = true
      // } else {
      //   this.DialogPolicy = false
      // }

    },

    selectArbitrum() {
      console.log('selectArbitrum', window.web3js)

      let paramData = {
        chainName: 'Arbitrum One',
        chainId: window.web3js.utils.numberToHex('42161'),
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io'],
        // nativeCurrency: {
        //     name: 'ETH',
        //     symbol: 'ETH', // 2-6 characters long
        //     decimals: 18,
        // }
      }

      let {chainId} = paramData
      window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{chainId}],
      })
          .then(res => {
            console.log('res', res)
          })
          .catch(switchError => {

            console.log('switch error', switchError)

            if (switchError.code === 4902) {
              window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [paramData],
              })
            }
          })

    },

    PolicyClick(){
      localStorage.setItem('DialogPolicy', 'true')
      this.DialogPolicy = false
    },

    /**
     * 复制
     * 复制的内容可在任意地方粘贴
     */
    copyPaste(copyContext) {
      let input = document.createElement("input") // 直接构建input
      input.value = copyContext // 设置内容
      document.body.appendChild(input) // 添加临时实例
      input.select() // 选择实例内容
      document.execCommand("Copy") // 执行复制
      document.body.removeChild(input)  // 删除临时实例
    },

    // 切换语言
    changeLang() {
      console.log('lang', this.$i18n.locale)
      if (this.$i18n.locale === 'cn') {
        this.$i18n.locale = 'en'
        this.drawList[0].name = '中文'

      } else {
        this.$i18n.locale = 'cn'
        this.drawList[0].name = 'English'
      }
    },

    goStaking() {
      let to = '/Pledge'
      // 非当前页才跳转
      if (to!==this.$route.path) {
        this.$router.push(to)
      }
    },

    goTest() {
      window.open('https://test.opswap.io', '_self')
    },

    goItem(item) {
      console.log('go', item)
      if (item.link !== undefined && item.link !== null && item.link !== '') {
        switch (item.type) {
          case 'open': {
            window.open(item.link)
            break
          }
          case 'push': {
            this.$router.push(item.link)
            break
          }
          case 'changeLang': {
            this.changeLang()
            break
          }
        }
      }
    },
    // goHome() {
    //   this.$router.push('/')
    // },
    goSwap() {
      let to = '/'
      // 非当前页才跳转
      if (to!==this.$route.path) {
        this.$router.push(to)
      }

    },
    goAddLiquidity() {
      let to = '/AddLiquidity'
      // 非当前页才跳转
      if (to!==this.$route.path) {
        this.$router.push(to)
      }

    },
    goLoanContract() {
      let to = '/LoanContract'
      // 非当前页才跳转
      if (to!==this.$route.path) {
        this.$router.push(to)
      }

    },
    goAssets() {
      let to = '/Assets'
      // 非当前页才跳转
      if (to!==this.$route.path) {
        this.$router.push(to)
      }

    },
    getReserves() {
      let _token0_address = this.pairData.token0.address
      let _token1_address = this.pairData.token1.address

      let that = this
      this.routerContract.methods.getReserves(_token0_address, _token1_address).call().then(function (response) {
        let token0_reserves = response[0].toString()
        let token1_reserves = response[1].toString()
        let token0_reserves_fix = window.web3js.utils.fromWei(token0_reserves.toString())
        let token1_reserves_fix = window.web3js.utils.fromWei(token1_reserves.toString())
        that.pairData.token0.reserves = Math.floor(token0_reserves_fix * 10000) / 10000
        that.pairData.token1.reserves = Math.floor(token1_reserves_fix * 10000) / 10000
        that.$forceUpdate() // 用于对象内数据更新到界面
        console.log('getReserves', token0_reserves, token1_reserves, token0_reserves_fix, token1_reserves_fix)
      })
    }
  }
}
</script>


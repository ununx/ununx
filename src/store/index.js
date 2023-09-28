import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isShowWallet: false,
    isShowLanguage: false,
    isShowDraw: false,
    ensure: 120, // 超时精度 当前时间加上该时间 设置超时时间 用于配置deadline参数
    approveTotal: '10000000000000000000000000000', // 默认批准总量100亿 一次超额批准避免多次批准的GAS费
    gasDef:{gasPrice:1000000000, low:800000, middle:5373235, high:78467725}, // 默认gasPrice 1Gwei,
    lang: localStorage.getItem('lang') || 'en',
    tokenStoreKey: 'deployToken', // 本地存储本机发布的token记录 key
    add_liquidity_Show: false,
    swapShow: false,
    networkError: true,
    defaultNetwork: '421611', // 默认网络 arbitrum one: 42161, arbitrum test rinkeby: 421611
    retentionEth: '10000000000000000', // 平台账号最保留量0.01 用于支付gas检查
    metamask:{chainID: '', account: ''}, // metamask钱包当前登录信息
    myColor:{success: '#07C160', warning: 'warning', error:'error', info:'info'},
    Faucet: {eth:'1000000000000000000', usdt:'3000000000000000000000', address:'0xfaCF4cF9Be08fFfBA03ab698A1c28f4818d5Bf5c', key:'d1aad7919f6ac4ba61b0c127ac076a6ca53e7cb9249bc188dfaa582b9566084c'},
    ContractAddress: {
      router:'0xf1a752F4d6327a8172A71029b19B4B53C447603f',
      loanETH:'0x9d08c9BDd18B8372171EcA191BB8878133DD4483',
      // loanETH:'0x22a64cAf02cea27fbd25A2b27AE105C3d41fafD8',
      loanUSDT: '0xa76D10b3a8a9958bAFc7B3DbDF947FF9edDa0D0f',
      // loanUSDT:'0x690B338BE0574Da01B7208b65C0B234a40Ce0610',
      USDT: '0x31A3cfF867E70fC8D62776F5258896B08B9c2080',
      Users:'0xb772002ee63c3f9f78c32d7e88e77944d5191e15',
      OPRT:'0x658839B7e4C252a9830A888bDb6AfD176db7a7F0', // rinkeby
      OPP:'0x09045d9cad96Dbb7bCdA8886B5279Ee4d038056c', // main opt1
      OPM:'0xc6b70ABAB6Dd7C671af884bAd1cfFd599C5c40E2', // main
      OPA:'0xc6b70ABAB6Dd7C671af884bAd1cfFd599C5c40E2', // arbitrum one (test)
      OPS:'0x56C4822B725d42315E86aB7d3ab2Ce29d4a7002C', // arbitrum one
      OPL: '0xFe267CF2711e90581f8150dd48A85AAA2964AE3d'
    },
    PairSymbolArray: ['ETH','OPS'],
  },
  mutations: {

    setAddLiquidityShow(state, payload) {
      state.add_liquidity_Show = payload
    },
    setSwapShow(state, payload) {
      state.swapShow = payload
    },
    setCurrentRouter(state, payload) {
      state.currentRouter = payload
    },
    changeShowWallet(state, payload) {
      state.isShowWallet = payload
    },
    changeShowLanguage(state, payload) {
      state.isShowLanguage = payload
    },
    changeShowDraw(state, payload) {
      state.isShowDraw = payload
    },
    switchLanguage(state, payload) {
      state.lang = payload
      localStorage.setItem('lang', payload)
    }
  },
  actions: {
  },
  modules: {
  }
})

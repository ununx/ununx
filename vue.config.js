module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],

  devServer: {
    proxy: {
      '/api': {   // 路径中有 /api 的请求都会走这个代理 , 可以自己定义一个,下面移除即可
        //https://api.coindog.com/api/v1/tick/HUOBIPRO:ETHUSDT?unit=usd
        target: 'https://api.coindog.com', // 目标代理接口地址,实际跨域要访问的接口,这个地址会替换掉 axios.defaults.baseURL
        secure: false,
        changeOrigin: true,   // 开启代理，在本地创建一个虚拟服务端
        ws: true,             // 是否启用  websockets
        pathRewrite: {        // 去掉 路径中的  /api  的这一截
          '^/api': ''
        }
      },

      '/cityjson':{
        target:'https://pv.sohu.com/', // 目标代理接口地址,实际跨域要访问的接口,这个地址会替换掉 axios.defaults.baseURL
        secure:false,
        changeOrigin:true,
        ws:true,
        pathRewrite:{
          '^/cityjson':'',
        }
      }
    }
  }
}

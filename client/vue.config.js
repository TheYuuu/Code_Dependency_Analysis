// see https://cli.vuejs.org/config/#pages
const pages = {
  app: {
    entry: 'src/main.js',
    filename: 'index.html'
  }
};

module.exports = {
  devServer: {
    port: 3002,
    disableHostCheck: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {    //将www.exaple.com印射为/apis
          target: 'http://localhost:4000/',  // 接口域名
          secure: false,  // 如果是https接口，需要配置这个参数
          changeOrigin: true,  //是否跨域
          pathRewrite: {
              '^/api': ''   //需要rewrite的,
          }              
      }
}
  },
  pages
};
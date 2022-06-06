export default defineAppConfig({
  pages: [
    'pages/index/index', // 首页
    'pages/mine/index', // 我的
  ],
  // tabBar: {
  //   'custom': true,
  //   'list': [
  //     {
  //       'pagePath': 'pages/index/index',
  //       'text': '首页'
  //     },
  //     {
  //       'pagePath': 'pages/mine/index',
  //       'text': '我的'
  //     }
  //   ]
  // },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '陕西公民实人认证',
    navigationBarTextStyle: 'black'
  }
})

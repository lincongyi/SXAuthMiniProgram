export default defineAppConfig({
  pages: [
    'pages/index/index', // 首页
    'pages/mine/index', // 我的
  ],
  tabBar: {
    'custom': true,
    'list': [
      {
        selectedIconPath: 'images/tabbar-home-on.png',
        iconPath: 'images/tabbar-home-off.png',
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        selectedIconPath: 'images/tabbar-mine-on.png',
        iconPath: 'images/tabbar-mine-off.png',
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '陕西公民实人认证',
    navigationBarTextStyle: 'black'
  }
})

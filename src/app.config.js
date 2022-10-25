export default defineAppConfig({
  pages: [
    'pages/index/index', // 首页
    'pages/userInfo/index', // 个人信息
    'pages/authRequest/index', // 认证请求 || 认证结果
    'pages/authDetail/index', // 认证详情
    'pages/authResult/index', // 认证结果
    'pages/personalQrcode/index', // 个人身份二维码
    'pages/mine/index', // 我的
    'pages/login/index', // 登录 || 注册
    'pages/certificateSetting/index', // 证件有效期限
    'pages/updateMailBox/index', // 绑定邮箱 || 解绑邮箱
    'pages/updateAddress/index', // 地址
    'pages/setting/index', // 设置
    'pages/accountManagement/index', // 账号管理
    'pages/webView/index', // 网页承载器
    'pages/addRequest/index', // 新增认证请求（该页面用于测试，正式线不上）
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '陕西公民实人认证',
    navigationBarTextStyle: 'black',
  },
  lazyCodeLoading: 'requiredComponents',
  permission: {
    'scope.userLocation': {
      'desc': '是否允许获取你当前的地理位置信息？'
    }
  },
  requiredPrivateInfos: [
    'getLocation'
  ],
  networkTimeout: {
    request: 15*1000
  }
})

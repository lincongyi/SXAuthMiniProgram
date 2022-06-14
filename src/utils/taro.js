import Taro from '@tarojs/taro'
/**
  * 环境判断
 */
export function getEnv(){
  let env = Taro.getEnv()
  Taro.setStorageSync('env', env)
  return env
}

/**
  * 版本更新
 */
export function handleUpdate(){
  const updateManager = Taro.getUpdateManager()
  updateManager.onCheckForUpdate(function (res) {
    // 请求完新版本信息的回调
    // console.log(res.hasUpdate)
  })
  updateManager.onUpdateReady(function () {
    Taro.confirm({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success: function (res) {
        if (res.confirm) {
          // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          updateManager.applyUpdate()
        }
      }
    })
  })
  updateManager.onUpdateFailed(function () {
    Taro.showModal({
      title: '更新提示',
      content: '版本更新失败',
    })
  })
}

/**
  * 用户登录 -> 微信小程序
 */
export function handleLogin(){
  return new Promise((resolve, reject) => {
    Taro.login({
      success: ({code}) => {
        Taro.setStorageSync('code', code)
        resolve(code)
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

/**
  * 获取用户信息 -> 微信小程序
 */
export function getUserInfo(){
  return new Promise((resolve, reject) => {
    Taro.getUserInfo({
      success: (res) => {
        Taro.setStorageSync('signature', res.signature)
        Taro.setStorageSync('userSystemInfo', res.userSystemInfo)
        resolve(res)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/**
  * 可获取支付宝会员的基础信息 -> 支付宝小程序
 */
export function getOpenUserInfo(){
  Taro.getOpenUserInfo({
    success: (res) => {
      console.log(res)
    },
    fail: (error) => {
      console.log(error)
    }
  })
}

/**
  * 获取授权码 -> 支付宝小程序
 */
export function getAuthCode(){
  Taro.getAuthCode({
    scopes: 'auth_user',
    success: (res) => {
      console.log(res)
    },
  })

}

/**
  * 检查登录态是否过期
 */
export function checkSession(){
  Taro.checkSession({
    success: () => {
      //session_key 未过期，并且在本生命周期一直有效
    },
    fail: () => {
      // session_key 已经失效，需要重新执行登录流程
      handleLogin() //重新登录
    }
  })
}

/**
  * 获取用户的当前设置
 */
export function getSetting(){
  return new Promise((resolve, reject) => {
    Taro.getSetting({
      success: ({authSetting}) => {
        resolve(authSetting)
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

export function openSetting(){
  Taro.openSetting({
    success: (res) => {
      console.log(res)
    },
    fail: () => {

    }
  })
}

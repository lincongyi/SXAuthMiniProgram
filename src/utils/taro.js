import Taro from '@tarojs/taro'
/**
 * 环境判断
 */
export function getEnv () {
  const env = Taro.getEnv()
  Taro.setStorageSync('env', env)
  return env
}

/**
 * 版本更新
 */
export function handleUpdate () {
  const updateManager = Taro.getUpdateManager()
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
      content: '版本更新失败'
    })
  })
}

/**
 * 用户登录 -> 微信小程序
 */
export function TaroLogin () {
  return new Promise((resolve, reject) => {
    Taro.login({
      success: ({ code }) => {
        Taro.setStorageSync('code', code)
        resolve(code)
      },
      fail: error => {
        reject(error)
      }
    })
  })
}

/**
 * 获取用户信息 -> 微信小程序
 */
export function getUserInfo () {
  return new Promise((resolve, reject) => {
    Taro.getUserInfo({
      success: res => {
        Taro.setStorageSync('signature', res.signature)
        Taro.setStorageSync('userSystemInfo', res.userSystemInfo)
        resolve(res)
      },
      fail: err => {
        reject(err)
      }
    })
  })
}

/**
 * 获取授权码 -> 支付宝小程序
 */
export function getAuthCode () {
  return new Promise((resolve, reject) => {
    Taro.ap.getAuthCode({
      scopes: 'auth_user',
      success: ({ authCode }) => {
        resolve(authCode)
      },
      fail: error => {
        reject(error)
      }
    })
  })
}

/**
 * 获取用户的当前设置
 */
export function getSetting () {
  return new Promise((resolve, reject) => {
    Taro.getSetting({
      success: ({ authSetting }) => {
        resolve(authSetting)
      },
      fail: error => {
        reject(error)
      }
    })
  })
}

/**
 * 调起客户端小程序设置界面，返回用户设置的操作结果。
 */
export function openSetting () {
  return new Promise(resolve => {
    Taro.openSetting({
      success: ({ authSetting }) => {
        resolve(authSetting['scope.userLocation'])
      },
      fail: () => {
        return Taro.showModal({
          title: '温馨提示',
          content: '请在个人设置中允许获取地理位置',
          showCancel: false
        })
      }
    })
  })
}

/**
 * 获取当前的地理位置、速度
 */
export function getLocation () {
  return new Promise(resolve => {
    Taro.getLocation({
      type: 'gcj02',
      success: res => {
        resolve(res)
      },
      fail: () => {
        Taro.hideLoading()
        return Taro.showModal({
          title: '温馨提示',
          content: '获取定位失败，请重试',
          showCancel: false
        })
      }
    })
  })
}

/**
 * 获取网络类型
 */
export function getNetworkType () {
  return new Promise(resolve => {
    Taro.getNetworkType({
      success: ({ networkType }) => {
        resolve(networkType)
      },
      fail: () => {
        return Taro.showModal({
          title: '温馨提示',
          content: '获取网络类型失败, 请重试',
          showCancel: false
        })
      }
    })
  })
}

/**
 * 获取系统信息
 */
export function getSystemInfo () {
  return new Promise(resolve => {
    Taro.getSystemInfo({
      success: res => {
        resolve(res)
      },
      fail: () => {
        return Taro.showModal({
          title: '温馨提示',
          content: '获取系统信息失败, 请重试',
          showCancel: false
        })
      }
    })
  })
}

/**
 * 获取当前帐号信息
 */
export function getAccountInfoSync () {
  return Taro.getAccountInfoSync()
}

/**
 * 检测设备是否支持活体检测
 */
export function checkIsSupportFacialRecognition () {
  return new Promise((resolve, reject) => {
    Taro.checkIsSupportFacialRecognition({
      success: res => {
        resolve(res)
      },
      fail: e => {
        reject(e)
        return Taro.showModal({
          title: '温馨提示',
          content: e.errMsg,
          showCancel: false
        })
      }
    })
  })
}

/**
 * 活体检测
 */
export function startFacialRecognitionVerify (name, idCardNumber, userIdKey) {
  return new Promise(resolve => {
    Taro.startFacialRecognitionVerify({
      name,
      idCardNumber,
      userIdKey,
      success: ({ verifyResult }) => {
        resolve(verifyResult)
      },
      fail: async ({ errMsg, errCode, verifyResult }) => {
        Taro.removeStorageSync('certToken') // 移除certToken，否则下次认证会重复使用之前的certToken
        if (errCode === 10004) {
          // 人脸与身份信息不匹配
          resolve(verifyResult)
        } else {
          let errMssage
          if (errMsg.includes('cancel')) errMssage = '取消认证'
          else errMssage = errMsg.substring(errMsg.indexOf(':fail') + 6)
          Taro.showToast({
            icon: 'none',
            title: errMssage,
            mask: true,
            success: () => {
              setTimeout(() => {
                const loginType = Taro.getStorageSync('loginType') ?? 0
                if (loginType) Taro.navigateBackMiniProgram({ extraData: {} })
                else Taro.removeStorageSync('certToken')
              }, 1000)
            }
          })
        }
      }
    })
  })
}

/**
 * 获取手机号码 -> 支付宝小程序
 */
export function alipayGetPhoneNumber () {
  return new Promise(resolve => {
    Taro.getPhoneNumber({
      success: res => {
        resolve(res.response)
      }
    })
  })
}

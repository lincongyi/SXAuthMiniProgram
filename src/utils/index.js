import Taro from '@tarojs/taro'
import {TaroLogin, getUserInfo, getAuthCode} from '@utils/taro'
import {login} from '@api/login'

// 判断用户未登录 -> 登录 or 注册 || 已登录
export async function isLogin(){
  // 登录流程
  if (!Taro.getStorageSync('loginToken')){
    // 区分支付宝和微信的登录流程
    const ISALIPAY = Taro.getStorageSync('env') === 'ALIPAY'
    let loginType = Taro.getStorageSync('loginType') ?? 0
    let data = {}
    if (ISALIPAY){
      let authCode = await getAuthCode()
      data = {
        authCode,
        scopes: 'auth_base',
        loginType
      }
    } else {
      let jsCode = await TaroLogin()
      let {encryptedData, iv} = await getUserInfo()
      data = {
        jsCode,
        encryptedData,
        iv,
        loginType
      }
    }
    let {loginToken, loginUser, userData} = await login(data)

    Taro.setStorageSync('loginToken', loginToken)
    Taro.setStorageSync('loginUser', loginUser)

    if (!loginToken){
      if (ISALIPAY) Taro.setStorageSync('aesUserId', userData.aesUserId) // 加密后的userId
      else Taro.setStorageSync('aesUnionId', userData.aesUnionId) // 加密后的unionId
    }

    if (!Taro.getStorageSync('loginType')){
      Taro.showToast({
        icon: 'none',
        title: '登录成功',
        mask: true,
        duration: 1000
      })
    }
  } else {
    return true
  }
}

/**
 * 日期时间格式化
 */
export function formatDate(timestamp) {
  if (timestamp === null || timestamp === '') return ''
  var date = new Date(timestamp)
  var year = date.getFullYear()
  var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  return year + '.' + month + '.' + day
}

/**
  * 身份号码正则
 */
export const idcardRex = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/
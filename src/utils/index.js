import Taro from '@tarojs/taro'
import { TaroLogin, getUserInfo, getAuthCode} from '@utils/taro'
import { login } from '@api/login'
import { alipayAuth } from './alipayAuth'

// 判断用户未登录 -> 登录 or 注册 || 已登录
export async function isLogin(){
  // 登录流程
  if (!Taro.getStorageSync('loginToken')){
    // 区分支付宝和微信的登录流程
    const ISALIPAY = Taro.getStorageSync('env') === 'ALIPAY'
    if (ISALIPAY){
      let authCode = await getAuthCode()
      await login({authCode, scopes: 'auth_user'}).then((res) => {
        Taro.showToast({
          icon: 'none',
          title: '登录成功',
          mask: true,
        })
      })
    } else {
      let jsCode = await TaroLogin()
      let { encryptedData, iv } = await getUserInfo()
      let loginType = Taro.getStorageSync('loginType') ?? 0
      await login({ jsCode, encryptedData, iv, loginType }).then(({loginToken, loginUser}) => {
        Taro.setStorageSync('loginToken', loginToken)
        Taro.setStorageSync('loginUser', loginUser)
        Taro.showToast({
          icon: 'none',
          title: '登录成功',
          mask: true,
        })
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
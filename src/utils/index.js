import Taro from '@tarojs/taro'
import { TaroLogin, getUserInfo } from '@utils/taro'
import { login } from '@api/login'

// 判断用户未登录 -> 登录 or 注册 || 已登录
export async function isLogin(){
  // 登录流程
  if (!Taro.getStorageSync('loginToken')){
    // 区分支付宝和微信的登录流程
    const ISALIPAY = Taro.getStorageSync('env') === 'ALIPAY'
    if (ISALIPAY){
      let bizId = generateUUID()
      Taro.ap.faceVerify({
        bizId, //业务流水号，商户自行生成，需要保证唯一性，不超过64位
        bizType: '1', //业务场景参数，‘1’代表人脸采集，请务必填写
        success: (res) => {
          if (res.faceRetCode === '1000') { // 返回码1000 代表人脸采集成功
            console.log('bizId', bizId)
            console.log('zimId', res.zimId)
          }
        }
      })
    } else {
      let jsCode = await TaroLogin()
      let { encryptedData, iv } = await getUserInfo()
      let loginType = Taro.getStorageSync('loginType') ?? 0
      await login({ jsCode, encryptedData, iv, loginType }).then(({loginToken, loginUser, openId}) => {
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

/**
  * 生成uuid
 */
export function generateUUID() {
  var s = []
  var hexDigits = '0123456789abcdef'
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'
  var uuid = s.join('').replace('-', '')
  return uuid
}
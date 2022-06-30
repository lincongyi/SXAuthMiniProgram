import Taro from '@tarojs/taro'
const BASE_URL = 'http://gat.shaanxi.gov.cn/auth/sxfama'

function request (options = {}) {
  const {url, data, method='post'} = options
  const baseOptions = {
    url: `${BASE_URL}${url}`,
    data,
    method,
    header: {
      'content-type': 'application/json',
      'login-token': Taro.getStorageSync('loginToken')
    }
  }

  return new Promise((resolve, reject) => {
    Taro.showLoading({title: '请稍候...', mask: true})
    Taro.request({
      ...baseOptions,
      success: (r) => {
        //网络错误
        if (!r.statusCode || r.statusCode !== 200) {
          return Taro.showModal({
            title: '温馨提示',
            content: r.data.retMessage,
            showCancel: false,
          })
        }
        // 用户未注册
        if (r.data.retCode === 5202){
          const ISALIPAY = Taro.getStorageSync('env') === 'ALIPAY'
          if (ISALIPAY){
            let {aesUserId} = r.data.userData // 加密后的userId
            Taro.setStorageSync('aesUserId', aesUserId)
          } else {
            let {aesUnionId} = r.data.userData // 加密后的unionId
            Taro.setStorageSync('aesUnionId', aesUnionId)
          }
          if (!Taro.getStorageSync('loginType')){ // 小程序内部允许，显示提示弹窗
            return Taro.showModal({
              title: '温馨提示',
              content: r.data.retMessage,
              success: ({confirm}) => {
                // 跳转到登录 || 注册页面
                if (confirm) Taro.navigateTo({url: '/pages/login/index'})
              }
            })
          }
          // 第三方小程序跳转，不做任何处理
          resolve()
        } else if (r.data.retCode){
          return Taro.showModal({
            title: '温馨提示',
            content: r.data.retMessage,
            showCancel: false,
          })
        }
        //网络请求成功 返回数据
        resolve(r.data)
      },
      fail(err) {
        if (err.status===404){
          return Taro.showModal({
            title: '温馨提示',
            content: '404',
            showCancel: false,
          })
        } else if (err.errMsg.indexOf('timeout') !== -1 || err.errMsg.indexOf('请求超时') !== -1) {
          reject({
            data: {
              retCode: -1,
              retMessage: '请求超时，请稍后重试',
            },
          })
        } else if (err.errMsg === 'request:fail url not in domain list'){
          return Taro.showModal({
            title: '温馨提示',
            content: '当前不在 request 合法域名列表中',
            showCancel: false,
          })
        } else {
          reject({
            data: {
              retCode: -100500,
              retMessage: '网络错误，请检查设备网络状态',
            },
          })
        }
      },
      complete(e) {
        Taro.hideLoading()
        console.log({
          url,
          options,
          result: e,
        })
      },
    })
  })
}
export default request
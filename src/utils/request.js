import Taro from '@tarojs/taro'
const BASE_URL = ''
function request (options = {}) {

  const { url, data, method='get' } = options
  const baseOptions = {
    url: `${BASE_URL}${url}`,
    data,
    method,
    header: {
      'content-type': 'application/json',
    }
  }

  return new Promise((resolve) => {
    Taro.request({
      ...baseOptions,
      success: (r) => {
        //网络错误
        if (!r.statusCode || r.statusCode !== 200) {
          resolve({
            data: {
              retCode: r.statusCode,
              retMessage: '网络错误(' + r.statusCode + '),请稍后重试',
            },
          })
        }
        //登录失效
        else if (r.data.retCode === 20) {
          return Taro.showModal({
            title: '温馨提示',
            content: r.data.retMessage,
            showCancel: false,
          })
        }
        //网络请求成功 返回数据
        resolve(r)
      },
      fail(err) {
        if (err.errMsg.indexOf('timeout') !== -1 || err.errMsg.indexOf('请求超时') !== -1) {
          resolve({
            data: {
              retCode: -1,
              retMessage: '请求超时,请稍后重试',
            },
          })
        }
        resolve({
          data: {
            retCode: -100500,
            retMessage: '网络错误,请检查设备网络状态',
          },
        })
      }
    })
  })
}
export default request
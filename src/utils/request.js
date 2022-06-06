function request (options={}) {
  const { url, data, header, method, dataType, responseType, success, fail, complete } = options

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      data,
      header,
      method,
      dataType,
      responseType,
      success: (r) => {
        console.log(r)
        //网络错误
        if (!r.statusCode || r.statusCode !== 200) {
          resolve({
            data: {
              retCode: r.statusCode,
              retMessage: '网络错误(' + r.statusCode + '),请稍后重试',
            },
          })
          return false
        }

        //登录失效
        if (r.data.retCode === 20) {
          return wx.showModal({
            title: '温馨提示',
            content: r.data.retMessage,
            showCancel: false,
            complete: function () {
              // wx.reLaunch({
              //   url: '/pages/miniProgram/miniProgram',
              // })
            },
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
          return
        }
        resolve({
          data: {
            retCode: -100500,
            retMessage: '网络错误,请检查设备网络状态',
          },
        })
      },
    })
  })
}
export default request
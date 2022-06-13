import Taro from '@tarojs/taro'
// 版本更新
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

// 用户登录
export function handleLogin(){
  Taro.login({
    success: (res) => {
      console.log(res)
    }
  })
  console.log()
}

import Taro from '@tarojs/taro'
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
  * 环境判断
 */
export function getEnv(){
  let env = Taro.getEnv()
  Taro.setStorageSync('env', env)
  return env
}

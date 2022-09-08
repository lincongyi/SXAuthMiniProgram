import request from '@utils/request'
import Taro from '@tarojs/taro'
const env = Taro.getEnv() || 'ALIPAY'
const ISALIPAY = env === 'ALIPAY'

/**
  * 登录
 */
export function login(data){
  return request({
    url: `${ISALIPAY?'/alipay':''}/login`,
    data
  })
}

/**
  * 注册
 */
export function register(data){
  return request({
    url: `${ISALIPAY?'/alipay':''}/register`,
    data
  })
}

/**
  * 退出登录
 */
export function logout(data={}){
  return request({
    url: '/logout',
    data
  })
}

/**
  * 注销账户
 */
export function logoff(data){
  return request({
    url: `${ISALIPAY?'/alipay':''}/logoff`,
    data
  })
}

/**
 * 切换账号时，校验用户是否本人
*/
export function checkReg(data){
  return request({
    url: '/checkReg',
    data
  })
}
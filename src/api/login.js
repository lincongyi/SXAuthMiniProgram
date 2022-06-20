import request from '@utils/request'

/**
  * 登录
 */
export function login(data){
  return request({
    url: '/login',
    data
  })
}

/**
  * 注册
 */
export function register(data){
  return request({
    url: '/register',
    data
  })
}

/**
  * 退出登录
 */
export function logout(data){
  return request({
    url: '/logout',
    data
  })
}
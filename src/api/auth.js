import request from '@utils/request'

// 个人二维码（接入服务认证凭证）
export function getCertToken(data){
  return request({
    url: '/getCertToken',
    data
  })
}

// 校验认证凭证有效性
export function checkCerTokenAgent(data){
  return request({
    url: '/checkCerTokenAgent',
    data
  })
}

// 获取微信认证标识
export function getUserIdKey(data={}){
  return request({
    url: '/getUserIdKey',
    data
  })
}

// 小程序刷脸通过后调用
export function checkCertCodeAgent(data){
  return request({
    url: '/checkCertCodeAgent',
    data
  })
}

// 获取手机号码
export function getUserPhoneNum(data){
  return request({
    url: '/getUserPhoneNum',
    data
  })
}

// 认证记录
export function getAuthList(data){
  return request({
    url: '/authList',
    data
  })
}

// 新增认证记录
export function addAuthTask(data={}){
  return request({
    url: '/addAuthTask',
    data
  })
}
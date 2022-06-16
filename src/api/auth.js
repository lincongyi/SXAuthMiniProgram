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
export function getUserIdKey(data){
  return request({
    url: '/getUserIdKey',
    data
  })
}
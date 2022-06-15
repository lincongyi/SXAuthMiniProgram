import request from '@utils/request'

// 个人二维码（接入服务认证凭证）
export function getCertToken(data){
  return request({
    url: '/getCertToken',
    data
  })
}
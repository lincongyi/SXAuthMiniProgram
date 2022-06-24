import request from '@utils/request'

/**
  * 发送邮箱验证码
 */
export function sendEmailIdentifyCode(data){
  return request({
    url: '/sendEmailIdentifyCode',
    data
  })
}

/**
  * 解绑邮箱
 */
export function unbindEmail(data){
  return request({
    url: '/unbindEmail',
    data
  })
}

/**
  * 绑定邮箱
 */
export function bindEmail(data){
  return request({
    url: '/bindEmail',
    data
  })
}

/**
  * 更新手机号码
 */
export function updatePhoneNum(data){
  return request({
    url: '/updatePhoneNum',
    data
  })
}

/**
  * 更新证件有效期
 */
export function updateYXQ(data){
  return request({
    url: '/updateYXQ',
    data
  })
}

/**
  * 更新地址
 */
export function updateAddress(data){
  return request({
    url: '/updateAddress',
    data
  })
}
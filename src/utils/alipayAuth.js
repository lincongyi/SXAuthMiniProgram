import Taro from '@tarojs/taro'
export function alipayAuth(){
  let bizId = generateUUID()
  return new Promise((resolve, reject) => {
    Taro.ap.faceVerify({
      bizId, //业务流水号，商户自行生成，需要保证唯一性，不超过64位
      bizType: '1', //业务场景参数，‘1’代表人脸采集，请务必填写
      success: ({faceRetCode, zimId}) => {
        // 返回码1000 代表人脸采集成功
        if (faceRetCode === '1000') resolve({bizId, zimId})
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

/**
  * 生成uuid
 */
function generateUUID() {
  var s = []
  var hexDigits = '0123456789abcdef'
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'
  var uuid = s.join('').replace('-', '')
  return uuid
}
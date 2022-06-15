import { getSetting, openSetting, getLocation, getNetworkType, getSystemInfo, getAccountInfoSync } from '@utils/taro'
import { getCertToken } from '@api/auth'
// 认证流程
export async function verify(){
  //  1.收集信息
  let collectionInfo = await handleCollection()
  // console.log(collectionInfo)
  // 2.获取certToken
  // let certToken = await handleCertToken(collectionInfo)
}

/**
  * 收集信息
 */
const handleCollection = async (agent=false, mode=66) => {
  let collectionInfo = {
    appInfo: {
      appName: '陕西公民实人认证',
      authtermHost: '',
      buildTime: '',
      buildType: '',
      bundleIdVersion: '',
      lvdtVer: '',
      readerVer: '',
      versionName: '',
      wechatVersion: '',
      wiiauthHost: ''
    },
    appType: 'sxfama',
    latestLocation: '',
    locationBean: {
      latitude: 0,
      longitude: 0
    },
    phoneInfo: {
      imei: '',
      manufacturer: '',
      networkOperatorName: '',
      networkType: '',
      osVersion: '',
      phoneModel: ''
    },
    platform: ''
  }
  let authSetting = await getSetting()
  if (!authSetting['scope.userLocation']){
    let canGetLocation = await openSetting() // 允许获取用户地理位置信息
    if (!canGetLocation) return false
  }
  let { latitude, longitude } = await getLocation()
  collectionInfo.latestLocation = `${longitude},${latitude}`
  collectionInfo.locationBean = {longitude, latitude}
  let networkType = await getNetworkType()
  collectionInfo.phoneInfo.networkType = networkType
  let {platform, system, model, brand, version} = await getSystemInfo()
  collectionInfo.phoneInfo.osVersion = system
  collectionInfo.phoneInfo.phoneModel = model
  collectionInfo.phoneInfo.manufacturer = brand
  collectionInfo.platform = platform
  collectionInfo.appInfo.wechatVersion = version
  const accountInfo = getAccountInfoSync()
  collectionInfo.appInfo.versionName = accountInfo.miniProgram.version
  return collectionInfo
}

const handleCertToken = async(collectionInfo, agent=false, mode=66,) => {
  getCertToken({
    agent,
    mode,
    collectionInfo
  }).then(({retCode, retMessage, tokenInfo}) => {
    if (retCode) {
      return Taro.showModal({
        title: '温馨提示',
        content: retMessage,
        showCancel: false,
      })
    }
    console.log(tokenInfo)
    return tokenInfo
  })
}
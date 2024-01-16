import Taro from '@tarojs/taro'
import {
  getSetting,
  openSetting,
  getLocation,
  getNetworkType,
  getSystemInfo,
  getAccountInfoSync
} from '@utils/taro'

/**
 * 收集信息
 */
async function collectInfo () {
  const collectionInfo = {
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
  const authSetting = await getSetting()
  // 当前用户不允许使用位置信息，
  if (authSetting['scope.userLocation'] === false) {
    await openSetting() // 打开允许使用位置信息设置
  }
  const { latitude, longitude } = await getLocation()
  collectionInfo.latestLocation = `${longitude},${latitude}`
  collectionInfo.locationBean = { longitude, latitude }
  const networkType = await getNetworkType()
  collectionInfo.phoneInfo.networkType = networkType
  const { platform, system, model, brand, version } = await getSystemInfo()
  collectionInfo.phoneInfo.osVersion = system
  collectionInfo.phoneInfo.phoneModel = model
  collectionInfo.phoneInfo.manufacturer = brand
  collectionInfo.platform = platform
  collectionInfo.appInfo.wechatVersion = version
  try {
    const accountInfo = getAccountInfoSync() // 支付宝小程序开发者工具（IDE）暂不支持调试此 API，请使用 真机调试 功能在真机进行调试。
    collectionInfo.appInfo.versionName = accountInfo.miniProgram.version
  } catch (error) {
    console.log(error)
  }
  return {
    collectionInfo
  }
}

/**
 * 收集信息（封装一下）
 */
export async function handleCollectInfo (isCache = true) {
  Taro.showLoading({ title: '请稍候...' })
  let collectionInfo
  if (!Taro.getStorageSync('collectionInfo')) {
    const result = await collectInfo()
    collectionInfo = result.collectionInfo
    if (isCache) Taro.setStorageSync('collectionInfo', collectionInfo)
  } else {
    collectionInfo = Taro.getStorageSync('collectionInfo')
  }
  Taro.hideLoading()
  return collectionInfo
}

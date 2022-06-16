import Taro from '@tarojs/taro'
import { getSetting, openSetting, getLocation, getNetworkType, getSystemInfo, getAccountInfoSync } from '@utils/taro'
import { getCertToken, checkCerTokenAgent, getUserIdKey } from '@api/auth'

let appId
/**
 * 认证流程
 * @param {object} options
 *  @param {boolean} agent // 代人认证
 *  @param {number} mode // 认证模式。64：,66：
 *  @param {string} authType // 认证类型。regular：常规认证；QrcodeRegular：个人二维码；ScanAuth：扫码认证
 *  @param {object} idInfo // 用户录入信息
 */
export async function verify(options){
  //  1.收集信息
  let collectionInfo = await handleCollection()
  // 2.获取certToken
  let {agent=false, mode=66, authType='regular', idInfo} = options
  // let {certToken, qrcodeContent} = await handleCertToken(agent, mode, authType, collectionInfo, idInfo)
  let result = await getCertToken({agent, mode, authType, collectionInfo, idInfo}) // 获取certToken
  let {retCode, retMessage, tokenInfo} = result
  if (retCode) {
    return Taro.showModal({
      title: '温馨提示',
      content: retMessage,
      showCancel: false,
    })
  }

  let {certToken, qrcodeContent}=tokenInfo
  result = await checkCerTokenAgent({agent, appId, certToken}) // 校验certToken，并返回授权信息
  console.log(result)
}

/**
  * 收集信息
 */
const handleCollection = async () => {
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
  // 当前用户不允许使用位置信息，
  if (authSetting['scope.userLocation']===false){
    await openSetting() // 打开允许使用位置信息设置
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
  appId = accountInfo.miniProgram.appId
  return collectionInfo
}

/**
  * 获取certToken
 */
const handleCertToken = async(agent, mode, authType, collectionInfo, idInfo) => {
  getCertToken({
    agent,
    mode,
    authType,
    collectionInfo,
    idInfo,
  })
}

/**
  * 校验certToken，并返回授权信息
 */
const handleCheckCerTokenAgent = async(agent=false, appId, certToken) => {

}


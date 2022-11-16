<template>
  <view class="container">
    <view class="content">
      <view class="top-box">
        <image class="logo" mode="widthFix" :src="loginImage"/>
        <view class="title">陕西公民实人认证</view>
      </view>
      <!-- 用户信息录入 start -->
      <view class="form-group">
        <nut-input v-model="type" readonly label="证件类型" />
        <nut-input v-model="userInfo.fullName" label="姓名" placeholder="请输入姓名" :readonly="!canEdit" required maxlength="20" />
        <nut-input v-model="userInfo.idNum" label="证件号码" placeholder="请输入证件号码" :readonly="!canEdit" required maxlength="18" />
        <block v-if="[16,18].includes(mode)">
          <nut-input v-model="userInfo.idStartDate" label="起始日期" :readonly="!canEdit" required maxlength="18" />
          <nut-input v-model="userInfo.idEndDate" label="截止日期" :readonly="!canEdit" required maxlength="18" />
        </block>
      </view>
      <!-- 用户信息录入 end -->
    </view>

    <view class="btn-warp" v-if="isBtnShow">
      <nut-button type="primary" shape="square" block :class="{'disabled':btnDisabled}" @tap="validateUserInfo">下一步</nut-button>
      <block v-if="ISALIPAY">
        <button class="get-phone-number-btn" open-type="getAuthorize" @getauthorize="getPhoneNumber" @error="onGetPhoneNumberError" scope="phoneNumber" v-show="!btnDisabled"></button>
      </block>
      <block v-else>
        <button class="get-phone-number-btn" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber" v-show="!btnDisabled"></button>
      </block>
    </view>

    <view class="tips-textarea">
      <view class="normal">未注册用户登录时将完成注册，登录即代表</view>
      <view class="normal">
        您已同意
        <view class="emphasize" @tap="toProtocol">《用户服务协议》</view>
      </view>
    </view>
  </view>

  <authActionSheet
    ref="authActionSheetComponent"
    :beforeAuth="beforeAuth"
    :beforeProtocol="beforeProtocol"
    :protocolName="protocolName"
    :protocolUrl="protocolUrl"
    :mode="mode"
    :foreBackUrl="foreBackUrl"
    @onConfirm="handleConfirm"
  />

  <!-- Copyright -->
  <copyright />

</template>
<script setup>
import {ref, reactive, toRaw, computed, defineAsyncComponent} from 'vue'
import Taro, {useDidShow, useRouter} from '@tarojs/taro'
import loginImage from '@images/logo.png'
import './index.scss'
import {handleCollectInfo} from '@utils/collectInfo'
import {getCertToken, checkCerTokenAgent, getUserIdKey, checkCertCodeAgent, getCertifyResult, getUserPhoneNum} from '@api/auth'
import {register, checkReg} from '@api/login'
import {checkIsSupportFacialRecognition, startFacialRecognitionVerify, alipayGetPhoneNumber} from '@utils/taro'
import {isLogin, idcardRex} from '@utils/index'
import {alipayAuth} from '@utils/alipayAuth'
import {BASE_URL} from '@utils/request'
/**
  * 返回h5页面地址
 */
const backToH5Url = `${BASE_URL}/sxauthalipay/toMiniProgram.html`

// 用户录入信息
const type = '第二代居民身份证'
const mode = ref(66) // 认证模式
const userInfo = reactive({
  idNum: '',
  fullName: '',
  idStartDate: '',
  idEndDate: ''
})
const canEdit = ref(true) // 是否允许用户录入信息
const isBtnShow = ref(true)// 控制[下一步]按钮显示隐藏，[下一步]按钮主要用于获取用户手机号码
const btnDisabled = computed(() => !userInfo.fullName || !userInfo.idNum) // 控制[下一步]按钮样式

const phoneNum = ref('') // 用户手机号码

const canSelfAuth = ref('') // 是否代他人认证
const certToken = ref('') // certToken

const beforeAuth = ref('') // 动作面板温馨提示内容
const beforeProtocol = ref('') // 同意协议提示内容
const protocolName = ref('') // 用户服务协议
const protocolUrl = ref('') // 用户服务协议url
const authActionSheet = defineAsyncComponent(() => import('@components/authActionSheet/index.vue')) // 授权弹窗
const authActionSheetComponent = ref(null)
const ISALIPAY = Taro.getStorageSync('env') === 'ALIPAY'
const foreBackUrl = ref('') // 第三方h5地址

// 查看用户服务协议（暂时写死）
const toProtocol = () => {
  let url = `${BASE_URL}/shanxiauthagreement/sxauthuseragreement.html`
  Taro.navigateTo({url: `/pages/webView/index?url=${url}`})
}

const validateUserInfo = () => {
  // 校验用户信息
  let {fullName, idNum} = toRaw(userInfo)
  if (!fullName){
    return Taro.showToast({
      icon: 'none',
      title: '请输入姓名'
    })
  } else if (!idNum){
    return Taro.showToast({
      icon: 'none',
      title: '请输入证件号码'
    })
  } else if (!idNum.includes('*')&&!idcardRex.test(idNum)){
    return Taro.showToast({
      icon: 'none',
      title: '身份号码格式有误'
    })
  }
}

// 下一步（先获取手机号码，再走流程）
const getPhoneNumber = async (event) => {
  // 切换账号的话，优先判断切换的账号是否为当前账号（自己无法切换自己）
  let router = useRouter()
  let {isSwitch} = router.params
  if (Number(isSwitch)){
    try {
      await checkReg({idNum: userInfo.idNum})
    } catch {
      return false
    }
  }

  // 获取手机号码
  let jsCode
  if (ISALIPAY){
    jsCode = await alipayGetPhoneNumber()
  } else {
    if (event.detail.errMsg.indexOf('getPhoneNumber:ok') === -1) {
      return Taro.showModal({
        title: '温馨提示',
        content: '获取手机号失败，请重试',
        showCancel: false,
      })
    }
    jsCode = event.detail.code
  }

  let {userData} = await getUserPhoneNum({jsCode})
  phoneNum.value = userData.phoneNum
  handleSubmit()
}
const onGetPhoneNumberError = (e) => {
  if (e.detail.errorMessage === '用户取消授权'){
    Taro.showModal({
      title: '温馨提示',
      content: '根据公安部门规定，实人认证需报备用户联系方式，以便后续业务办理',
      showCancel: false,
      success: () => {
        Taro.navigateBack({delta: 1})
      }
    })
  }
}

// 获取手机号码后，正式执行下一步流程
const handleSubmit = async () => {
  // 调起人脸认证前的校验流程
  // 第三方小程序跳转，无需再次获取校验certToken
  if (!Taro.getStorageSync('certToken')){
    //  1.收集信息
    let collectionInfo = await handleCollectInfo()

    // 2.获取certToken
    let authType = 'InsideRegular'
    let {tokenInfo} = await getCertToken({mode: mode.value, authType, collectionInfo, idInfo: toRaw(userInfo)}) // 获取certToken
    certToken.value = tokenInfo.certToken
    Taro.setStorageSync('certToken', certToken.value)

    // 3.校验certToken，并返回授权信息
    await handleCheckCertToken()
  }
  authActionSheetComponent.value.actionSheetVisible = true
}

const handleCheckCertToken = async () => {
  let result
  try {
    result = await checkCerTokenAgent({certToken: certToken.value})
  } catch (data) {
    let loginType = Taro.getStorageSync('loginType')
    if (loginType === 1) {
      let {retCode, retMessage} = data
      setTimeout(() => {
        Taro.navigateBackMiniProgram({
          extraData: {
            mode: mode.value,
            retCode,
            retMessage
          }
        })
      }, 500)
    } else if (loginType === 2 && data?.data?.foreBackUrl) {
      Taro.ap.navigateToAlipayPage({
        path: `${backToH5Url}?mode=${mode.value}&foreBackUrl=${data.data.foreBackUrl}`
      })
    } else {
      Taro.removeStorageSync('certToken')
      handleSubmit()
    }
    return false
  }
  let {authTipsInfo, authUser} = result.data
  foreBackUrl.value = result.data.foreBackUrl ?? ''
  canSelfAuth.value = result.data.canSelfAuth ?? false
  mode.value = result.data.mode
  // 如果是第三方跳转过来的，反显用户信息
  if (Taro.getStorageSync('loginType')){
    for (let key in authUser){
      userInfo[key] = authUser[key]
    }
    // 如果用户在第三方小程序已录入个人信息，就设置输入框不可编辑
    if (userInfo.idNum && userInfo.fullName) {
      canEdit.value = false
      if (Taro.getStorageSync('loginType')&&Taro.getStorageSync('loginToken')) {
        isBtnShow.value = false // 如果第三方跳转过来的用户，有之前注册登录信息，则隐藏下一步按钮并直接显示授权弹窗
        authActionSheetComponent.value.actionSheetVisible = true
      }
    }
  }

  // 初始化authActionSheet的信息
  beforeAuth.value = authTipsInfo.beforeAuth
  beforeProtocol.value = authTipsInfo.beforeProtocol
  let protocol = authTipsInfo.protocolList[0]
  protocolName.value = protocol.name
  protocolUrl.value = protocol.url

}

// 确认授权 开始人脸识别
const handleConfirm = async () => {
  authActionSheetComponent.value.actionSheetVisible = false

  // 4.活体检测（16，64模式无需走活检流程）
  let verifyResult
  if (![16, 64].includes(Number(mode.value))){
    if (ISALIPAY) {
      try {
        verifyResult = await alipayAuth()
      } catch (error) {
        authActionSheetComponent.value.actionSheetVisible = true
        return false
      }
    } else {
      let {userIdKey} = await getUserIdKey({...toRaw(userInfo), certToken: certToken.value})
      await checkIsSupportFacialRecognition() // 检测设备是否支持活体检测
      verifyResult = await startFacialRecognitionVerify(userInfo.fullName, userInfo.idNum, userIdKey)
    }
  }

  // 如果从第三方小程序跳转过来，就要重新收集信息
  let collectionInfo = await handleCollectInfo()
  // 5.校验活体检测结果
  // 认证失败回调方法
  let handleFailCallback = ({data, retCode, retMessage}) => {
    Taro.removeStorageSync('certToken') // 移除certToken，否则下次认证会重复使用之前的certToken
    // 小程序内部运行，认证失败不做任何操作
    let loginType = Taro.getStorageSync('loginType')
    if (loginType===1){ // 返回第三方小程序
      Taro.navigateBackMiniProgram({
        extraData: {
          mode: mode.value,
          retCode,
          retMessage
        }
      })
    } else if (loginType === 2) { // 返回认证结果h5页面
      let {resStr} = data
      Taro.setStorageSync('authStr', resStr) // 标识之前已经走过认证流程，避免返回重新认证使用同一个certToken
      Taro.ap.navigateToAlipayPage({
        path: `${backToH5Url}?mode=${mode.value}&resStr=${resStr}&foreBackUrl=${data.foreBackUrl}`
      })
    }
  }
  let result
  if (ISALIPAY) {
    try {
      result = await getCertifyResult({
        ...verifyResult,
        collectionInfo,
        usedAgent: canSelfAuth.value,
        usedMode: mode.value,
        certToken: certToken.value,
        idInfo: toRaw(userInfo)
      })
    } catch (error) {
      handleFailCallback(error)
      return false
    }
  } else {
    try {
      result = await checkCertCodeAgent({
        collectionInfo,
        usedAgent: canSelfAuth.value,
        usedMode: mode.value,
        wxpvCode: verifyResult,
        certToken: certToken.value,
        idInfo: toRaw(userInfo)
      })
    } catch (error) {
      handleFailCallback(error)
      return false
    }
  }

  // 认证成功
  Taro.removeStorageSync('certToken') // 移除certToken，否则下次认证会重复使用之前的certToken
  // 不存在loginToken或者小程序内部流程，走注册功能
  if (!Taro.getStorageSync('loginToken') || !Taro.getStorageSync('loginType')){
    let data = {
      phoneNum: phoneNum.value,
      regMode: 'id',
      certToken: certToken.value,
      loginType: Taro.getStorageSync('loginType') ?? 0
    }
    if (ISALIPAY){
      data = {...data, ...verifyResult}
      data.aesUserId = Taro.getStorageSync('aesUserId')
    } else {
      data.wxpvCode = verifyResult
      data.aesUnionId = Taro.getStorageSync('aesUnionId')
    }

    await register(data).then(({loginToken, loginUser}) => {
      Taro.setStorageSync('loginToken', loginToken)
      Taro.setStorageSync('loginUser', loginUser)
    })
  }

  if (!Taro.getStorageSync('loginType')){ // 小程序内部运行
    Taro.showModal({
      title: '注册成功',
      content: `您的账号已绑定${ISALIPAY?'支付宝':'微信'}，下次可直接使用${ISALIPAY?'支付宝':'微信'}授权快捷登录`,
      showCancel: false,
      success: () => {
        // 跳转到首页
        Taro.reLaunch({url: '/pages/index/index'})
      }
    })
  } else { // 第三方跳转
    if (Taro.getStorageSync('loginType') === 1) { // 返回第三方小程序
      Taro.navigateBackMiniProgram({extraData: {
        mode: mode.value,
        retCode: result.retCode,
        retMessage: result.retMessage
      }})
    } else { // 返回认证结果h5页面
      let {resStr} = result.data
      Taro.setStorageSync('authStr', resStr) // 标识之前已经走过认证流程，避免返回重新认证使用同一个certToken
      Taro.ap.navigateToAlipayPage({
        path: `${backToH5Url}?mode=${mode.value}&resStr=${resStr}&foreBackUrl=${result.data.foreBackUrl}`
      })
    }
  }
}
useDidShow(async () => {
  let loginType = Taro.getStorageSync('loginType')
  // 如果是h5跳转
  let authStr = Taro.getStorageSync('authStr')
  if (loginType === 2) {
    // 已经有认证结果的情况下 或者 h5页面再返回小程序，重定向到结果页面
    if (authStr || !Taro.getStorageSync('certToken')) Taro.navigateTo({url: `/pages/authResult/index?mode=${mode.value}&data=${authStr}`}) // 重定向到到认证结果页面
  }
  // 获取第三方小程序或h5跳转时带过来的certToken
  if (loginType&&!certToken.value){
    await isLogin()
    certToken.value = Taro.getStorageSync('certToken')
    await handleCheckCertToken()
  }
})
</script>
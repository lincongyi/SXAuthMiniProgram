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
        <nut-input v-model="userInfo.fullName" label="姓名" placeholder="请输入姓名" :readonly="!canEdit" clearable required maxlength="20" />
        <nut-input v-model="userInfo.idNum" label="证件号码" placeholder="请输入证件号码" :readonly="!canEdit" clearable required maxlength="18" />
        <block v-if="[16,18].includes(mode)">
          <nut-input v-model="userInfo.idStartDate" label="起始日期" :readonly="!canEdit" clearable required maxlength="18" />
          <nut-input v-model="userInfo.idEndDate" label="截止日期" :readonly="!canEdit" clearable required maxlength="18" />
        </block>
      </view>
      <!-- 用户信息录入 end -->
    </view>

    <view class="btn-warp">
      <nut-button type="primary" shape="square" block @tap="handleSubmit" :class="{'disabled':btnDisabled}">下一步</nut-button>
      <button class="get-phone-number-btn" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber" v-show="!btnDisabled"></button>
    </view>

    <view class="tips-textarea">
      <view class="normal">未注册用户登录时将完成注册，登录即代表</view>
      <view class="normal">
        您已同意
        <view class="emphasize" @tap="toProtocol()">《用户服务协议》</view>
      </view>
    </view>
  </view>

  <authActionSheet
    ref="authActionSheetComponent"
    :beforeAuth="beforeAuth"
    :beforeProtocol="beforeProtocol"
    :protocolName="protocolName"
    :protocolUrl="protocolUrl"
    @onConfirm="handleConfirm"
  />

  <!-- Copyright -->
  <copyright />

</template>
<script setup>
import { ref, reactive, toRaw, computed, defineAsyncComponent } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import loginImage from '@images/logo.png'
import './index.scss'
import { handleCollectInfo } from '@utils/collectInfo'
import { getCertToken, checkCerTokenAgent, getUserIdKey, checkCertCodeAgent, getUserPhoneNum } from '@api/auth'
import { register } from '@api/login'
import { checkIsSupportFacialRecognition, startFacialRecognitionVerify } from '@utils/taro'
import { isLogin } from '@utils/index'

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
const btnDisabled = computed(() => !userInfo.fullName || !userInfo.idNum)

const phoneNum = ref('') // 用户手机号码

const canSelfAuth = ref('') // 是否代他人认证
const certToken = ref('') // certToken

const beforeAuth = ref('') // 动作面板温馨提示内容
const beforeProtocol = ref('') // 同意协议提示内容
const protocolName = ref('') // 《用户服务协议》
const protocolUrl = ref('') // 《用户服务协议》url
const authActionSheet = defineAsyncComponent(() => import('@components/authActionSheet/index.vue')) // 授权弹窗
const authActionSheetComponent = ref(null)

// 查看用户服务协议（暂时写死）
const toProtocol = () => {
  let url = 'http://gat.shaanxi.gov.cn/auth/shanxiauthagreement/sxauthuseragreement.html'
  Taro.navigateTo({ url: `/pages/webView/index?url=${url}` })
}

// 下一步（先获取手机号码，再走流程）
const getPhoneNumber = async (event) => {
  if (event.detail.errMsg.indexOf('getPhoneNumber:ok') === -1) {
    return Taro.showModal({
      title: '温馨提示',
      content: '获取手机号失败，请重试',
      showCancel: false,
    })
  }
  let {code: jsCode} = event.detail
  let {userData} = await getUserPhoneNum({ jsCode })
  phoneNum.value = userData.phoneNum
  handleSubmit()
}

const handleSubmit = async () => {
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
  }
  // 调起人脸认证前的校验流程
  // 第三方小程序跳转，无需再次获取校验certToken
  if (!Taro.getStorageSync('loginType')){
    //  1.收集信息
    let collectionInfo = await handleCollectInfo()

    // 2.获取certToken
    let authType = 'regular'
    let {tokenInfo} = await getCertToken({ mode: mode.value, authType, collectionInfo, idInfo: toRaw(userInfo)}) // 获取certToken
    certToken.value = tokenInfo.certToken

    // 3.校验certToken，并返回授权信息
    await handleCheckCertToken()
  }
  authActionSheetComponent.value.actionSheetVisible = true
}

const handleCheckCertToken = async () => {
  let result = await checkCerTokenAgent({ certToken: certToken.value})
  let {authTipsInfo, authUser} = result.data
  canSelfAuth.value = result.data.canSelfAuth ?? false
  mode.value = result.data.mode

  // 如果是第三方跳转过来的，反显用户信息
  if (Taro.getStorageSync('loginType')){
    userInfo.idNum = authUser?.idNum
    userInfo.fullName = authUser?.fullName
    // 如果用户在第三方小程序已录入个人信息，就设置输入框不可编辑
    if (userInfo.idNum&&userInfo.fullName) canEdit.value = false
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
  let {userIdKey} = await getUserIdKey({...toRaw(userInfo), certToken: certToken.value},)
  authActionSheetComponent.value.actionSheetVisible = false
  await checkIsSupportFacialRecognition() // 检测设备是否支持活体检测
  // 4.活体检测
  let verifyResult = await startFacialRecognitionVerify(userInfo.fullName, userInfo.idNum, userIdKey)

  // 如果从第三方小程序跳转过来，就要重新收集信息
  let collectionInfo = await handleCollectInfo()
  // 5.校验活体检测结果
  await checkCertCodeAgent({
    collectionInfo,
    usedAgent: canSelfAuth.value,
    usedMode: mode.value,
    wxpvCode: verifyResult,
    certToken: certToken.value
  })

  // 未注册
  if (!Taro.getStorageSync('loginToken')){
    await register({
      aesUnionId: Taro.getStorageSync('aesUnionId'),
      ...toRaw(userInfo),
      phoneNum: phoneNum.value,
      regMode: 'id',
      wxpvCode: verifyResult,
      certToken: certToken.value
    }).then(({loginToken, loginUser}) => {
      Taro.setStorageSync('loginToken', loginToken)
      Taro.setStorageSync('loginUser', loginUser)
    })
    if (!Taro.getStorageSync('loginType')){ // 小程序内部运行
      const ISALIPAY = Taro.getStorageSync('env') === 'ALIPAY'
      Taro.showModal({
        title: '注册成功',
        content: `您的账号已绑定${ISALIPAY?'支付宝':'微信'}，下次可直接使用${ISALIPAY?'支付宝':'微信'}授权快捷登录`,
        showCancel: false,
        success: ({confirm}) => {
          // 跳转到首页
          if (confirm) Taro.switchTab({ url: '/pages/index/index' })
        }
      })
    } else { // 第三方小程序跳转
      Taro.showModal({
        title: '注册成功',
        content: '返回第三方小程序',
        showCancel: false,
        success: ({confirm}) => {
          if (confirm) Taro.navigateBackMiniProgram({ extraData: {} })
        }
      })
    }
  }
}
useDidShow(async () => {
  // 获取第三方小程序跳转时带过来的certToken
  if (Taro.getStorageSync('loginType')&&!certToken.value){
    await isLogin()
    certToken.value = Taro.getStorageSync('certToken')
    await handleCheckCertToken()
  }
})
</script>
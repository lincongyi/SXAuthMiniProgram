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
        <nut-input v-model="userInfo.fullName" label="姓名" placeholder="请输入姓名" clearable required maxlength="20" />
        <nut-input v-model="userInfo.idNum" label="证件号码" placeholder="请输入证件号码" clearable required maxlength="18" />
      </view>
      <!-- 用户信息录入 end -->
    </view>

    <view class="btn-warp">
      <nut-button type="primary" shape="square" block @tap="handleSubmit" :class="{'disabled':btnDisabled}">下一步</nut-button>
    </view>

    <view class="tips-textarea">
      <view class="normal">未注册用户登录时将完成注册，登录即代表</view>
      <view class="normal">
        您已同意
        <view class="emphasize">《用户服务协议》</view>
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
  >
  </authActionSheet>

  <!-- Copyright -->
  <copyright />

  <nut-dialog
    title="温馨提示"
    content="您的账号已绑定支付宝，下次可直接使用支付宝授权快捷登录"
    v-model:visible="dialogVisible"
    :no-cancel-btn="true"
  />
</template>
<script setup>
import { ref, reactive, computed, defineAsyncComponent } from 'vue'
import Taro from '@tarojs/taro'
import loginImage from '@images/logo.png'
import './index.scss'
import { collectInfo } from '@utils/collectInfo'
import { checkIsSupportFacialRecognition, startFacialRecognitionVerify } from '@utils/taro'
import { getCertToken, checkCerTokenAgent, getUserIdKey, checkCertCodeAgent } from '@api/auth'

// 用户录入信息
const type = '第二代居民身份证'
const mode = ref(66)
const userInfo = reactive({
  idNum: '440105199203182415',
  fullName: '林聪毅',
})
const btnDisabled = computed(() => !userInfo.fullName || !userInfo.idNum)
const dialogVisible = ref(false) // 控制弹出框显示隐藏

const canSelfAuth = ref('') // 是否代他人认证
const certToken = ref('') // certToken

const beforeAuth = ref('') // 动作面板温馨提示内容
const beforeProtocol = ref('') // 同意协议提示内容
const protocolName = ref('') // 《用户服务协议》
const protocolUrl = ref('') // 《用户服务协议》url
const authActionSheet = defineAsyncComponent(() => import('@components/authActionSheet/index.vue')) // 授权弹窗
const authActionSheetComponent = ref(null)

// 下一步
const handleSubmit = async () => {
  let {fullName, idNum} = userInfo
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
  let options = {
    idInfo: {
      idNum: userInfo.idNum,
      fullName: userInfo.fullName,
    }
  }
  Taro.showLoading({title: '请稍候...'})
  //  1.收集信息
  let {collectionInfo, appId} = await collectInfo()
  Taro.setStorageSync('collectionInfo', JSON.stringify(collectionInfo))
  // 2.获取certToken
  let {agent=false, authType='regular', idInfo} = options
  let result = await getCertToken({agent, mode: mode.value, authType, collectionInfo, idInfo}) // 获取certToken
  let {retCode, retMessage, tokenInfo} = result
  if (retCode) {
    return Taro.showModal({
      title: '温馨提示',
      content: retMessage,
      showCancel: false,
    })
  }
  // let {certToken, qrcodeContent} = tokenInfo // qrcodeContent:用户二维码地址
  certToken.value = tokenInfo.certToken

  // 3.校验certToken，并返回授权信息
  result = await checkCerTokenAgent({agent, appId, certToken: certToken.value})
  let {authTipsInfo, authUser} = result.data
  canSelfAuth.value = result.data.canSelfAuth
  Taro.hideLoading()

  authActionSheetComponent.value.actionSheetVisible = true
  beforeAuth.value = authTipsInfo.beforeAuth
  beforeProtocol.value = authTipsInfo.beforeProtocol
  let protocol = authTipsInfo.protocolList[0]
  protocolName.value = protocol.name
  protocolUrl.value = protocol.url
}

// 确认授权 开始人脸识别
const handleConfirm = async () => {
  Taro.showLoading({title: '请稍候...'})
  let {userIdKey} = await getUserIdKey({
    idNum: userInfo.idNum,
    fullName: userInfo.fullName
  })
  authActionSheetComponent.value.actionSheetVisible = false
  Taro.hideLoading()
  await checkIsSupportFacialRecognition() // 检测设备是否支持活体检测
  // 4.活体检测
  let verifyResult = await startFacialRecognitionVerify(userInfo.fullName, userInfo.idNum, userIdKey)

  // 从第三方跳转过来要重新收集信息
  let collectionInfo
  // if (!Taro.getStorageSync('collectionInfo')){

  // }
  collectionInfo = Taro.getStorageSync('collectionInfo')
  // 5.校验活体检测结果
  let {retCode, retMessage} = await checkCertCodeAgent({
    collectionInfo,
    usedAgent: canSelfAuth.value,
    usedMode: mode.value,
    wxpvCode: verifyResult,
    certToken: certToken.value
  })
  if (retCode){
    return Taro.showModal({
      title: '温馨提示',
      content: retMessage,
      showCancel: false
    })
  }
  Taro.showToast({
    icon: 'none',
    title: '认证成功',
    success: () => {
      setTimeout(() => {
        Taro.switchTab({url: '/index'})
      }, 1500)
    }
  })
}
</script>
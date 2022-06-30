<template>
  <view class="container">
    <view class="banner">
      <nut-swiper :pagination-visible="true" pagination-color="#fff" auto-play="3000">
        <nut-swiper-item v-for="(item,index) in bannerList" :key="index">
          <img class="banner-image" :src="item" />
        </nut-swiper-item>
      </nut-swiper>
    </view>

    <view class="wrap">
      <!-- 通知消息 start -->
      <view class="notice" v-if="loginStatus&&noticeSize">
        <image class="notice-icon" mode="widthFix" :src="noticeImage"/>
        <view class="info">
          您有
          <view class="amount">{{noticeSize}}</view>
          个认证请求待完成
        </view>
        <view class="btn" @tap="toAuthRequest">查看</view>
      </view>
      <!-- 通知消息 end -->

      <!-- 二维码认证 start -->
      <view class="content">
        <view class="section">
          <image class="icon" mode="widthFix" :src="scanQrcodeImage" />
          <view class="column" @tap="handleScanCode">
            <view class="title">扫码认证</view>
            <view class="info">扫描二维码进行身份认证</view>
          </view>
          <nut-icon name="arrow-right" size="24" color="#999"></nut-icon>
        </view>

        <view class="section">
          <image class="icon" mode="widthFix" :src="showQrcodeImage" />
          <view class="column" @tap="toPersonalQrcode">
            <view class="title">个人身份二维码</view>
            <view class="info">出示二维码进行身份认证</view>
          </view>
          <nut-icon name="arrow-right" size="24" color="#999"></nut-icon>
        </view>
      </view>
      <!-- 二维码认证 end -->
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

  <block v-if="!loginStatus">
    <view :class="['login-tips',{'is-fixed':!ISALIPAY}]">
      <text>登录后体验更多功能</text>
      <view class="login-btn" @tap="loginNow">立即登录</view>
    </view>
  </block>
  <block v-else>
    <!-- copyright -->
    <copyright :isFixed="!ISALIPAY" />
  </block>
</template>

<script setup>
import {ref, defineAsyncComponent} from 'vue'
import Taro, {useDidShow, useDidHide} from '@tarojs/taro'
import './index.scss'
import {isLogin} from '@utils/index'
import {handleCollectInfo} from '@utils/collectInfo'
import {getAuthList, checkCerTokenAgent, getUserIdKey, checkCertCodeAgent} from '@api/auth'
import {getEnv, checkIsSupportFacialRecognition, startFacialRecognitionVerify} from '@utils/taro'
import banner_01 from '@images/banner-01.png'
import banner_02 from '@images/banner-02.png'
import noticeImage from '@images/notice.png'
import scanQrcodeImage from '@images/scan-qrcode.png'
import showQrcodeImage from '@images/show-qrcode.png'

// 获取小程序当前环境
const env = getEnv()
const ISALIPAY = env === 'ALIPAY'

const bannerList = [banner_01, banner_02]
const noticeSize = ref(0) // 待完成认证个数

const loginStatus = ref(false) // 是否登录状态

let timer = null
const loopPeriod = 1000*60*5 // 轮询接口5分钟

const canSelfAuth = ref(false) // 是否代他人认证
const mode = ref(0) // 认证模式
const certToken = ref('') // certToken

const beforeAuth = ref('') // 动作面板温馨提示内容
const beforeProtocol = ref('') // 同意协议提示内容
const protocolName = ref('') // 《用户服务协议》
const protocolUrl = ref('') // 《用户服务协议》url
const authActionSheet = defineAsyncComponent(() => import('@components/authActionSheet/index.vue')) // 授权弹窗
const authActionSheetComponent = ref(null)

// 立即登录
const loginNow = async() => {
  await isLogin()
  loginStatus.value = true
  loginEvent()
}

// 登录/注册
const handleLogin = () => {
  Taro.showModal({
    title: '温馨提示',
    content: '您尚未登录',
    confirmText: '立即登录',
    cancelText: '暂不登录',
    success: (res) => {
      if (res.confirm) {
        loginNow()
      }
    }
  })
}

// 跳转到认证请求页面
const toAuthRequest = () => {
  Taro.navigateTo({
    url: '/pages/authRequest/index?flag=1'
  })
}

// 扫码认证
const handleScanCode = async () => {
  if (!loginStatus.value) {
    handleLogin()
  } else {
    Taro.scanCode({
      onlyFromCamera: true,
      success: async ({result}) => {
        // 从返回的url中截取出certToken
        certToken.value = result.slice(result.indexOf('=')+1)

        // 校验certToken，并返回授权信息
        result = await checkCerTokenAgent({certToken: certToken.value})
        let {authTipsInfo} = result.data
        canSelfAuth.value = result.data.canSelfAuth ?? false
        mode.value = result.data.mode

        // 初始化authActionSheet的信息
        beforeAuth.value = authTipsInfo.beforeAuth
        beforeProtocol.value = authTipsInfo.beforeProtocol
        let protocol = authTipsInfo.protocolList[0]
        protocolName.value = protocol.name
        protocolUrl.value = protocol.url
        authActionSheetComponent.value.actionSheetVisible = true
      }
    })
  }
}

// 确认授权 开始人脸识别
const handleConfirm = async () => {
  let {userIdKey} = await getUserIdKey({certToken: certToken.value})
  authActionSheetComponent.value.actionSheetVisible = false

  // 4.活体检测
  await checkIsSupportFacialRecognition() // 检测设备是否支持活体检测
  let loginUser = Taro.getStorageSync('loginUser')
  let verifyResult = await startFacialRecognitionVerify(loginUser.fullName, loginUser.idNum, userIdKey)

  // collectionInfo尝试从storage里面取
  let collectionInfo = await handleCollectInfo()
  // 5.校验活体检测结果
  await checkCertCodeAgent({
    collectionInfo,
    usedAgent: canSelfAuth.value,
    wxpvCode: verifyResult,
    certToken: certToken.value,
    usedMode: mode.value,
  })

  Taro.showToast({
    icon: 'none',
    title: '校验成功',
    mask: true
  })
}

// 个人身份二维码
const toPersonalQrcode = async () => {
  if (!loginStatus.value) {
    handleLogin()
  } else {
    Taro.navigateTo({url: '/pages/personalQrcode/index'})
  }
}

// 轮询接口获取认证记录 start
const loginEvent = async () => {
  if (timer) clearInterval(timer)
  await loopGetAuthList()
  timer = setInterval(() => {
    loopGetAuthList()
  }, loopPeriod)
}

const loopGetAuthList = async() => {
  let {data} = await getAuthList({
    pageNum: 0,
    pageSize: 0,
    flag: 1, // 0.认证记录；1.待认证
  })
  noticeSize.value = data.size
}
// 轮询接口获取认证记录 end

useDidShow(async () => {
  const currentInstance = Taro.getCurrentInstance().page
  if (Taro.getTabBar) Taro.getTabBar(currentInstance).selected = 0

  loginStatus.value = Boolean(Taro.getStorageSync('loginToken')) || false
  if (loginStatus.value) loginEvent()

  Taro.setStorageSync('loginType', 0)

})

useDidHide(() => {
  if (timer) clearInterval(timer)
})
</script>

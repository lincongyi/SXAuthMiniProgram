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
      <view class="notice" v-if="hasNotice">
        <image class="notice-icon" mode="widthFix" :src="noticeImage"/>
        <view class="info">
          您有
          <view class="amount">10</view>
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
          <view class="column">
            <view class="title">个人身份二维码</view>
            <view class="info">出示二维码进行身份认证</view>
          </view>
          <nut-icon name="arrow-right" size="24" color="#999"></nut-icon>
        </view>
      </view>
      <!-- 二维码认证 end -->
    </view>
  </view>

  <block v-if="!loginStatus">
    <view :class="['login-tips',{'is-fixed':!ISALIPAY}]">
      <text>登录后体验更多功能</text>
      <view class="login-btn" @tap="handleLogin">立即登录</view>
    </view>
  </block>
  <block v-else>
    <!-- copyright -->
    <copyright :isFixed="!ISALIPAY" />
  </block>
</template>

<script setup>
import { ref } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import './index.scss'
import { handleLogin, getUserInfo, getOpenUserInfo } from '@utils/taro'
import banner_01 from '@images/banner-01.png'
import banner_02 from '@images/banner-02.png'
import noticeImage from '@images/notice.png'
import scanQrcodeImage from '@images/scan-qrcode.png'
import showQrcodeImage from '@images/show-qrcode.png'
import { login } from '@api/login'

const env = Taro.getStorageSync('env')
const ISALIPAY = env === 'ALIPAY'

const bannerList = [banner_01, banner_02]
const hasNotice = ref(true) // 是否存在通知信息
const loginStatus = ref(false)

// 判断用户是否登录
const isLogin = () => {
  // 未登录
  if (!loginStatus.value){
    Taro.showModal({
      title: '温馨提示',
      content: '请登录后再进行操作',
      success: (res) => {
        if (res.confirm) {
          Taro.navigateTo({
            url: '/pages/login/index'
          })
        }
      }
    })
    return false
  }
}

// 扫码认证
const handleScanCode = () => {
  // if (!isLogin()) return
  if (ISALIPAY){
    console.log(Taro.ap)
  }
  toLogin()
}
// 跳转到登录 || 注册页面
const toLogin = () => {
  Taro.navigateTo({
    url: '/pages/login/index'
  })
}
// 跳转到认证请求页面
const toAuthRequest = () => {
  // Taro.navigateTo({
  //   url: '/pages/authRequest/index'
  // })
}

useDidShow(async () => {
  const currentInstance = Taro.getCurrentInstance().page
  if (Taro.getTabBar) Taro.getTabBar(currentInstance).selected = 0

  // 区分支付宝和微信的登录流程
  if (ISALIPAY){
    console.log('alipay app')
  } else {
    // 登录流程
    let jsCode = await handleLogin()
    let { encryptedData, iv } = await getUserInfo()
    login({ jsCode, encryptedData, iv }).then(({retCode, retMessage}) => {
      // 用户未注册
      if (retCode === 5202){
        Taro.showModal({
          title: '温馨提示',
          content: retMessage,
          showCancel: false,
          success: ({confirm}) => {
            if (confirm) toLogin()
          }
        })
      }
    })
  }
})
</script>

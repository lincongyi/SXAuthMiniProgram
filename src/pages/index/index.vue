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
import { ref, onBeforeUnmount } from 'vue'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
import './index.scss'
import { getEnv } from '@utils/taro'
import banner_01 from '@images/banner-01.png'
import banner_02 from '@images/banner-02.png'
import noticeImage from '@images/notice.png'
import scanQrcodeImage from '@images/scan-qrcode.png'
import showQrcodeImage from '@images/show-qrcode.png'
import { isLogin, generateUUID } from '@utils/index'
import { authList } from '@api/auth'


// 获取小程序当前环境
const env = getEnv()
const ISALIPAY = env === 'ALIPAY'

const bannerList = [banner_01, banner_02]
const noticeSize = ref(0) // 待完成认证个数

const loginStatus = ref(false) // 是否登录状态

let timer = null
const loopPeriod = 1000*5 // 轮询接口5分钟

// 跳转到认证请求页面
const toAuthRequest = () => {
  Taro.navigateTo({
    url: '/pages/authRequest/index?flag=1'
  })
}

// 扫码认证
const handleScanCode = async () => {
  if (!loginStatus.value) {
    await isLogin()
    loginStatus.value = true
    loginEvent()
  }
}

// 个人身份二维码
const toPersonalQrcode = async () => {
  if (!loginStatus.value) {
    await isLogin()
    loginStatus.value = true
    loginEvent()
  } else {
    Taro.navigateTo({
      url: '/pages/personalQrcode/index'
    })
  }
}

// 立即登录
const loginNow = async() => {
  await isLogin()
  loginStatus.value = true
  loginEvent()
}

// 轮询接口获取认证记录 start
const loginEvent = async () => {
  clearInterval(timer)
  timer = null
  await loopGetAuthList()
  timer = setInterval(() => {
    loopGetAuthList()
  }, loopPeriod)
}

const loopGetAuthList = async() => {
  let {data} = await authList({
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
})

useDidHide(() => {
  clearInterval(timer)
  timer = null
})
</script>

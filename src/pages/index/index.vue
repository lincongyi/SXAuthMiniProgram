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
      <view class="login-btn">立即登录</view>
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
import { getEnv } from '@utils/taro'
import banner_01 from '@images/banner-01.png'
import banner_02 from '@images/banner-02.png'
import noticeImage from '@images/notice.png'
import scanQrcodeImage from '@images/scan-qrcode.png'
import showQrcodeImage from '@images/show-qrcode.png'
import { isLogin, generateUUID } from '@utils/index'

// 获取小程序当前环境
const env = getEnv()
const ISALIPAY = env === 'ALIPAY'

const bannerList = [banner_01, banner_02]
const hasNotice = ref(true) // 是否存在通知信息

// 扫码认证
const handleScanCode = async () => {
  if (await isLogin()) {
    console.log('isLogin')
  } else {
    // Taro.ap.faceVerify({
    //   bizId: generateUUID(), //业务流水号，商户自行生成，需要保证唯一性，不超过64位
    //   bizType: '1',
    //   success: (res) => {
    //     console.log(res)
    //     if (res.faceRetCode === 1000) { // 返回码1000 代表人脸采集成功

    //     }
    //   }
    // })
  }
}

// 个人身份二维码
const toPersonalQrcode = async () => {
  if (await isLogin()) {
    Taro.navigateTo({
      url: '/pages/personalQrcode/index'
    })
  }
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
})
</script>

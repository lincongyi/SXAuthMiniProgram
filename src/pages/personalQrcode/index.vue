<template>
  <view class="container">
    <view class="qrcode-wrap">
      <view class="qrcode-title">个人身份二维码</view>
      <view class="user-info">
        <img class="avatar" :src="avatarDefault" />
        <view class="user-content">
          <view class="name">张三</view>
          <view class="id-number">123123123123</view>
        </view>
      </view>
      <view class="qrcode-box">
        <view class="qrcode-image-wrap">
          <canvas class="qrcode-canvas" canvas-id="canvas" id="canvas"/>
          <img class="personal-qrcode-logo" :src="personalQrcodeLogo" />
        </view>
        <view class="refresh-wrap">
          <view class="refresh-tips" @tap="handleRefresh">
            <img class="refresh-image" :src="refresh">
            <text>二维码自动更新</text>
          </view>
        </view>
        <view class="remark">让对方扫描此二维码进行身份认证</view>
      </view>
    </view>
  </view>

  <!-- copyright -->
  <copyright />
  <view id="qrcode"></view>
</template>
<script setup>
import { ref } from 'vue'
import Taro, {useDidShow} from '@tarojs/taro'
import './index.scss'
import avatarDefault from '@images/avatar-default.png'
import refresh from '@images/refresh.png'
import personalQrcodeLogo from '@images/personal-qrcode-logo.png'
import QR from '@utils/qrcode.js'

const qrcodeUrl = ref('https://taro-docs.jd.com/taro/docs/components/canvas/')
// 刷新二维码
const handleRefresh = () => {
  let url = 'https://www.baidu.com/'
  generateQrcode(url)
  Taro.showToast({
    icon: 'none',
    title: '刷新成功',
    mask: true,
  })
}

const generateQrcode = async (text) => {
  const res = await Taro.getSystemInfo()
  const scale = res.screenWidth / 375
  QR({
    width: 300,
    height: 225,
    canvasId: 'canvas',
    text,
    background: '#fff',
    foreground: '#000'
  })
}

useDidShow(() => {
  generateQrcode(qrcodeUrl.value)
})
</script>

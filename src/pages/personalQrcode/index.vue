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
          <canvas class="qrcode-canvas" canvas-id="canvas" id="canvas" width="230" height="230" style="width: 230px; height: 230px;"/>
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
import { getCertToken } from '@api/auth'
import { collectInfo } from '@utils/collectInfo'

// 刷新二维码
const handleRefresh = async () => {
  let {qrcodeContent} = await preStep()
  generateQrcode(qrcodeContent)
}

// 生成二维码前置流程
const preStep = async () => {
  // 收集信息
  let collectionInfo
  if (!Taro.getStorageSync('collectionInfo')){
    let result = await collectInfo()
    collectionInfo = result.collectionInfo
    Taro.setStorageSync('collectionInfo', collectionInfo)
  } else {
    collectionInfo = Taro.getStorageSync('collectionInfo')
  }
  // 获取certToken
  let authType='regular'
  let {tokenInfo} = await getCertToken({authType, collectionInfo}) // 获取certToken
  return tokenInfo
}

// 生成二维码
const generateQrcode = (text) => {
  // 不加setTimeout，首次渲染画不出来二维码
  setTimeout(() => {
    QR({
      width: 230,
      height: 230,
      canvasId: 'canvas',
      text,
    })
  })
}

useDidShow(async () => {
  let {qrcodeContent} = await preStep()
  generateQrcode(qrcodeContent)
})
</script>

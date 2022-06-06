<template>
  <view class="container">
  <view class="banner"></view>

  <view class="wrap">

    <!-- 通知消息 start -->
    <view class="notice" wx:if="{{hasNotice}}">
      <!-- <image class="notice-icon" mode="widthFix" src="../../src/images/notice.png"/> -->
      <view class="info">
        您有
        <view class="amount">10</view>
        个认证请求待完成
      </view>
      <view class="btn" bindtap="toAuthRequest">查看</view>
    </view>
    <!-- 通知消息 end -->

    <!-- 二维码认证 start -->
    <view class="content">
      <view class="section">
        <!-- <image class="icon" mode="widthFix" src="../../src/images/scan-qrcode.png" /> -->
        <view class="column" bindtap="handleScanCode">
          <view class="title">扫码认证</view>
          <view class="info">扫描二维码进行身份认证</view>
        </view>
        <van-icon name="arrow" size="24px" color="#999" />
      </view>

      <view class="section">
        <!-- <image class="icon" mode="widthFix" src="../../src/images/show-qrcode.png" /> -->
        <view class="column">
          <view class="title">个人身份二维码</view>
          <view class="info">出示二维码进行身份认证</view>
        </view>
        <van-icon name="arrow" size="24px" color="#999" />
      </view>
    </view>
    <!-- 二维码认证 end -->
  </view>
  <nut-button type="primary">主要按钮</nut-button>
  <nut-button type="info">信息按钮</nut-button>
</view>

<!-- <view class="mask {{isMaskShow ? 'is-mask-show' : ''}}"></view> -->

</template>

<script setup>
import { ref } from 'vue'
import './index.scss'

const hasNotice = ref(true) // 是否存在通知信息
const isMaskShow = ref(false) // 控制遮罩层显示隐藏
</script>

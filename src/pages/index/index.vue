<template>
  <view class="container">
  <view class="banner"></view>

  <view class="wrap">
    <!-- 通知消息 start -->
    <view class="notice" wx:if="{{hasNotice}}">
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
<!-- copyright -->
<copyright isFixed="true"></copyright>

<nut-dialog
  title="温馨提示"
  content="请登录后再进行操作"
  v-model:visible="dialogVisible"
  @ok="toLogin"
/>

<!-- <view class="mask {{isMaskShow ? 'is-mask-show' : ''}}"></view> -->

</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import './index.scss'
import noticeImage from '@images/notice.png'
import scanQrcodeImage from '@images/scan-qrcode.png'
import showQrcodeImage from '@images/show-qrcode.png'
const copyright = defineAsyncComponent(() => import('../../components/copyright/index.vue'))

const hasNotice = ref(true) // 是否存在通知信息
const dialogVisible = ref(false) // 控制弹出框显示隐藏
const isMaskShow = ref(false) // 控制遮罩层显示隐藏

// 扫码认证
const handleScanCode = () => {
  dialogVisible.value = true
}
// 跳转到登录页面
const toLogin = () => {
  // Taro.navigateTo({
  //   url: '/pages/login/login'
  // })
}
// 跳转到认证请求页面
const toAuthRequest = () => {
  // Taro.navigateTo({
  //   url: '/pages/authRequest/authRequest'
  // })
}

const router = useRouter()
useDidShow(() => {
  const currentInstance = Taro.getCurrentInstance().page
  Taro.getTabBar(currentInstance).selected = 0
})
</script>

<template>
  <view class="container">
    <view class="user-avatar">
      <open-data type="userAvatarUrl"></open-data>
    </view>
    <view class="info-pannel">
      <view class="column">
        <view class="left-label">姓名</view>
        <view class="right-content">XXX</view>
      </view>
      <view class="column">
        <view class="left-label">身份证号码</view>
        <view class="right-content">XXX</view>
      </view>
      <view class="column">
        <view class="left-label">证件有效期</view>
        <view :class="['right-content',{'unfilled':!valid}] " @tap="toCertificateSetting">
          {{valid||'去补充'}}
          <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
        </view>
      </view>
      <view class="column">
        <view class="left-label">手机号码</view>
        <view class="right-content">
          1580000000
          <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
        </view>
      </view>
      <view class="column">
        <view class="left-label">邮箱</view>
        <view class="right-content unbound">
          未绑定
          <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
        </view>
      </view>
    </view>
  </view>

  <!-- Copyright -->
  <copyright />
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import './index.scss'
const copyright = defineAsyncComponent(() => import('@components/copyright/index.vue'))

const valid = ref('') // 证件有效期

// 跳转到设置证件有效期限页面
const toCertificateSetting = () => {
  Taro.navigateTo({
    url: '/pages/certificateSetting/index'
  })
}

useDidShow(() => {
  let userInfo = Taro.getStorageSync('userInfo')
  if (userInfo){
    userInfo = JSON.parse(userInfo)
    let {startDate, endDate} = userInfo
    valid.value = `${startDate}-${endDate}`
  }
})
</script>

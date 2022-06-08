<template>
  <view class="container">
    <view class="user-info-box">
      <block v-if="!loginStatus">
        <image class="avatar" mode="widthFix" :src="avatarImage"/>
        <view class="unlogin" @tap="handleLogin">
          登录/注册
          <nut-icon name="arrow-right" size="16" color="#fff"></nut-icon>
        </view>
      </block>
      <block v-else>
        <view class="avatar">
          <open-data type="userAvatarUrl"></open-data>
        </view>
        <view class="info-wrap" @tap="toUserInfo">
          <view class="user-content">
            <view class="name">
              <open-data type="userNickName"></open-data>
            </view>
            <view class="id-number">证件号码：1234567890123</view>
          </view>
          <nut-icon name="arrow-right" size="16" color="#fff"></nut-icon>
        </view>
      </block>
    </view>
    <view class="nav">
      <view class="column">
        <image class="column-icon" mode="widthFix" :src="userCenterRecordImage" />
        <view class="cell">
          <view class="left-label">认证记录</view>
          <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
        </view>
      </view>
      <view class="column">
        <image class="column-icon" mode="widthFix" :src="userCenterSettingImage" />
        <view class="cell">
          <view class="left-label">设置</view>
          <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
        </view>
      </view>
    </view>
  </view>

  <!-- Copyright -->
  <copyright isFixed="true"></copyright>

  <nut-dialog
    title="温馨提示"
    content="您尚未登录"
    cancel-text="暂不登录"
    ok-text="立即登录"
    :overlay-style="{'z-index':10001}"
    v-model:visible="dialogVisible"
    @ok="handleLogin"
  />
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import './index.scss'
import avatarImage from '@images/avatar-default.png' // 用户默认头像
import userCenterRecordImage from '@images/user-center-record.png'
import userCenterSettingImage from '@images/user-center-setting.png'
const copyright = defineAsyncComponent(() => import('@components/copyright/index.vue'))

const loginStatus = ref(0) // 判断用户是否登录状态
const dialogVisible = ref(false) // 控制弹出框显示隐藏

useDidShow(() => {
  const currentInstance = Taro.getCurrentInstance().page
  Taro.getTabBar(currentInstance).selected = 1
})

// 登录/注册
const handleLogin = () => {
  if (!loginStatus.value){
    dialogVisible.value = true
  }
}

// 跳转到个人信息页面
const toUserInfo =() => {
  Taro.navigateTo({
    url: '/pages/userInfo/userInfo'
  })
}
</script>
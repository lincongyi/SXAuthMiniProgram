<template>
  <view class="container">
    <view class="user-info-box">
      <image class="avatar" mode="widthFix" :src="avatarImage"/>
      <block v-if="!loginStatus">
        <view class="unlogin" @tap="handleLogin">
          登录/注册
          <nut-icon name="arrow-right" size="16" color="#fff"></nut-icon>
        </view>
      </block>
      <block v-else>
        <view class="info-wrap" @tap="toUserInfo">
          <view class="user-content">
            <view class="name">{{fullName}}</view>
            <view class="id-number">证件号码：{{idNum}}</view>
          </view>
          <nut-icon name="arrow-right" size="16" color="#fff"></nut-icon>
        </view>
      </block>
    </view>
    <view class="nav">
      <view class="column" @tap="toAuthRequest">
        <image class="column-icon" mode="widthFix" :src="userCenterRecordImage" />
        <view class="cell">
          <view class="left-label">认证记录</view>
          <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
        </view>
      </view>
      <view class="column" @tap="toSetting">
        <image class="column-icon" mode="widthFix" :src="userCenterSettingImage" />
        <view class="cell">
          <view class="left-label">设置</view>
          <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
        </view>
      </view>
      <!-- 测试用的功能 上线屏蔽-->
      <view class="column" @tap="toAddRequest" v-if="isOpened">
        <image class="column-icon" mode="widthFix" :src="userCenterRecordImage" />
        <view class="cell">
          <view class="left-label">新增认证请求</view>
          <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
        </view>
      </view>
    </view>
    <tabbar/>
  </view>

  <!-- Copyright -->
  <copyright :isFixed="!ISALIPAY" />
</template>

<script setup>
import {ref, defineAsyncComponent, watch} from 'vue'
import Taro from '@tarojs/taro'
import './index.scss'
import {isLogin} from '@utils/index'
import avatarImage from '@images/avatar-default.png' // 用户默认头像
import userCenterRecordImage from '@images/user-center-record.png'
import userCenterSettingImage from '@images/user-center-setting.png'

const tabbar = defineAsyncComponent(() => import('@components/tabbar/index.vue')) // tabbar

const ISALIPAY = Taro.getStorageSync('env') === 'ALIPAY'

const fullName = ref('') // 用户名
const idNum = ref('') // 证件号码

const isOpened = ref(false) // 是否打开新增请求功能入口

// 登录/注册
const handleLogin = () => {
  Taro.showModal({
    title: '温馨提示',
    content: '您尚未登录',
    confirmText: '立即登录',
    cancelText: '暂不登录',
    success: async ({confirm}) => {
      if (confirm) {
        await isLogin()
        loginStatus.value = true
      }
    }
  })
}

// 根据用户登录信息填充用户资料
const setLoginUserInfo = () => {
  let loginUser = Taro.getStorageSync('loginUser')
  fullName.value = loginUser.fullName
  idNum.value = loginUser.idNum
}

// 跳转到个人信息页面
const toUserInfo = () => {
  Taro.navigateTo({
    url: '/pages/userInfo/index'
  })
}

// 跳转到认证记录页面
const toAuthRequest = () => {
  if (!loginStatus.value){
    handleLogin()
  } else {
    Taro.navigateTo({
      url: '/pages/authRequest/index?flag=0'
    })
  }
}

// 跳转到设置页面
const toSetting = () => {
  if (!loginStatus.value){
    handleLogin()
  } else {
    Taro.navigateTo({
      url: '/pages/setting/index'
    })
  }
}

// 跳转到新增用户请求页面
const toAddRequest = () => {
  if (!loginStatus.value){
    handleLogin()
  } else {
    Taro.navigateTo({
      url: '/pages/addRequest/index'
    })
  }
}

const loginStatus = ref(Taro.getStorageSync('loginToken') ? true : false) // 判断用户是否登录状态

watch(loginStatus, (value) => { // 监听用户登录状态若为true，设置用户信息
  if (value) setLoginUserInfo()
}, {
  immediate: true
})

Taro.setStorageSync('loginType', 0) // 重置当前用户为小程序内部运行流程
</script>

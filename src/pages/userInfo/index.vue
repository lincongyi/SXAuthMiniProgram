<template>
  <view class="container">
    <view class="user-avatar">
      <image class="avatar" mode="widthFix" :src="avatarImage"/>
    </view>
    <view class="info-pannel">
      <view class="column">
        <view class="left-label">姓名</view>
        <view class="right-content">{{userInfo.fullName}}</view>
      </view>
      <view class="column">
        <view class="left-label">身份证号码</view>
        <view class="right-content">{{userInfo.idNum}}</view>
      </view>
      <view class="column">
        <view class="left-label">证件有效期</view>
        <view :class="['right-content',{'unfilled':!userInfo.startDate}] " @tap="toCertificateSetting">
          {{userInfo.startDate||'去补充'}}
          <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
        </view>
      </view>
      <view class="column">
        <view class="left-label">手机号码</view>
        <view class="right-content">
          <view class="btn-relative">
            {{userInfo.phoneNum}}
            <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
            <button class="get-phone-number-btn" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber"></button>
          </view>
        </view>
      </view>
      <view class="column">
        <view class="left-label">邮箱</view>
        <view :class="['right-content',{'unbound':!userInfo.mailBox}]" @tap="toUpdateMailBox">
          {{userInfo.mailBox||'未绑定'}}
          <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
        </view>
      </view>
      <view class="column">
        <view class="left-label">地址</view>
        <view :class="['right-content',{'unfilled':!userInfo.address}] " @tap="toUpdateAddress">
          {{userInfo.startDate||'去补充'}}
          <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
        </view>
      </view>
    </view>
  </view>

  <!-- Copyright -->
  <copyright />
</template>

<script setup>
import { ref, reactive } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import './index.scss'
import avatarImage from '@images/avatar-default.png' // 用户默认头像

// 用户信息
let userInfo = ref({
  fullName: '', // 姓名
  idNum: '', // 证件号码
  phoneNum: '', // 手机号码
  startDate: '', // 起始日期
  endDate: '', // 截止日期
  mailBox: '', // 邮箱
  address: '' // 地址
})

// 跳转到设置证件有效期限页面
const toCertificateSetting = () => {
  Taro.navigateTo({
    url: '/pages/certificateSetting/index'
  })
}

// 获取手机号码
const getPhoneNumber = (event) => {
  console.log(event.detail)
  if (event.detail.errMsg.indexOf('getPhoneNumber:ok') === -1) {
    return Taro.showModal({
      title: '温馨提示',
      content: '获取手机号失败，请重试',
      showCancel: false,
    })
  }
}

// 绑定or解绑邮箱
const toUpdateMailBox = () => {
  let url = '/pages/updateMailBox/index'
  if (userInfo.value.mailBox){
    url+=`?isUnBound=1&mailBox=${userInfo.value.mailBox}`
  } else {
    url+='?isUnBound=0'
  }
  Taro.navigateTo({ url })
}

// 跳转到填写地址页面
const toUpdateAddress = () => {
  Taro.navigateTo({
    url: '/pages/updateAddress/index'
  })
}

useDidShow(() => {
  userInfo.value = {...userInfo.value, ...(Taro.getStorageSync('loginUser') || {})}
  console.log(userInfo.value)
})
</script>

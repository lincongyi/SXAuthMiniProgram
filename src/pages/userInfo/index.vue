<template>
  <view class="container">
    <view class="user-avatar">
      <image class="avatar" mode="widthFix" :src="avatarImage"/>
    </view>
    <view class="info-pannel">
      <view class="column">
        <view class="left-label">姓名</view>
        <view class="right-content">{{loginUser.fullName}}</view>
      </view>
      <view class="column">
        <view class="left-label">身份证号码</view>
        <view class="right-content">{{loginUser.idNum}}</view>
      </view>
      <view class="column">
        <view class="left-label">证件有效期</view>
        <view :class="['right-content',{'unfilled':!loginUser.idStartDate}] " @tap="toCertificateSetting">
          {{period||'去补充'}}
          <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
        </view>
      </view>
      <view class="column">
        <view class="left-label">手机号码</view>
        <view class="right-content">
          <view class="btn-relative">
            {{loginUser.phoneNum}}
            <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
            <button class="get-phone-number-btn" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber"></button>
          </view>
        </view>
      </view>
      <view class="column">
        <view class="left-label">邮箱</view>
        <view :class="['right-content',{'unbound':!loginUser.email}]" @tap="toUpdateMailBox">
          {{loginUser.email||'未绑定'}}
          <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
        </view>
      </view>
      <view class="column">
        <view class="left-label">地址</view>
        <view :class="['right-content',{'unfilled':!loginUser.address}] " @tap="toUpdateAddress">
          {{loginUser.address||'去补充'}}
          <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
        </view>
      </view>
    </view>
  </view>

  <!-- Copyright -->
  <copyright />
</template>

<script setup>
import {reactive, computed} from 'vue'
import Taro, {useDidShow} from '@tarojs/taro'
import './index.scss'
import avatarImage from '@images/avatar-default.png' // 用户默认头像
import {updatePhoneNum} from '@api/setting'

// 用户信息
let loginUser = reactive({
  fullName: '', // 姓名
  idNum: '', // 证件号码
  phoneNum: '', // 手机号码
  idStartDate: '', // 起始日期
  idEndDate: '', // 截止日期
  email: '', // 邮箱
  address: '' // 地址
})

// 跳转到设置证件有效期限页面
const toCertificateSetting = () => {
  Taro.navigateTo({
    url: '/pages/certificateSetting/index'
  })
}

// 格式化日期显示:YYYY.MM.DD
const formatDate = (date) => {
  let year = date.slice(0, 4)
  let month = date.slice(4, 6)
  let day = date.slice(6)
  return `${year}.${month}.${day}`
}

// 证件有效期
const period = computed(() => {
  return (!loginUser.idStartDate&&!loginUser.idEndDate) ? '' : `${formatDate(loginUser.idStartDate)}-${formatDate(loginUser.idEndDate)}`
})

// 获取手机号码
const getPhoneNumber = async (event) => {
  if (event.detail.errMsg.indexOf('getPhoneNumber:ok') === -1) {
    return Taro.showModal({
      title: '温馨提示',
      content: '获取手机号失败，请重试',
      showCancel: false,
    })
  }
  let {code: jsCode} = event.detail
  let {data: phoneNum} = await updatePhoneNum({jsCode})
  loginUser.phoneNum = phoneNum
  let loginUserStorage = Taro.getStorageSync('loginUser')
  Taro.setStorageSync({...loginUserStorage, ...{phoneNum}})
}

// 绑定or解绑邮箱
const toUpdateMailBox = () => {
  // isUnBound:0-绑定；1-解绑；
  let url = `/pages/updateMailBox/index?isUnBound=${loginUser.email?'1':'0'}`
  Taro.navigateTo({url})
}

// 跳转到填写地址页面
const toUpdateAddress = () => {
  Taro.navigateTo({
    url: '/pages/updateAddress/index'
  })
}

useDidShow(() => {
  let loginUserStorage = Taro.getStorageSync('loginUser')
  for (let key in loginUser){
    loginUser[key] = loginUserStorage[key]
  }
})
</script>

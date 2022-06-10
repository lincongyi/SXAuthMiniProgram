<template>
  <view class="container">
    <view class="user-avatar">
      <block v-if="!ISALIPAY">
        <open-data type="userAvatarUrl"></open-data>
      </block>
      <block v-else>

      </block>
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
          {{userInfo.phone}}
          <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
        </view>
      </view>
      <view class="column">
        <view class="left-label">邮箱</view>
        <view :class="['right-content',{'unbound':!userInfo.mailBox}]" @tap="toUpdateMailBox">
          {{userInfo.mailBox||'未绑定'}}
          <nut-icon name="arrow-right" size="16" color="#bbb"></nut-icon>
        </view>
      </view>
    </view>
  </view>

  <!-- Copyright -->
  <copyright />
</template>

<script setup>
import { ref, reactive, defineAsyncComponent } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { getEnv } from '@utils/index.js'
import './index.scss'

const ISALIPAY = getEnv() === 'ALIPAY'
// 用户信息
let userInfo = reactive({
  fullName: 'XXX', // 姓名
  idNum: 'YYY',
  phone: '15800000000', // 手机号码
  startDate: '', // 起始日期
  endDate: '', // 截止日期
  mailBox: '', // 邮箱
})

// 跳转到设置证件有效期限页面
const toCertificateSetting = () => {
  Taro.navigateTo({
    url: '/pages/certificateSetting/index'
  })
}

// 绑定or解绑邮箱
const toUpdateMailBox = () => {
  let url = '/pages/updateMailBox/index'
  if (userInfo.mailBox){
    url+=`?isUnBound=1&mailBox=${userInfo.mailBox}`
  } else {
    url+='?isUnBound=0'
  }
  Taro.navigateTo({ url })
}

useDidShow(() => {
  userInfo = {...userInfo, ...(Taro.getStorageSync('userInfo') || {})}
})
</script>
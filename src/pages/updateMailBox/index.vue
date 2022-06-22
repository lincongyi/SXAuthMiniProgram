<template>
  <view class="container">
    <block v-if="isUnBound">
      <view class="title">当前绑定邮箱</view>
      <view class="mail-box">{{mailBox}}</view>
    </block>
    <block v-else>
      <nut-input placeholder="请输入邮箱地址" clearable v-model="mailBox" label="邮箱" max-length="20" />
    </block>
    <nut-input v-model="verificationCode" clearable center label="邮箱验证码" placeholder="请输入邮箱验证码" max-length="6">
      <template #button>
        <nut-button size="small" type="primary" shape="square" :disabled="!canGetCode || isDisabled" @tap="getCode"> {{getCodeBtnTxt}} </nut-button>
      </template>
    </nut-input>
    <view class="btn-warp">
      <nut-button type="primary" shape="square" block @tap="handleConfirm" :class="{'disabled':btnDisabled}">{{confirmBtnTxt}}</nut-button>
    </view>
  </view>

  <!-- Copyright -->
  <copyright />
</template>

<script setup>
import { ref, computed } from 'vue'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import './index.scss'

const isUnBound = ref(1) // 0.绑定邮箱，1.解绑邮箱
const mailBox = ref('') // 邮箱
const verificationCode = ref('') // 验证码
const getCodeBtnTxt = ref('获取验证码') // 按钮文字
const isDisabled = ref(false) // 是否禁用获取验证码的按钮
let timer = null
const period = 45 // 重新发送验证码周期（秒）
const currentTime = ref(period) // 当前剩余重发秒数

const confirmBtnTxt = ref('') // 确认按钮文字内容
const btnDisabled = computed(() => !mailBox.value || !verificationCode.value)
const mailBoxReg = /\w{3,}(\.\w+)*@[A-z0-9]+(\.[A-z]{2,5}){1,2}/
const canGetCode = computed(() => mailBoxReg.test(mailBox.value))

// 获取验证码
const getCode = () => {
  if (!canGetCode.value){
    return Taro.showToast({
      icon: 'none',
      title: '请输入正确的邮箱地址'
    })
  }

  Taro.showToast({
    icon: 'none',
    title: '邮箱验证码已发送'
  })
  isDisabled.value = true
  getCodeBtnTxt.value = `${currentTime.value}s后重发`

  timer = setInterval(() => {
    getCodeBtnTxt.value = `${--currentTime.value}s后重发`
    if (currentTime.value<0){
      getCodeBtnTxt.value = '获取验证码'
      currentTime.value = period
      isDisabled.value = false
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

// 绑定 or 解除绑定
const handleConfirm = () => {
  if (!mailBox.value){
    return Taro.showToast({
      icon: 'none',
      title: '请输入邮箱地址'
    })
  } else if (!verificationCode.value) {
    return Taro.showToast({
      icon: 'none',
      title: '请输入邮箱验证码'
    })
  }
  setTimeout(() => {
    let userInfo = Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')) : {}
    Taro.setStorageSync('userInfo', JSON.stringify({...userInfo, ...{mailBox: mailBox.value}}))
    Taro.showToast({
      mask: true,
      title: '绑定成功',
      success: () => {
        setTimeout(() => {
          Taro.navigateBack({
            delta: 1
          })
        }, 1500)
      }
    })
  }, 1500)
}

useDidShow(() => {
  let router = useRouter()
  isUnBound.value = Number(router.params?.isUnBound || false)
  if (isUnBound.value) mailBox.value = router.params.mailBox
  Taro.setNavigationBarTitle({
    title: ['绑定邮箱', '邮箱解绑'][isUnBound.value]
  })
  confirmBtnTxt.value = ['绑定', '解除绑定'][isUnBound.value]
})
</script>

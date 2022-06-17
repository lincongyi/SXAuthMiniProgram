<template>
  <view class="container">
    <view class="content">
      <view class="top-box">
        <image class="logo" mode="widthFix" :src="loginImage"/>
        <view class="title">陕西公民实人认证</view>
      </view>
      <!-- 用户信息录入 start -->
      <view class="form-group">
        <nut-input v-model="type" readonly label="证件类型" />
        <nut-input v-model="userInfo.fullName" label="姓名" placeholder="请输入姓名" clearable required maxlength="20" />
        <nut-input v-model="userInfo.idNum" label="证件号码" placeholder="请输入证件号码" clearable required maxlength="18" />
      </view>
      <!-- 用户信息录入 end -->
    </view>
    <!-- <view :class="['submit-btn',{'is-active':isActive,}]" @tap="handleSubmit">下一步</view> -->

    <view class="btn-warp">
      <nut-button type="primary" shape="square" block @tap="handleSubmit" :class="{'disabled':btnDisabled}">下一步</nut-button>
    </view>

    <view class="tips-textarea">
      <view class="normal">未注册用户登录时将完成注册，登录即代表</view>
      <view class="normal">
        您已同意
        <view class="emphasize">《用户服务协议》</view>
      </view>
    </view>
  </view>

  <authActionSheet
    ref="authActionSheetComponent"
    :beforeAuth="beforeAuth"
    :beforeProtocol="beforeProtocol"
    :protocolName="protocolName"
    :protocolUrl="protocolUrl"
    @onConfirm="handleConfirm"
  >
  </authActionSheet>

  <!-- Copyright -->
  <copyright />

  <nut-dialog
    title="温馨提示"
    content="您的账号已绑定支付宝，下次可直接使用支付宝授权快捷登录"
    v-model:visible="dialogVisible"
    :no-cancel-btn="true"
  />
</template>
<script setup>
import { ref, reactive, computed, defineAsyncComponent } from 'vue'
import Taro from '@tarojs/taro'
import loginImage from '@images/logo.png'
import './index.scss'
import { beforeVerify } from '@utils/beforeVerify'
import { getUserIdKey } from '@api/auth'

// 用户录入信息
const type = '第二代居民身份证'
const userInfo = reactive({
  idNum: '440105199203182415',
  fullName: '林聪毅',
})
const btnDisabled = computed(() => !userInfo.fullName || !userInfo.idNum)
const dialogVisible = ref(false) // 控制弹出框显示隐藏

const beforeAuth = ref('') // 动作面板温馨提示内容
const beforeProtocol = ref('') // 同意协议提示内容
const protocolName = ref('') // 《用户服务协议》
const protocolUrl = ref('') // 《用户服务协议》url
const authActionSheet = defineAsyncComponent(() => import('@components/authActionSheet/index.vue'))
const authActionSheetComponent = ref(null)

const handleSubmit = async () => {
  let {fullName, idNum} = userInfo
  if (!fullName){
    return Taro.showToast({
      icon: 'none',
      title: '请输入姓名'
    })
  } else if (!idNum){
    return Taro.showToast({
      icon: 'none',
      title: '请输入证件号码'
    })
  }

  // 调起人脸认证前的校验流程
  let options = {
    idInfo: {
      idNum: userInfo.idNum,
      fullName: userInfo.fullName,
    }
  }
  Taro.showLoading({title: '请稍候...'})
  let {authTipsInfo, authUser} = await beforeVerify(options)
  Taro.hideLoading()
  authActionSheetComponent.value.actionSheetVisible = true
  beforeAuth.value = authTipsInfo.beforeAuth
  beforeProtocol.value = authTipsInfo.beforeProtocol
  let protocol = authTipsInfo.protocolList[0]
  protocolName.value = protocol.name
  protocolUrl.value = protocol.url
}

// 确认授权
const handleConfirm = async () => {
  Taro.showLoading({title: '请稍候...'})
  let {userIdKey} = await getUserIdKey({
    idNum: userInfo.idNum,
    fullName: userInfo.fullName
  })
  Taro.hideLoading()
  Taro.checkIsSupportFacialRecognition({
    success: (res) => {
      console.log(res)
    },
    fail: (e) => {
      Taro.showModal({
        title: '温馨提示',
        content: e.errMsg,
        showCancel: false,
      })
    }
  })
}

// 认证成功后回调
// dialogVisible.value = true
</script>
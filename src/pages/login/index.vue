<template>
  <view class="container">
    <view class="content">
      <view class="top-box">
        <image class="logo" mode="widthFix" :src="loginImage"/>
        <view class="title">陕西公民实人认证</view>
      </view>
      <!-- 用户信息录入 start -->
      <view class="form-group">
        <nut-input v-model="formData.type" readonly label="证件类型" />
        <nut-input v-model="formData.fullName" label="姓名" placeholder="请输入姓名" clearable required maxlength="20" />
        <nut-input v-model="formData.idcardNum" label="证件号码" placeholder="请输入证件号码" clearable required maxlength="18" />
        <nut-input v-model="formData.address" label="地址" placeholder="请输入地址" clearable maxlength="30" />
        <nut-input v-model="formData.email" label="邮箱" placeholder="请输入邮箱" clearable maxlength="-1" :border="false" />
      </view>
      <!-- 用户信息录入 end -->
    </view>
    <view :class="['submit-btn',{'is-active':isActive,}]" @tap="handleSubmit">下一步</view>

    <view class="tips-textarea">
      <view class="normal">未注册用户登录时将完成注册，登录即代表</view>
      <view class="normal">
        您已同意
        <view class="emphasize">《用户服务协议》</view>
      </view>
    </view>
  </view>

  <!-- Copyright -->
  <copyright></copyright>

  <nut-dialog
    title="温馨提示"
    content="您的账号已绑定支付宝，下次可直接使用支付宝授权快捷登录"
    v-model:visible="dialogVisible"
    :no-cancel-btn="true"
  />
</template>
<script setup>
import { ref, reactive, defineAsyncComponent, computed } from 'vue'
import Taro from '@tarojs/taro'
import loginImage from '@images/logo.png'
import './index.scss'
const copyright = defineAsyncComponent(() => import('@components/copyright/index.vue'))

// 用户录入信息
const formData = reactive({
  type: '第二代居民身份证',
  fullName: '',
  idcardNum: '',
  address: '',
  email: '',
})
const dialogVisible = ref(false) // 控制弹出框显示隐藏
const isActive = computed(() => formData.fullName && formData.idcardNum)
const handleSubmit = () => {
  let {fullName, idcardNum} = formData
  if (!fullName){
    return Taro.showToast({
      icon: 'none',
      title: '请输入姓名'
    })
  } else if (!idcardNum){
    return Taro.showToast({
      icon: 'none',
      title: '请输入证件号码'
    })
  }
  dialogVisible.value = true
}
</script>
<template>
  <view class="container">
    <nut-input
      label="姓名"
      placeholder="请输入姓名"
      v-model="userInfo.fullName"
    />
    <nut-input
      label="证件号码"
      placeholder="请输入证件号码"
      type="idcard"
      v-model="userInfo.idNum"
    />
    <nut-button shape="square" block type="primary" class="btn-confirm" @tap="handleConfirm">提交</nut-button>
    <view class="tips">信息可填可不填，录入对方身份信息可以在对方认证请求列表中添加任务</view>
  </view>
</template>

<script setup>
import { reactive, toRaw } from 'vue'
import Taro from '@tarojs/taro'
import './index.scss'
import { addAuthTask } from '@api/auth'

const userInfo = reactive({
  fullName: '',
  idNum: ''
})

// 新增认证请求任务
const handleConfirm = async () => {
  await addAuthTask(toRaw(userInfo))
  Taro.showToast({
    icon: 'none',
    title: '新增请求成功',
    mask: true,
    success: () => {
      setTimeout(() => {
        Taro.navigateBack({ delta: 1 })
      }, 1500)
    }
  })
}
</script>

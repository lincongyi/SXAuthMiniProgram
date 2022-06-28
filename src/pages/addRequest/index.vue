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
    <block v-if="needDate">
      <picker
        mode="date"
        :value="userInfo.startDate"
        :end="dateTime"
        @change="onStartDateChange">
        <nut-cell title="起始日期" :desc="userInfo.startDate"></nut-cell>
      </picker>
      <picker
        mode="date"
        :value="userInfo.endDate"
        :start="dateTime"
        @change="onEndDateChange">
        <nut-cell title="截止日期" :desc="userInfo.endDate"></nut-cell>
      </picker>
    </block>
    <picker
      mode="selector"
      :value="userInfo.endDate"
      :range="modeRange"
      @change="onModeChange">
      <nut-cell title="认证模式" :desc="userInfo.mode"></nut-cell>
    </picker>
    <nut-button shape="square" block type="primary" class="btn-confirm" @tap="handleConfirm">提交</nut-button>
    <view class="tips">信息可填可不填，录入对方身份信息可以在对方认证请求列表中添加任务</view>
  </view>
</template>

<script setup>
import { ref, reactive, toRaw } from 'vue'
import Taro from '@tarojs/taro'
import './index.scss'
import { addAuthTask } from '@api/auth'
import { formatDate } from '@utils/index'

const userInfo = reactive({
  fullName: '',
  idNum: '',
  startDate: '', // 证件起始日期
  endDate: '', // 证件截止日期
  mode: 66,
})
const modeRange = [66, 64, 16, 18]
const needDate = ref(false)

const dateTime = formatDate((new Date()).getTime()).replaceAll('.', '/')

// 选择证件起始时间
const onStartDateChange = (e) => {
  userInfo.startDate = e.detail.value
}

// 选择证件截止时间
const onEndDateChange = (e) => {
  userInfo.endDate = e.detail.value
}

const onModeChange = (e) => {
  let mode = modeRange[Number(e.detail.value)]
  if ([66, 64].includes(mode)) needDate.value = false
  else needDate.value = true

  userInfo.mode = mode
}

// 新增认证请求任务
const handleConfirm = async () => {
  let {fullName, idNum, mode} = userInfo
  let data = [66, 64].includes(mode) ? {fullName, idNum, mode} : toRaw(userInfo)
  await addAuthTask(data)
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

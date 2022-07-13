<template>
  <view class="container">
    <view class="certificate-pannel">
      <view class="column">
        <view class="top-conent">起始日期</view>
        <view :class="['selected-date', {'unselected':!idStartDate}]">
          <picker
            mode="date"
            :value="startDateValue"
            :start="minDate"
            :end="(new Date())"
            @change="handleStartDateChange">
            <view>{{idStartDate||'请选择身份证有效期起始日期'}}</view>
          </picker>
        </view>
      </view>
      <view class="column">
        <view class="top-conent">
          <text>截止日期</text>
          <view class="right-controller">
            <view class="right-label">长期有效</view>
            <nut-switch v-model="isPermanent" @change="isPermanentChange"/>
          </view>
        </view>
        <view v-show="!isPermanent" :class="['selected-date', {'unselected':!idEndDate}]">
          <picker
            mode="date"
            :value="endDateValue"
            :start="(new Date())"
            :end="maxDate"
            @change="handleEndDateChange">
            <view>{{idEndDate||'请选择身份证有效期截止日期'}}</view>
          </picker>
        </view>
      </view>
    </view>
    <view class="btn-warp">
      <nut-button type="primary" shape="square" block @tap="handleConfirm">确定</nut-button>
    </view>
  </view>

  <!-- Copyright -->
  <copyright />
</template>

<script setup>
import {ref} from 'vue'
import Taro, {useDidShow} from '@tarojs/taro'
import './index.scss'
import {updateYXQ} from '@api/setting'

// 默认起始日期
const minDate = ref(new Date('2000-01-01')) // 限制开始时间
const maxDate = ref(new Date('2040-12-31')) // 限制结束时间
const idStartDate = ref('') // 起始日期
const idEndDate = ref('') // 截至日期
// 计算日期差值
const calcDate = (date) => {
  let today = new Date()
  let todayTimestamp = today.getTime()
  let origin = new Date(date)
  let originTimestamp = origin.getTime()
  let targetTimestamp = (todayTimestamp+originTimestamp) / 2
  let target = new Date(targetTimestamp)
  return `${target.getFullYear()}-${fillZero(target.getMonth()+1)}-${fillZero(target.getDate())}`
}
const fillZero = (target) => {
  target = target + ''
  return (target.length === 1 ? `0${target}` : target)
}
const startDateValue = ref(calcDate(minDate.value))
const endDateValue = ref(calcDate(maxDate.value))
const isPermanent = ref(false) // 是否长期有效

// 设置起始日期
const handleStartDateChange = (e) => {
  idStartDate.value = e.detail.value.replace(/\//g, '') // 兼容ios日期返回'/'，同意处理成'-'
  // 设置的是起始日期的话，截止日期最大年度单位+20
  let date = new Date()
  let year = date.getFullYear()+20
  maxDate.value = new Date(`${year}-12-31`)
}

// 设置截止日期
const handleEndDateChange = (e) => {
  idEndDate.value = e.detail.value.replace(/\//g, '') // 兼容ios日期返回'/'，同意处理成'-'
}

// 切换是否长期有效
const isPermanentChange = () => {
  idEndDate.value = isPermanent.value ? '00000000':'' // 长期有效传8个0
}

// 确定
const handleConfirm = async () => {
  if (!idStartDate.value){
    return Taro.showToast({
      icon: 'none',
      title: '请选择起始日期'
    })
  } else if (!idEndDate.value){
    return Taro.showToast({
      icon: 'none',
      title: '请选择截止日期'
    })
  } else if (idStartDate.value===idEndDate.value){
    return Taro.showModal({
      title: '温馨提示',
      content: '起始日期不能大于或等于截止日期',
      showCancel: false
    })
  }
  await updateYXQ({
    idStartDate: idStartDate.value.replace(/-/g, ''),
    idEndDate: idEndDate.value.replace(/-/g, '')
  })
  Taro.setStorageSync('loginUser', {...Taro.getStorageSync('loginUser'), ...{idStartDate: idStartDate.value.replace(/-/g, '.'), idEndDate: idEndDate.value.replace(/-/g, '.')}})
  Taro.showToast({
    title: '证件有效期添加成功',
    mask: true,
    success: () => {
      setTimeout(() => {
        Taro.navigateBack({delta: 1})
      }, 1000)
    }
  })
}

// 格式化日期显示
const formatDate = (date) => {
  let arr = [4, 2, 2]
  let target = []
  let flag = 0
  for (let i=0;i<arr.length;i++){
    target.push(date.substr(flag, arr[i]))
    flag += arr[i]
  }
  return target.join('-')
}

useDidShow(() => {
  if (Taro.getStorageSync('loginToken')){
    let loginUser = Taro.getStorageSync('loginUser')
    // 初始化起始日期
    if (loginUser.idStartDate) startDateValue.value = idStartDate.value = formatDate(loginUser.idStartDate)

    // 初始化截止日期
    if (loginUser.idEndDate){
      if (loginUser.idEndDate === '00000000'){
        endDateValue.value = ''
        isPermanent.value = true
      } else {
        endDateValue.value = idEndDate.value = formatDate(loginUser.idEndDate)
      }
    }
  }
})
</script>

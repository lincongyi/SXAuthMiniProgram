<template>
  <view class="container">
    <view class="certificate-pannel">
      <view class="column">
        <view class="top-conent">起始日期</view>
        <view :class="['selected-date', {'unselected':!idStartDate}]" @tap="showDatePicker(0)">{{idStartDate||'请选择身份证有效期起始日期'}}</view>
      </view>
      <view class="column">
        <view class="top-conent">
          <text>截止日期</text>
          <view class="right-controller">
            <view class="right-label">长期有效</view>
            <nut-switch v-model="isPermanent" @change="isPermanentChange"/>
          </view>
        </view>
        <view v-show="!isPermanent" :class="['selected-date', {'unselected':!idEndDate}]" @tap="showDatePicker(1)">{{idEndDate||'请选择身份证有效期截止日期'}}</view>
      </view>
    </view>
    <view class="btn-warp">
      <nut-button type="primary" shape="square" block @tap="handleConfirm">确定</nut-button>
    </view>
  </view>
  <nut-datepicker
    :title="datePickerTitle"
    v-model="currentDate"
    v-model:visible="datePickerShow"
    :min-date="minDate"
    :max-date="maxDate"
    :is-show-chinese="true"
    @confirm="confirm"
  ></nut-datepicker>

  <!-- Copyright -->
  <copyright />
</template>

<script setup>
import {ref} from 'vue'
import Taro from '@tarojs/taro'
import './index.scss'
import {updateYXQ} from '@api/setting'

const datePickerIndex = ref(0) // 0.起始日期；1.截至日期
const datePickerTitle = ref('') // 日期选择器标题
const datePickerShow = ref(false) // 控制日期选择器显示隐藏
const currentDate = ref('') // 日期选择器日期
const idStartDate = ref('') // 起始日期
const idEndDate = ref('') // 截至日期
const minDate = ref(new Date('2000-01-01')) // 限制开始时间
const maxDate = ref(new Date('2030-12-31')) // 限制结束时间
const isPermanent = ref(false) // 是否长期有效

// 显示日期选择器
const showDatePicker = (index) => {
  let target = [idStartDate, idEndDate][index].value.replace(/\./g, ',')
  currentDate.value = target ? new Date(target) : new Date()

  datePickerIndex.value = index
  datePickerTitle.value = ['起始日期', '截至日期'][index]
  minDate.value = [new Date('2000-01-01'), new Date()][index]
  maxDate.value = [new Date(), new Date('2030-12-31')][index]
  datePickerShow.value = true
}

// 选择日期
const confirm = ({selectedValue}) => {
  ([idStartDate, idEndDate][datePickerIndex.value]).value = selectedValue.join('.')
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
    idStartDate: idStartDate.value.replace(/\./g, ''),
    idEndDate: idEndDate.value.replace(/\./g, '')
  })
  Taro.setStorageSync('loginUser', {...Taro.getStorageSync('loginUser'), ...{idStartDate: idStartDate.value, idEndDate: idEndDate.value}})
  Taro.showToast({
    title: '证件有效期添加成功',
    mask: true,
    success: () => {
      setTimeout(() => {
        Taro.navigateBack({delta: 1})
      }, 1500)
    }
  })
}
</script>

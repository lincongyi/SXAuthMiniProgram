<template>
  <view class="container">
    <nut-input placeholder="省市区县、乡镇等" clearable v-model="city" label="所在地区" max-length="20" />
    <nut-input placeholder="街道、楼牌号等" clearable v-model="street" label="详细地址" max-length="30" />
    <view class="btn-warp">
      <nut-button type="primary" shape="square" block @tap="handleConfirm" :class="{'disabled':btnDisabled}">保存</nut-button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import './index.scss'
import Taro from '@tarojs/taro'
import { updateAddress } from '@api/setting'

const city = ref('') // 省市区县、乡镇等
const street = ref('') // 街道、楼牌号等
const btnDisabled = computed(() => !city.value || !street.value)

// 保存
const handleConfirm = async () => {
  if (!city.value){
    return Taro.showToast({
      icon: 'none',
      title: '省市区县、乡镇'
    })
  } else if (!street.value) {
    return Taro.showToast({
      icon: 'none',
      title: '街道、楼牌号'
    })
  }
  await updateAddress({ address: `${city.value}${street.value}` })
  let loginUser = Taro.getStorageSync('loginUser')
  Taro.setStorageSync('loginUser', {...loginUser, ...{address: `${city.value}${street.value}`}})
  Taro.showToast({
    mask: true,
    title: '绑定成功',
    success: () => {
      setTimeout(() => {
        Taro.navigateBack({ delta: 1 })
      }, 1500)
    }
  })
}
</script>

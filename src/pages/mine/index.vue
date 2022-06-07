<template>
  <view class="mine">
    <text>{{ msg }}</text>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import './index.scss'
const msg = ref('MINE PAGE')
useDidShow(() => {
  const currentInstance = Taro.getCurrentInstance().page
  Taro.getTabBar(currentInstance).selected = 1
})
</script>

<template>
  <view class="index">
    <text>{{ msg }}</text>
    <nut-button type="primary">主要按钮</nut-button>
    <nut-button type="info">信息按钮</nut-button>
    <nut-button type="default">默认按钮</nut-button>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import './index.scss'

const msg = ref('Hello world!!!')
</script>

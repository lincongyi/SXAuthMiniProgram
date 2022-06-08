<template>
  <view class="tab-bar">
    <view class="tab-bar-border"></view>
    <view v-for="(item, index) in list" :key="index" class="tab-bar-item" @tap="switchTab(item.pagePath)">
      <image :src="selected === index ? item.selectedIconPath : item.iconPath" />
      <view :style="{ color: selected === index ? selectedColor : color }">{{item.text}}</view>
    </view>
  </view>
</template>

<script setup>
import {ref} from 'vue'
import Taro from '@tarojs/taro'

const list = [
  {
    pagePath: '/pages/index/index',
    selectedIconPath: '../images/tabbar-home-on.png',
    iconPath: '../images/tabbar-home-off.png',
    text: '首页'
  },
  {
    pagePath: '/pages/mine/index',
    selectedIconPath: '../images/tabbar-mine-on.png',
    iconPath: '../images/tabbar-mine-off.png',
    text: '我的'
  }
]
const selected = ref(0)
const color = '#000000'
const selectedColor = '#0A7AEE'
const switchTab = (url) => {
  Taro.switchTab({ url })
}

</script>
<style lang="scss">
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: white;
  display: flex;
  padding-bottom: env(safe-area-inset-bottom);
}
.tab-bar-border {
  background-color: rgba(0, 0, 0, 0.33);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 1px;
  transform: scaleY(0.5);
}
.tab-bar-item {
  padding-top: 16px;
  flex: 1;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.tab-bar-item image {
  width: 40px;
  height: 40px;
  margin-bottom: 6px;
}
.tab-bar-item view {
  font-size: 20px;
}
</style>
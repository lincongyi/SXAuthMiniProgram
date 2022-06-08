<template>
  <view :class="['copyright',{'is-fixed':isFixed}]">
    <view class='image-wrap'>
      <image class="image-item" :src='copyrightImage'></image>
    </view>
  </view>
</template>
<script setup>
import './index.scss'
import copyrightImage from '@images/copyright.png'
</script>
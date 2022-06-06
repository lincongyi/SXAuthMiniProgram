<template>
  <view class="copyright {{isFixed ? 'is-fixed':''}}">
    <view class='image-wrap'>
      <image class="image-item" :src='copyrightImage'></image>
    </view>
  </view>
</template>
<script setup>
import './index.scss'
import copyrightImage from '@images/copyright.png'
</script>
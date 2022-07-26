<template>
  <view :class="['copyright',{'is-fixed':isFixed}]">
    <view class='image-wrap'>
      <image class="image-item" :src='copyrightImage'></image>
    </view>
  </view>
</template>
<script setup>
import {toRefs} from 'vue'
import './index.scss'
import copyrightImage from '@images/copyright.png'
const props = defineProps({
  isFixed: {
    type: Boolean,
    value: false
  }
})
const {isFixed} = toRefs(props)
</script>
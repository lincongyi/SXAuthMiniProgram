<template>
  <view class="container">
    <view class="auth-result">
      <image class="result-image" mode="widthFix" :src="resultList[authResult].resultImage"/>
      <view class="description">{{resultList[authResult].resultTxt}}</view>
    </view>
    <view class="step successful">实名校验</view>
    <view class="step failed">实名校验</view>
    <view class="step">人像比对</view>
    <view class="btn-warp">
      <nut-button type="primary" shape="square" block>确定</nut-button>
    </view>
  </view>

  <!-- Copyright -->
  <copyright />
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue'
import './index.scss'
import certificationSuccessfulImage from '@images/certification-successful.png'
import certificationFailedImage from '@images/certification-failed.png'
const copyright = defineAsyncComponent(() => import('@components/copyright/index.vue'))

const authResult=ref(0) // 0.认证成功；1.认证失败；
const resultList = [
  {
    resultTxt: '认证成功',
    resultImage: certificationSuccessfulImage
  },
  {
    resultTxt: '认证失败',
    resultImage: certificationFailedImage
  },
]

</script>

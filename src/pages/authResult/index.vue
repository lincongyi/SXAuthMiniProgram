<template>
  <view class="container">
    <view class="auth-result">
      <image class="result-image" mode="widthFix" :src="resultList[authResult].resultImage"/>
      <view class="description">{{resultList[authResult].resultTxt}}</view>
    </view>
    <block v-for="(item,index) in authResultStep" :key="index">
      <view :class="['step',['failed','successful'][item.value]]">{{item.key}}</view>
    </block>
    <view class="btn-warp">
      <nut-button type="primary" shape="square" block @tap="toAuthRequest">确定</nut-button>
    </view>
  </view>

  <!-- Copyright -->
  <copyright />
</template>

<script setup>
import { ref, computed } from 'vue'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import './index.scss'
import certificationSuccessfulImage from '@images/certification-successful.png'
import certificationFailedImage from '@images/certification-failed.png'

// authRes:00XX
// 第一字节：姓名，身份号码，有效期等文本信息比对结果
// 第二字节：人像比对结果
const modeList = [
  {
    mode: [16, 64], // 16,64模式只校验1项
    type: 1
  },
  {
    mode: [18, 66], // 18,66模式校验前2项
    type: 2,
  }
]
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
const authMode = ref(0) // 认证模式
const authData = ref('') // 认证结果
// 每项认证步骤的结果
const authResultStep = computed(() => {
  // 认证结果：0-失败；1-成功；2-未校验
  let result = [
    { key: '实名校验', value: 2 },
    { key: '人像比对', value: 2 }
  ]
  if (authMode.value){
    let {type} = modeList.find((item) => item.mode.includes(authMode.value))
    let data = authData.value.slice(0, type)
    for (let i=0;i<data.length;i++){
      let value = Number(data[i])===0 ? 1:0
      result[i].value = value
    }
  }
  return result
})

// 认证结果：0-失败；1-成功；
const authResult = computed(() => {
  if (!authData.value){
    return 0
  } else {
    let item = authResultStep.value.find((item) => !item.value)
    return item ? 1:0
  }
})

// 跳转到认证请求||记录页面
const toAuthRequest = () => {
  Taro.navigateTo({url: '/pages/authRequest/index?isFromResult=1'})
}

useDidShow(() => {
  let router = useRouter()
  let {mode, data} = router.params.authMode
  authMode.value = Number(mode)
  authData.value = data

})
</script>

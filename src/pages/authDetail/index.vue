<template>
  <view class="container">
    <view class="auth-result">
      <image class="result-image" mode="widthFix" :src="resultList[authResult].resultImage"/>
      <view class="description">{{resultList[authResult].resultTxt}}</view>
    </view>
    <view class="auth-info">
      <!-- 待认证 start -->
      <block v-if="authResult>=3">
        <nut-cell-group>
          <nut-cell title="认证场景" desc="认证推送"></nut-cell>
          <nut-cell title="认证来源" desc="认证推送"></nut-cell>
          <nut-cell title="认证模式" desc="认证推送"></nut-cell>
          <nut-cell title="发起时间" desc="认证推送"></nut-cell>
          <nut-cell title="到期时间" desc="认证推送"></nut-cell>
        </nut-cell-group>
      </block>
      <!-- 待认证 end -->
      <!-- 认证成功、认证失败、认证过期 start -->
      <block v-else>
        <nut-cell-group>
          <nut-cell title="认证方式" :desc="authDetail.authMethod"></nut-cell>
          <nut-cell title="认证场景" :desc="authDetail.authSceneStr"></nut-cell>
          <nut-cell title="姓名" :desc="authDetail.fullName"></nut-cell>
          <nut-cell title="证件号码" :desc="authDetail.idNum"></nut-cell>
        </nut-cell-group>
        <nut-divider :style="{ color: '#e5e5e5', borderColor: '#e5e5e5', padding: '0 16px' }"/>
        <nut-cell-group>
          <nut-cell title="认证模式" :desc="authDetail.authModeStr"></nut-cell>
          <nut-cell title="发起时间" :desc="authDetail.createTime"></nut-cell>
          <nut-cell v-if="authResult!==2" title="认证时间" :desc="authDetail.authTime"></nut-cell>
        </nut-cell-group>
        <view class="tips">温馨提示：本次互联网可信身份认证服务由广州大白互联网科技有限公司提供技术支持</view>
      </block>
      <!-- 认证成功、认证失败、认证过期 start -->
    </view>
    <block v-if="authResult>=3">
      <view class="btn-warp">
        <nut-button type="primary" shape="square" block>立即认证</nut-button>
      </view>
    </block>
  </view>

  <!-- Copyright -->
  <copyright />
</template>

<script setup>
import { ref } from 'vue'
import './index.scss'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import toBeCertifiedImage from '@images/to-be-certified.png'
import certificationSuccessfulImage from '@images/certification-successful.png'
import certificationFailedImage from '@images/certification-failed.png'
import certificationExpiredImage from '@images/certification-expired.png'

const authResult = ref(0) // 0.认证成功；1.认证失败；2.认证过期；3.待认证；
const resultList = [
  {
    resultTxt: '认证成功',
    resultImage: certificationSuccessfulImage
  },
  {
    resultTxt: '认证失败',
    resultImage: certificationFailedImage
  },
  {
    resultTxt: '认证过期',
    resultImage: certificationExpiredImage
  },
  {
    resultTxt: '待认证',
    resultImage: toBeCertifiedImage
  },
]
const authDetail = ref({})

useDidShow(() => {
  let router = useRouter()
  authResult.value = Number(router.params.authResult)

  authDetail.value = Taro.getStorageSync('authDetail')
  Taro.removeStorageSync('authDetail')
})
</script>

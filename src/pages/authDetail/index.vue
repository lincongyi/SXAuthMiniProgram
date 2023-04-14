<template>
  <view class="container">
    <view class="auth-result">
      <image
        class="result-image"
        mode="widthFix"
        :src="resultList[authResult].resultImage"
      />
      <view class="description">{{ resultList[authResult].resultTxt }}</view>
    </view>
    <view class="auth-info">
      <!-- 待认证 start -->
      <block v-if="authResult >= 3">
        <nut-cell-group>
          <nut-cell title="认证场景" :desc="authDetail.authSceneStr"></nut-cell>
          <nut-cell title="认证来源" :desc="authDetail.sourceName"></nut-cell>
          <nut-cell title="认证模式" :desc="authDetail.authModeStr"></nut-cell>
          <nut-cell title="发起时间" :desc="authDetail.createTime"></nut-cell>
          <nut-cell title="到期时间" :desc="authDetail.expireTime"></nut-cell>
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
        <nut-divider
          :style="{
            color: '#e5e5e5',
            borderColor: '#e5e5e5',
            padding: '0 16px'
          }"
        />
        <nut-cell-group>
          <nut-cell title="认证模式" :desc="authDetail.authModeStr"></nut-cell>
          <nut-cell title="发起时间" :desc="authDetail.createTime"></nut-cell>
          <nut-cell
            v-if="authResult !== 2"
            title="认证时间"
            :desc="authDetail.authTime"
          ></nut-cell>
        </nut-cell-group>
        <view class="tips"
          >温馨提示：本次互联网可信身份认证服务由广州大白互联网科技有限公司提供技术支持</view
        >
      </block>
      <!-- 认证成功、认证失败、认证过期 start -->
    </view>
    <block v-if="authResult >= 3">
      <view class="btn-warp">
        <nut-button type="primary" shape="square" block @tap="handleAuth"
          >立即认证</nut-button
        >
      </view>
    </block>
  </view>

  <authActionSheet
    ref="authActionSheetComponent"
    :beforeAuth="beforeAuth"
    :beforeProtocol="beforeProtocol"
    :protocolName="protocolName"
    :protocolUrl="protocolUrl"
    :mode="mode"
    @onConfirm="handleConfirm"
  />

  <!-- Copyright -->
  <copyright />
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue'
import './index.scss'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import { handleCollectInfo } from '@utils/collectInfo'
import {
  checkCerTokenAgent,
  getUserIdKey,
  getCertifyResult,
  checkCertCodeAgent
} from '@api/auth'
import {
  checkIsSupportFacialRecognition,
  startFacialRecognitionVerify
} from '@utils/taro'
import { alipayAuth } from '@utils/alipayAuth'
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
  }
]
const authDetail = ref({}) // 反显用户信息

const canSelfAuth = ref(false) // 是否代他人认证
const mode = ref(0) // 认证模式
const certToken = ref('') // certToken

const beforeAuth = ref('') // 动作面板温馨提示内容
const beforeProtocol = ref('') // 同意协议提示内容
const protocolName = ref('') // 《用户服务协议》
const protocolUrl = ref('') // 《用户服务协议》url
const authActionSheet = defineAsyncComponent(() =>
  import('@components/authActionSheet/index.vue')
) // 授权弹窗
const authActionSheetComponent = ref(null)
const ISALIPAY = Taro.getStorageSync('env') === 'ALIPAY'

// 立即认证
const handleAuth = async () => {
  // 1.校验certToken，并返回授权信息（certToken从上一个认证请求的跳过来的url中拿到）
  const result = await checkCerTokenAgent({ certToken: certToken.value })
  const { authTipsInfo } = result.data
  canSelfAuth.value = result.data.canSelfAuth ?? false
  mode.value = result.data.mode

  // 初始化authActionSheet的信息
  beforeAuth.value = authTipsInfo.beforeAuth
  beforeProtocol.value = authTipsInfo.beforeProtocol
  const protocol = authTipsInfo.protocolList[0]
  protocolName.value = protocol.name
  protocolUrl.value = protocol.url
  authActionSheetComponent.value.actionSheetVisible = true
}

// 确认授权 开始人脸识别
const handleConfirm = async () => {
  authActionSheetComponent.value.actionSheetVisible = false

  // 4.活体检测（16，64模式无需走活检流程）
  let verifyResult = ''
  if (![16, 64].includes(Number(mode.value))) {
    if (ISALIPAY) {
      verifyResult = await alipayAuth()
    } else {
      let { userIdKey } = await getUserIdKey({ certToken: certToken.value })
      await checkIsSupportFacialRecognition() // 检测设备是否支持活体检测
      let loginUser = Taro.getStorageSync('loginUser')
      verifyResult = await startFacialRecognitionVerify(
        loginUser.fullName,
        loginUser.idNum,
        userIdKey
      )
    }
  }

  // collectionInfo尝试从storage里面取
  let collectionInfo = await handleCollectInfo()
  // 5.校验活体检测结果
  let result
  if (ISALIPAY) {
    try {
      result = await getCertifyResult({
        ...verifyResult,
        collectionInfo,
        usedAgent: canSelfAuth.value,
        usedMode: mode.value,
        certToken: certToken.value
      })
    } catch ({ data }) {
      // 认证失败
      Taro.navigateTo({
        url: `/pages/authResult/index?mode=${authDetail.value.authMode}&data=${data.resStr}`
      })
      return false
    }
  } else {
    try {
      result = await checkCertCodeAgent({
        collectionInfo,
        usedAgent: canSelfAuth.value,
        usedMode: mode.value,
        wxpvCode: verifyResult,
        certToken: certToken.value
      })
    } catch ({ data }) {
      Taro.navigateTo({
        url: `/pages/authResult/index?mode=${authDetail.value.authMode}&data=${data.resStr}`
      })
      return false
    }
  }
  if (Object.keys(result).length) {
    let { data } = result

    Taro.showToast({
      icon: 'none',
      title: '认证成功',
      mask: true,
      success: () => {
        Taro.removeStorageSync('authDetail')
        Taro.navigateTo({
          url: `/pages/authResult/index?mode=${authDetail.value.authMode}&data=${data.resStr}`
        })
      }
    })
  }
}

useDidShow(() => {
  const router = useRouter()
  authResult.value = Number(router.params.authResult)
  certToken.value = router.params.certToken ?? ''

  authDetail.value = Taro.getStorageSync('authDetail')
})
</script>

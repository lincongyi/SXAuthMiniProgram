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
        <nut-button type="primary" shape="square" block @tap="handleAuth">立即认证</nut-button>
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
import {ref, defineAsyncComponent} from 'vue'
import './index.scss'
import Taro, {useDidShow, useRouter} from '@tarojs/taro'
import {handleCollectInfo} from '@utils/collectInfo'
import {checkCerTokenAgent, commCheckCertCode, getCertifyResult, checkCertCodeAgent} from '@api/auth'
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
const authDetail = ref({}) // 反显用户信息

const canSelfAuth = ref(false) // 是否代他人认证
const mode = ref(0) // 认证模式
const certToken = ref('') // certToken

const beforeAuth = ref('') // 动作面板温馨提示内容
const beforeProtocol = ref('') // 同意协议提示内容
const protocolName = ref('') // 《用户服务协议》
const protocolUrl = ref('') // 《用户服务协议》url
const authActionSheet = defineAsyncComponent(() => import('@components/authActionSheet/index.vue')) // 授权弹窗
const authActionSheetComponent = ref(null)
const ISALIPAY = Taro.getStorageSync('env') === 'ALIPAY'

// 立即认证
const handleAuth = async () => {
  // 1.校验certToken，并返回授权信息（certToken从上一个认证请求的跳过来的url中拿到）
  let result = await checkCerTokenAgent({certToken: certToken.value})
  let {authTipsInfo} = result.data
  canSelfAuth.value = result.data.canSelfAuth ?? false
  mode.value = result.data.mode

  // 初始化authActionSheet的信息
  beforeAuth.value = authTipsInfo.beforeAuth
  beforeProtocol.value = authTipsInfo.beforeProtocol
  let protocol = authTipsInfo.protocolList[0]
  protocolName.value = protocol.name
  protocolUrl.value = protocol.url
  authActionSheetComponent.value.actionSheetVisible = true
}

// 确认授权 开始人脸识别
const handleConfirm = async () => {
  authActionSheetComponent.value.actionSheetVisible = false

  // 4.活体检测（16，64模式无需走活检流程）
  if (![16, 64].includes(Number(mode.value))){
    Taro.setStorageSync('certToken', certToken.value),
    Taro.removeStorageSync('imgBase64') // 跳转前移除缓存图片
    Taro.removeStorageSync('mode') // 跳转前移除mode
    Taro.navigateTo({url: `/pages/webViewDispatch/index?mode=${mode.value}`})
  } else {
    let collectionInfo = await handleCollectInfo()

    let result
    if (ISALIPAY) {
      try {
        result = await getCertifyResult({
          collectionInfo,
          usedAgent: canSelfAuth.value,
          usedMode: mode.value,
          certToken: certToken.value
        })
      } catch ({data}) {
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
          certToken: certToken.value
        })
      } catch ({data}) {
        Taro.navigateTo({
          url: `/pages/authResult/index?mode=${authDetail.value.authMode}&data=${data.resStr}`
        })
        return false
      }
    }
    Taro.showToast({
      icon: 'none',
      title: '认证成功',
      mask: true,
      success: () => {
        Taro.removeStorageSync('authDetail')
        Taro.navigateTo({url: `/pages/authResult/index?mode=${authDetail.value.authMode}&data=${result.data.resStr}`})
      }
    })
  }
}

const ycVertify = async (imgBase64) => {
  let collectionInfo = await handleCollectInfo()

  let verifyResult
  try {
    verifyResult = await commCheckCertCode({
      certToken: Taro.getStorageSync('certToken'),
      collectionInfo,
      usedMode: mode.value,
      portrait: imgBase64
    })
  } catch ({data}) {
    // 认证失败
    Taro.navigateTo({
      url: `/pages/authResult/index?mode=${authDetail.value.authMode}&data=${data.resStr}`
    })
    return false
  } finally {
    Taro.removeStorageSync('certToken') // 移除imgBase64
    Taro.removeStorageSync('imgBase64') // 移除imgBase64
    Taro.removeStorageSync('mode') // 移除mode
  }

  Taro.showToast({
    icon: 'none',
    title: '认证成功',
    mask: true,
    success: () => {
      Taro.removeStorageSync('authDetail')
      Taro.navigateTo({url: `/pages/authResult/index?mode=${authDetail.value.authMode}&data=${verifyResult.data.resStr}`})
    }
  })
}

useDidShow(() => {
  let router = useRouter()
  authResult.value = Number(router.params.authResult)
  certToken.value = router.params.certToken ?? ''

  if (!Taro.getStorageSync('authDetail')) Taro.reLaunch({url: '/pages/index/index'})
  authDetail.value = Taro.getStorageSync('authDetail')

  let imgBase64 = Taro.getStorageSync('imgBase64')
  let mode = Taro.getStorageSync('mode')
  imgBase64 && ycVertify(imgBase64, mode)
})
</script>

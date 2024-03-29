<template>
  <view class="container">
    <nut-cell-group>
      <nut-cell title="注销账号" @tap="deleteAccount">
        <template #link>
          <nut-icon name="arrow-right" size="16"></nut-icon>
        </template>
      </nut-cell>
    </nut-cell-group>
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
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue'
import Taro from '@tarojs/taro'
import './index.scss'
import { handleCollectInfo } from '@utils/collectInfo'
import {
  getCertToken,
  checkCerTokenAgent,
  getUserIdKey,
  getCertifyResult,
  checkCertCodeAgent
} from '@api/auth'
import { logoff } from '@api/login'
import {
  checkIsSupportFacialRecognition,
  startFacialRecognitionVerify
} from '@utils/taro'
import { alipayAuth } from '@utils/alipayAuth'

const canSelfAuth = ref(false) // 是否代他人认证
const certToken = ref('') // certToken

const beforeAuth = ref('') // 动作面板温馨提示内容
const beforeProtocol = ref('') // 同意协议提示内容
const protocolName = ref('') // 《用户服务协议》
const protocolUrl = ref('') // 《用户服务协议》url
const mode = ref(66) // 注销流程66模式实人认证
const authActionSheet = defineAsyncComponent(() =>
  import('@components/authActionSheet/index.vue')
) // 授权弹窗
const authActionSheetComponent = ref(null)
const ISALIPAY = Taro.getStorageSync('env') === 'ALIPAY'

const deleteAccount = () => {
  Taro.showModal({
    title: '温馨提示',
    content:
      '账号注销后个人身份信息将失效，无法继续使用认证业务，是否确定注销账号',
    success: async res => {
      if (res.confirm) {
        // 1.收集信息
        const collectionInfo = await handleCollectInfo(false)
        // 2.获取certToken
        const authType = 'InsideRegular'
        const { tokenInfo } = await getCertToken({ authType, collectionInfo }) // 获取certToken
        certToken.value = tokenInfo.certToken

        // 3.校验certToken，并返回授权信息
        const result = await checkCerTokenAgent({ certToken: certToken.value })
        const { authTipsInfo } = result.data
        canSelfAuth.value = result.data.canSelfAuth ?? false

        // 初始化authActionSheet的信息
        beforeAuth.value = authTipsInfo.beforeAuth
        beforeProtocol.value = authTipsInfo.beforeProtocol
        const protocol = authTipsInfo.protocolList[0]
        protocolName.value = protocol.name
        protocolUrl.value = protocol.url
        authActionSheetComponent.value.actionSheetVisible = true
      }
    }
  })
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
      const { userIdKey } = await getUserIdKey({ certToken: certToken.value })
      await checkIsSupportFacialRecognition() // 检测设备是否支持活体检测
      const loginUser = Taro.getStorageSync('loginUser')
      verifyResult = await startFacialRecognitionVerify(
        loginUser.fullName,
        loginUser.idNum,
        userIdKey
      )
    }
  }

  // collectionInfo尝试从storage里面取
  const collectionInfo = await handleCollectInfo()
  // 5.校验活体检测结果
  if (ISALIPAY) {
    await getCertifyResult({
      ...verifyResult,
      collectionInfo,
      usedAgent: canSelfAuth.value,
      usedMode: mode.value,
      certToken: certToken.value
    })
  } else {
    await checkCertCodeAgent({
      collectionInfo,
      usedAgent: canSelfAuth.value,
      usedMode: mode.value,
      wxpvCode: verifyResult,
      certToken: certToken.value
    })
  }

  let data = {
    certToken: certToken.value
  }
  if (ISALIPAY) {
    data = { ...data, ...verifyResult }
  } else {
    data.wxpvCode = verifyResult
  }
  await logoff(data)
  Taro.removeStorageSync('loginToken') // 注销账户，移除loginToken
  Taro.showToast({
    icon: 'none',
    title: '注销成功',
    mask: true,
    success: () => {
      setTimeout(() => {
        Taro.reLaunch({ url: '/pages/index/index' })
      }, 1000)
    }
  })
}
</script>

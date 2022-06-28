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
    @onConfirm="handleConfirm"
  />
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue'
import Taro from '@tarojs/taro'
import './index.scss'
import { handleCollectInfo } from '@utils/collectInfo'
import { getCertToken, checkCerTokenAgent, getUserIdKey, checkCertCodeAgent } from '@api/auth'
import { logoff } from '@api/login'
import { checkIsSupportFacialRecognition, startFacialRecognitionVerify } from '@utils/taro'

const canSelfAuth = ref(false) // 是否代他人认证
const certToken = ref('') // certToken

const beforeAuth = ref('') // 动作面板温馨提示内容
const beforeProtocol = ref('') // 同意协议提示内容
const protocolName = ref('') // 《用户服务协议》
const protocolUrl = ref('') // 《用户服务协议》url
const authActionSheet = defineAsyncComponent(() => import('@components/authActionSheet/index.vue')) // 授权弹窗
const authActionSheetComponent = ref(null)

const deleteAccount = () => {
  Taro.showModal({
    title: '温馨提示',
    content: '账号注销后个人身份信息将失效，无法继续使用认证业务，是否确定注销账号',
    success: async (res) => {
      if (res.confirm) {
        // 1.收集信息
        let collectionInfo = await handleCollectInfo(false)
        // 2.获取certToken
        let authType='regular'
        let {tokenInfo} = await getCertToken({authType, collectionInfo}) // 获取certToken
        certToken.value = tokenInfo.certToken

        // 3.校验certToken，并返回授权信息
        let result = await checkCerTokenAgent({certToken: certToken.value})
        let {authTipsInfo, authUser} = result.data
        canSelfAuth.value = result.data.canSelfAuth ?? false

        // 初始化authActionSheet的信息
        beforeAuth.value = authTipsInfo.beforeAuth
        beforeProtocol.value = authTipsInfo.beforeProtocol
        let protocol = authTipsInfo.protocolList[0]
        protocolName.value = protocol.name
        protocolUrl.value = protocol.url
        authActionSheetComponent.value.actionSheetVisible = true
      }
    }
  })
}

// 确认授权 开始人脸识别
const handleConfirm = async () => {
  let {userIdKey} = await getUserIdKey({certToken: certToken.value})
  authActionSheetComponent.value.actionSheetVisible = false
  await checkIsSupportFacialRecognition() // 检测设备是否支持活体检测

  // 4.活体检测
  let loginUser = Taro.getStorageSync('loginUser')
  let verifyResult = await startFacialRecognitionVerify(loginUser.fullName, loginUser.idNum, userIdKey)

  // collectionInfo尝试从storage里面取
  let collectionInfo = await handleCollectInfo()
  // 5.校验活体检测结果
  await checkCertCodeAgent({
    collectionInfo,
    usedAgent: canSelfAuth.value,
    wxpvCode: verifyResult,
    certToken: certToken.value,
    usedMode: 66, // 注销流程66模式实人认证
  })

  await logoff({
    certToken: certToken.value,
    wxpvCode: verifyResult
  }).then(() => {
    Taro.removeStorageSync('loginToken') // 注销账户，移除loginToken
  })
  Taro.showToast({
    icon: 'none',
    title: '注销成功',
    mask: true,
    success: () => {
      setTimeout(() => {
        Taro.switchTab({url: '/pages/index/index'})
      }, 1500)
    }
  })
}
</script>

<template>
  <view class="container">
    <view class="content">
      <view class="top-box">
        <image class="logo" mode="widthFix" :src="loginImage" />
        <view class="title">陕西公民实人认证</view>
      </view>
      <!-- 用户信息录入 start -->
      <view class="form-group">
        <nut-input v-model="type" label="证件类型" readonly />
        <nut-input
          v-model="userInfo.fullName"
          label="姓名"
          placeholder="请输入姓名"
          :readonly="!canUserInfoEdit"
          required
          maxlength="20"
        />
        <nut-input
          v-model="userInfo.idNum"
          label="证件号码"
          placeholder="请输入证件号码"
          :readonly="!canUserInfoEdit"
          required
          maxlength="18"
        />
        <block v-if="[16, 18].includes(mode)">
          <block v-if="canValidityEdit">
            <picker
              mode="date"
              :value="userInfo.idStartDate"
              :end="dateTime"
              @change="onStartDateChange"
            >
              <nut-input
                v-model="userInfo.idStartDate"
                label="起始日期"
                readonly
                required
                maxlength="10"
              />
            </picker>
            <picker
              mode="date"
              :value="userInfo.idEndDate"
              :start="dateTime"
              @change="onEndDateChange"
            >
              <nut-input
                v-model="userInfo.idEndDate"
                label="截止日期"
                readonly
                required
                maxlength="10"
              />
            </picker>
          </block>
          <block v-else>
            <nut-input
              v-model="userInfo.idStartDate"
              label="起始日期"
              readonly
              required
              maxlength="10"
            />
            <nut-input
              v-model="userInfo.idEndDate"
              label="截止日期"
              readonly
              required
              maxlength="10"
            />
          </block>
        </block>
      </view>
      <!-- 用户信息录入 end -->
    </view>

    <view class="btn-warp" v-if="isBtnShow">
      <nut-button
        type="primary"
        shape="square"
        block
        :class="{ disabled: btnDisabled }"
        @tap="validateUserInfo"
        >下一步</nut-button
      >
      <block v-if="ISALIPAY">
        <button
          class="get-phone-number-btn"
          open-type="getAuthorize"
          @getauthorize="getPhoneNumber"
          @error="onGetPhoneNumberError"
          scope="phoneNumber"
          v-show="!btnDisabled"
        ></button>
      </block>
      <block v-else>
        <button
          class="get-phone-number-btn"
          open-type="getPhoneNumber"
          @getphonenumber="getPhoneNumber"
          v-show="!btnDisabled"
        ></button>
      </block>
    </view>

    <view class="tips-textarea">
      <view class="normal">未注册用户登录时将完成注册，登录即代表</view>
      <view class="normal">
        您已同意
        <view class="emphasize" @tap="toProtocol">《用户服务协议》</view>
      </view>
    </view>
  </view>

  <authActionSheet
    ref="authActionSheetComponent"
    :beforeAuth="beforeAuth"
    :beforeProtocol="beforeProtocol"
    :protocolName="protocolName"
    :protocolUrl="protocolUrl"
    :mode="mode"
    :foreBackUrl="foreBackUrl"
    @onConfirm="handleConfirm"
  />

  <!-- Copyright -->
  <copyright />
</template>
<script setup>
import { ref, reactive, toRaw, computed, defineAsyncComponent } from 'vue'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import loginImage from '@images/logo.png'
import './index.scss'
import { handleCollectInfo } from '@utils/collectInfo'
import {
  getCertToken,
  checkCerTokenAgent,
  getUserIdKey,
  checkCertCodeAgent,
  getCertifyResult,
  getUserPhoneNum
} from '@api/auth'
import { register, checkReg } from '@api/login'
import {
  checkIsSupportFacialRecognition,
  startFacialRecognitionVerify,
  alipayGetPhoneNumber
} from '@utils/taro'
import { isLogin, idcardRex } from '@utils/index'
import { alipayAuth } from '@utils/alipayAuth'
import { BASE_URL } from '@utils/request'
import { formatDate } from '@utils/index'

/**
 * 初始化日期选择器，以今天作为默认值
 */
const dateTime = formatDate(Date.now()).replace(/\./g, '/')
/**
 * 选择证件起始时间
 */
const onStartDateChange = e => {
  userInfo.idStartDate = e.detail.value.replace(/\/|-/g, '')
}
/**
 * 选择证件截止时间
 */
const onEndDateChange = e => {
  userInfo.idEndDate = e.detail.value.replace(/\/|-/g, '')
}
/**
 * 返回h5页面地址
 */
const backToH5Url = `${BASE_URL}/sxauthalipay/toMiniProgram.html`

/**
 * 0-小程序内部运行；1-第三方小程序跳转；2-h5跳转
 */
const loginType = Taro.getStorageSync('loginType') || 0

const type = '第二代居民身份证' // 证件类型
/**
 * 认证模式
 */
const mode = ref(66)
/**
 * 用户录入信息
 */
const userInfo = reactive({
  idNum: '',
  fullName: '',
  idStartDate: '',
  idEndDate: ''
})
/**
 * 当前是否[切换用户]流程
 */
let isSwitch = 0
/**
 * 当前是否[注册]流程
 */
let isRegister = 0
const canUserInfoEdit = ref(true) // 是否允许用户录入姓名，证件号码
const canValidityEdit = ref(true) // 是否允许用户录入证件有效期
const isBtnShow = ref(true) // 控制[下一步]按钮显示隐藏，[下一步]按钮主要用于获取用户手机号码
// 控制[下一步]按钮样式
const btnDisabled = computed(() => {
  if ([16, 18].includes(mode.value)) {
    return (
      !userInfo.fullName ||
      !userInfo.idNum ||
      !userInfo.idStartDate ||
      !userInfo.idEndDate
    )
  } else {
    return !userInfo.fullName || !userInfo.idNum
  }
})

const phoneNum = ref('') // 用户手机号码

const canSelfAuth = ref('') // 是否代他人认证
let certToken = '' // certToken

const beforeAuth = ref('') // 动作面板温馨提示内容
const beforeProtocol = ref('') // 同意协议提示内容
const protocolName = ref('') // 用户服务协议
const protocolUrl = ref('') // 用户服务协议url
/**
 * 授权弹窗
 */
const authActionSheet = defineAsyncComponent(() =>
  import('@components/authActionSheet/index.vue')
)
const authActionSheetComponent = ref(null)

const ISALIPAY = Taro.getStorageSync('env') === 'ALIPAY'
/**
 * 第三方h5地址
 */
const foreBackUrl = ref('')

/**
 * 查看用户服务协议
 */
const toProtocol = () => {
  const url = `${BASE_URL}/shanxiauthagreement/sxauthuseragreement.html`
  Taro.navigateTo({ url: `/pages/webView/index?url=${url}` })
}

/**
 * 校验用户信息
 */
const validateUserInfo = () => {
  const { fullName, idNum } = toRaw(userInfo)
  if (!fullName) {
    return Taro.showToast({
      icon: 'none',
      title: '请输入姓名'
    })
  } else if (!idNum) {
    return Taro.showToast({
      icon: 'none',
      title: '请输入证件号码'
    })
  } else if (!idNum.includes('*') && !idcardRex.test(idNum)) {
    return Taro.showToast({
      icon: 'none',
      title: '身份号码格式有误'
    })
  }

  if ([16, 18].includes(mode.value)) {
    const { idStartDate, idEndDate } = toRaw(userInfo)
    if (!idStartDate) {
      return Taro.showToast({
        icon: 'none',
        title: '请选择起始日期'
      })
    } else if (!idEndDate) {
      return Taro.showToast({
        icon: 'none',
        title: '请选择截止日期'
      })
    }
  }
}

// 下一步（先获取手机号码，再走流程）
const getPhoneNumber = async event => {
  // 切换账号的话，优先判断切换的账号是否为当前账号（自己无法切换自己）
  if (isSwitch) {
    try {
      await checkReg({ idNum: userInfo.idNum })
    } catch {
      return false
    }
  }

  // 获取手机号码
  let jsCode
  if (ISALIPAY) {
    jsCode = await alipayGetPhoneNumber()
  } else {
    if (event.detail.errMsg.indexOf('getPhoneNumber:ok') === -1) {
      return Taro.showModal({
        title: '温馨提示',
        content: '获取手机号失败，请重试',
        showCancel: false
      })
    }
    jsCode = event.detail.code
  }

  const { userData } = await getUserPhoneNum({ jsCode })
  phoneNum.value = userData.phoneNum
  handleSubmit()
}

/**
 * 小程序api获取手机号失败回调
 */
const onGetPhoneNumberError = e => {
  if (e.detail.errorMessage === '用户取消授权') {
    Taro.showModal({
      title: '温馨提示',
      content: '根据公安部门规定，实人认证需报备用户联系方式，以便后续业务办理',
      showCancel: false,
      success: () => {
        Taro.navigateBack({ delta: 1 })
      }
    })
  }
}

// 获取手机号码后，正式执行下一步流程
const handleSubmit = async () => {
  // 调起人脸认证前的校验流程
  if (!certToken) {
    //  1.收集信息
    const collectionInfo = await handleCollectInfo()

    // 2.获取certToken
    const authType = 'InsideRegular'
    const { tokenInfo } = await getCertToken({
      mode: mode.value,
      authType,
      collectionInfo,
      idInfo: toRaw(userInfo)
    }) // 获取certToken
    certToken = tokenInfo.certToken
    Taro.setStorageSync('certToken', certToken)

    // 3.校验certToken，并返回授权信息
    await handleCheckCertToken()
  }
  authActionSheetComponent.value.actionSheetVisible = true
}

/**
 * 校验certToken
 */
const handleCheckCertToken = async () => {
  let result
  try {
    result = await checkCerTokenAgent({ certToken })
  } catch (data) {
    if (loginType === 1) {
      const { retCode, retMessage } = data
      setTimeout(() => {
        return Taro.navigateBackMiniProgram({
          extraData: {
            mode: mode.value,
            retCode,
            retMessage
          }
        })
      }, 500)
    } else if (loginType === 2) {
      // 第三方h5跳转，如果返回foreBackUrl，直接跳转到页面地址
      if (data?.data?.foreBackUrl) {
        return Taro.ap.navigateToAlipayPage({
          path: `${backToH5Url}?mode=${mode.value}&foreBackUrl=${data.data.foreBackUrl}`
        })
      }
      // token已经过期 或者 token已完成认证，重定向到到认证结果页面
      if ([4026, 4030].includes(data.retCode)) {
        const authStr = '22XX'
        Taro.setStorageSync('authStr', authStr)
        return Taro.navigateTo({
          url: `/pages/authResult/index?mode=${mode.value}&data=${authStr}`
        })
      }
    } else {
      // token已经过期 或者 token已完成认证，重定向到到认证结果页面
      if ([4026, 4030].includes(data.retCode)) {
        const authStr = '22XX'
        Taro.setStorageSync('authStr', authStr)
        return Taro.navigateTo({
          url: `/pages/authResult/index?mode=${mode.value}&data=${authStr}`
        })
      }
      Taro.removeStorageSync('certToken')
      handleSubmit()
      return false
    }
  }
  const { authTipsInfo, authUser } = result.data
  foreBackUrl.value = result.data.foreBackUrl ?? ''
  canSelfAuth.value = result.data.canSelfAuth ?? false
  mode.value = result.data.mode

  // 反显用户信息
  for (let key in authUser) {
    userInfo[key] = authUser[key]
  }
  // 如果不存在已录入的个人信息，就设置输入框可编辑
  if (userInfo.fullName && userInfo.idNum) canUserInfoEdit.value = false
  if (userInfo.idStartDate && userInfo.idEndDate) canValidityEdit.value = false

  // 如果第三方跳转过来的用户，有之前注册登录信息，则隐藏下一步按钮并直接显示授权弹窗
  if (!btnDisabled.value && loginType && Taro.getStorageSync('loginToken')) {
    isBtnShow.value = false
    authActionSheetComponent.value.actionSheetVisible = true
  }

  // 初始化authActionSheet的信息
  beforeAuth.value = authTipsInfo.beforeAuth
  beforeProtocol.value = authTipsInfo.beforeProtocol
  const protocol = authTipsInfo.protocolList[0]
  protocolName.value = protocol.name
  protocolUrl.value = protocol.url
}

// 确认授权 开始人脸识别
const handleConfirm = async () => {
  authActionSheetComponent.value.actionSheetVisible = false

  // 4.活体检测（16，64模式无需走活检流程）
  let verifyResult
  if (![16, 64].includes(Number(mode.value))) {
    if (ISALIPAY) {
      try {
        verifyResult = await alipayAuth()
      } catch (error) {
        authActionSheetComponent.value.actionSheetVisible = true
        return false
      }
    } else {
      const { userIdKey } = await getUserIdKey({
        ...toRaw(userInfo),
        certToken
      })
      await checkIsSupportFacialRecognition() // 检测设备是否支持活体检测
      try {
        verifyResult = await startFacialRecognitionVerify(
          userInfo.fullName,
          userInfo.idNum,
          userIdKey
        )
      } catch (error) {
        authActionSheetComponent.value.actionSheetVisible = true
        return false
      }
    }
  }

  // 收集信息
  const collectionInfo = await handleCollectInfo()
  // 5.校验活体检测结果
  // 认证失败回调方法
  const handleFailCallback = ({ data, retCode, retMessage }) => {
    Taro.removeStorageSync('certToken') // 移除certToken，否则下次认证会重复使用之前的certToken
    if (loginType === 0) {
      // 小程序注册or切换账号认证失败，清空certToken，重新申请certToken
      if (isRegister || isSwitch) {
        certToken = ''
        return false
      }
      // 小程序扫码认证失败，重定向到到认证结果页面
      const { resStr } = data
      Taro.setStorageSync('authStr', resStr)
      return Taro.navigateTo({
        url: `/pages/authResult/index?mode=${mode.value}&data=${resStr}`
      })
    } else if (loginType === 1) {
      // 返回第三方小程序
      return Taro.navigateBackMiniProgram({
        extraData: {
          mode: mode.value,
          retCode,
          retMessage
        }
      })
    } else if (loginType === 2) {
      // 返回认证结果h5页面
      const { resStr, foreBackUrl } = data
      Taro.setStorageSync('authStr', resStr) // 标识之前已经走过认证流程，避免返回重新认证使用同一个certToken
      if (foreBackUrl) {
        return Taro.ap.navigateToAlipayPage({
          path: `${backToH5Url}?mode=${mode.value}&resStr=${resStr}&foreBackUrl=${data.foreBackUrl}`
        })
      } else {
        return Taro.navigateTo({
          url: `/pages/authResult/index?mode=${mode.value}&data=${resStr}`
        })
      }
    }
  }
  let result
  if (ISALIPAY) {
    try {
      result = await getCertifyResult({
        ...verifyResult,
        collectionInfo,
        usedAgent: canSelfAuth.value,
        usedMode: mode.value,
        certToken,
        idInfo: toRaw(userInfo)
      })
    } catch (error) {
      handleFailCallback(error)
      return false
    }
  } else {
    try {
      result = await checkCertCodeAgent({
        collectionInfo,
        usedAgent: canSelfAuth.value,
        usedMode: mode.value,
        wxpvCode: verifyResult,
        certToken,
        idInfo: toRaw(userInfo)
      })
    } catch (error) {
      handleFailCallback(error)
      return false
    }
  }

  // 认证成功
  Taro.removeStorageSync('certToken') // 移除certToken，否则下次认证会重复使用之前的certToken
  // 不存在loginToken或者切换用户，走注册功能
  if (!Taro.getStorageSync('loginToken') || isSwitch) {
    let data = {
      phoneNum: phoneNum.value,
      regMode: 'id',
      certToken,
      loginType
    }
    if (ISALIPAY) {
      data = { ...data, ...verifyResult }
      data.aesUserId = Taro.getStorageSync('aesUserId')
    } else {
      data.wxpvCode = verifyResult
      data.aesUnionId = Taro.getStorageSync('aesUnionId')
    }

    const { loginToken, loginUser } = await register(data)
    // 小程序内部运行
    if (!loginType) {
      return Taro.showModal({
        title: '注册成功',
        content: `您的账号已绑定${
          ISALIPAY ? '支付宝' : '微信'
        }，下次可直接使用${ISALIPAY ? '支付宝' : '微信'}授权快捷登录`,
        showCancel: false,
        success: () => {
          Taro.setStorageSync('loginToken', loginToken)
          Taro.setStorageSync('loginUser', loginUser)
          // 跳转到首页
          Taro.reLaunch({ url: '/pages/index/index' })
        }
      })
    }
  }

  // 小程序内部运行，扫码认证功能，返回认证结果页面
  if (!loginType) {
    const { resStr } = result.data
    return Taro.navigateTo({
      url: `/pages/authResult/index?mode=${mode.value}&data=${resStr}`
    })
  } else {
    // 第三方跳转
    if (loginType === 1) {
      // 返回第三方小程序
      return Taro.reLaunch({
        url: '/pages/index/index',
        success: () => {
          Taro.navigateBackMiniProgram({
            extraData: {
              mode: mode.value,
              retCode: result.retCode,
              retMessage: result.retMessage
            }
          })
        }
      })
    } else {
      // 返回认证结果h5页面
      const { resStr } = result.data
      Taro.setStorageSync('authStr', resStr) // 标识之前已经走过认证流程，避免返回重新认证使用同一个certToken
      Taro.ap.navigateToAlipayPage({
        path: `${backToH5Url}?mode=${mode.value}&resStr=${resStr}&foreBackUrl=${result.data.foreBackUrl}`
      })
    }
  }
}
useDidShow(async () => {
  /**
   * 获取认证结果
   */
  const authStr = Taro.getStorageSync('authStr') || ''
  // 已经有认证结果的情况下（例如认证后的h5页面返回小程序），重定向到结果页面
  if (authStr) {
    // 重定向到认证结果页面
    if ([0, 2].includes(loginType)) {
      return Taro.navigateTo({
        url: `/pages/authResult/index?mode=${mode.value}&data=${authStr}`
      })
    }
  }
  // 不能直接赋值certToken。为了兼容实人认证后，会再次运行useDidShow的生命周期
  if (!certToken) {
    const router = useRouter()
    // 针对切换用户的情况
    if (router.params.isSwitch) {
      isSwitch = Number(router.params.isSwitch)
      Taro.setNavigationBarTitle({ title: '登录' })
      return
    }
    // 单纯的注册流程，无需判断登录状态和校验certToken
    if (router.params.isRegister) {
      isRegister = router.params.isRegister
      Taro.setNavigationBarTitle({ title: '注册' })
      return
    }

    await isLogin()
    // 获取certToken
    certToken = Taro.getStorageSync('certToken') || ''
    await handleCheckCertToken()
  }
})
</script>

<template>
  <nut-actionsheet
    title="认证授权"
    v-model:visible="actionSheetVisible"
    @close="onClose"
  >
    <view class="action-sheet-content">
      <view class="html-parse" v-html="beforeAuth"></view>

      <block v-if="![16,64].includes(Number(mode))">
        <view class="tips">本次认证需要通过人脸识别验证身份信息</view>
      </block>

      <view class="agreement"></view>

      <view class="agreement-protocol">
        <nut-checkbox v-model="isChecked" class="checkbox" icon-name="" icon-active-name="checklist">
          <text v-html="beforeProtocol"></text>
          <text>查看</text>
          <text v-html="protocolName" class="protocol-link" @tap="toProtocol(protocolUrl)"></text>
        </nut-checkbox>
      </view>

      <nut-button type="primary" shape="square" block @tap="onConfirm">确认授权</nut-button>
    </view>
  </nut-actionsheet>

</template>
<script setup>
import {ref} from 'vue'
import Taro from '@tarojs/taro'
import './index.scss'
import {BASE_URL} from '@utils/request'
/**
  * 返回h5页面地址
 */
const backToH5Url = `${BASE_URL}/sxauthalipay/toMiniProgram.html`

const props = defineProps({
  beforeAuth: {
    type: String,
    default: ''
  },
  beforeProtocol: {
    type: String,
    default: ''
  },
  protocolName: {
    type: String,
    default: ''
  },
  protocolUrl: {
    type: String,
    default: ''
  },
  mode: {
    type: [Number, String],
    default: 0
  },
  foreBackUrl: {
    type: String,
    default: ''
  }
})
const actionSheetVisible = ref(false) // 控制动作面板显示隐藏
defineExpose({
  actionSheetVisible
})
const isChecked = ref(false)
// 查看用户服务协议
const toProtocol = (url) => {
  Taro.navigateTo({url: `/pages/webView/index?url=${url}`})
}
// 取消授权
const onClose = () => {
  isChecked.value = false
  Taro.showModal({
    title: '温馨提示',
    content: '是否确认取消授权',
    success: ({confirm}) => {
      if (confirm) {
        Taro.removeStorageSync('certToken')
        let loginType = Taro.getStorageSync('loginType') ?? 0
        if (loginType === 1) {
          Taro.navigateBackMiniProgram({
            extraData: {
              mode: props.mode,
              retCode: 5204,
              retMessage: '用户取消认证'
            }
          })
        } else if (loginType === 2 && props.foreBackUrl) {
          Taro.ap.navigateToAlipayPage({
            path: `${backToH5Url}?mode=${props.mode}&foreBackUrl=${props.foreBackUrl}`
          })
        }
      } else {
        actionSheetVisible.value = true
      }
    }
  })
}
const emits = defineEmits(['onConfirm'])
// 确认授权
const onConfirm = () => {
  if (!isChecked.value){
    return Taro.showToast({
      icon: 'none',
      title: '请同意服务协议',
    })
  }
  isChecked.value = false
  emits('onConfirm')
}
</script>
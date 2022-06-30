<template>
  <nut-actionsheet
    title="温馨提示"
    v-model:visible="actionSheetVisible"
    @close="onClose"
  >
    <view class="action-sheet-content">
      <view class="html-parse" v-html="beforeAuth"></view>
      <view class="tips">本次认证需要通过人脸识别验证身份信息</view>
      <view class="agreement"></view>

      <view class="agreement-protocol">
        <nut-checkbox v-model="isChecked" class="checkbox" icon-name="" icon-active-name="checklist">
          <text v-html="beforeProtocol"></text>
        </nut-checkbox>
      </view>

      <view class="protocol">
        <text>查看</text>
        <text v-html="protocolName" class="protocol-link" @tap="toProtocol(protocolUrl)"></text>
      </view>

      <nut-button type="primary" shape="square" block @tap="onConfirm">确认授权</nut-button>
    </view>
  </nut-actionsheet>

</template>
<script setup>
import {ref} from 'vue'
import Taro from '@tarojs/taro'
import './index.scss'
defineProps({
  beforeAuth: {
    type: String,
    value: ''
  },
  beforeProtocol: {
    type: String,
    value: ''
  },
  protocolName: {
    type: String,
    value: ''
  },
  protocolUrl: {
    type: String,
    value: ''
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
      if (confirm){
        let loginType = Taro.getStorageSync('loginType') ?? 0
        if (loginType) Taro.navigateBackMiniProgram({extraData: {}})
        else Taro.switchTab({url: '/pages/index/index'})
      } else {
        actionSheetVisible.value = true
      }
    }
  })
}
// 确认授权
const emits = defineEmits(['onConfirm'])
const onConfirm = () => {
  if (!isChecked.value){
    return Taro.showToast({
      icon: 'none',
      title: '请同意服务协议',
    })
  }
  emits('onConfirm')
}
</script>
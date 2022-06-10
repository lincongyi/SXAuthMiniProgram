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
</template>

<script setup>
import Taro from '@tarojs/taro'
import './index.scss'

const deleteAccount = () => {
  Taro.showModal({
    title: '温馨提示',
    content: '账号注销后个人身份信息将失效，无法继续使用认证业务，是否确定注销账号',
    success: (res) => {
      if (res.confirm) {
        Taro.showToast({
          title: '注销成功',
          mask: true,
          success: () => {
            setTimeout(() => {
              Taro.navigateTo({
                url: '/pages/index/index'
              })
            }, 1500)
          }
        })
      }
    }
  })
}
</script>

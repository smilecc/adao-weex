<template>
  <scroller>
    <wxc-cell 
      :has-top-border="true"
      :has-bottom-border="false"
      title="AC匿名版"
      desc="人是会思考的芦苇"
    >
      <slot name="value">
        <text style="color: #999">v1.0.beta</text>
      </slot>
    </wxc-cell>

    <div style="margin-top: 20px;">
      <wxc-cell title="饼干管理" :has-arrow="true" :has-vertical-indent="false" :cell-style="cellStyle" @wxcCellClicked="openPage('cookie')">
        <image class="cell-icon" slot="label" src="bmlocal://assets/cookie@2x.png"></image>
      </wxc-cell>
      <wxc-cell v-if="false" title="收藏管理" :has-arrow="true" :has-vertical-indent="false" :cell-style="cellStyle"></wxc-cell>
      <wxc-cell title="设置" :has-arrow="true" :has-vertical-indent="false" :cell-style="cellStyle" @wxcCellClicked="openPage('setting')">
        <image class="cell-icon" slot="label" src="bmlocal://assets/setting@2x.png"></image>
      </wxc-cell>
      <wxc-cell title="关于" :has-arrow="true" :has-vertical-indent="false" :cell-style="cellStyle" @wxcCellClicked="openPage('about')">
        <image class="cell-icon" slot="label" src="bmlocal://assets/about@2x.png"></image>
      </wxc-cell>
    </div>
  </scroller>
</template>

<script>
import { WxcCell } from 'weex-ui'
const domModule = weex.requireModule('dom')
export default {
  components: {
    WxcCell
  },
  beforeCreate () {
    domModule.addRule('fontFace', {
      'fontFamily': 'iconfont',
      'src': 'url(\'bmlocal://iconfont/font_adao_1.woff\')'
    })
  },
  data () {
    return {
      cellStyle: {
        'padding': '23px'
      }
    }
  },
  methods: {
    openPage (page) {
      this.$router.open({
        name: 'personal.' + page,
        type: 'PUSH'
      })
    }
  }
}
</script>

<style>
.cell-title {
  font-family: iconfont;
}
.cell-icon {
  width: 55px;
  height: 55px;
  margin-right: 20px;
}
</style>

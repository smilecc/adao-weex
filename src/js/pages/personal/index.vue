<template>
  <scroller>
    <wxc-cell 
      :has-top-border="true"
      :has-bottom-border="false"
      title="AC匿名版"
      desc="人是会思考的芦苇"
    >
      <slot name="value">
        <text style="color: #999">v1.0.beta.8</text>
      </slot>
    </wxc-cell>

    <div style="margin-top: 20px;">
      <wxc-cell title="饼干" :has-arrow="true" :has-vertical-indent="false" :cell-style="cellStyle" @wxcCellClicked="openPage('cookie')">
        <image class="cell-icon" slot="label" src="bmlocal://assets/cookie@2x.png"></image>
      </wxc-cell>
      <wxc-cell title="收藏" :has-arrow="true" :has-vertical-indent="false" :cell-style="cellStyle" @wxcCellClicked="openPage('favorite.folder', false)">
        <image class="cell-icon" slot="label" src="bmlocal://assets/favorite@2x.png"></image>
      </wxc-cell>
      <wxc-cell title="历史" :has-arrow="true" :has-vertical-indent="false" :cell-style="cellStyle" @wxcCellClicked="openPage('history')">
        <image class="cell-icon" slot="label" src="bmlocal://assets/history@2x.png"></image>
      </wxc-cell>
      <wxc-cell title="草稿" :has-arrow="true" :has-vertical-indent="false" :cell-style="cellStyle" @wxcCellClicked="openPage('drafts')">
        <image class="cell-icon" slot="label" src="bmlocal://assets/drafts@2x.png"></image>
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
    openPage (page, gesBack = true) {
      this.$router.open({
        name: 'personal.' + page,
        type: 'PUSH',
        gesBack
      })
    },
    openPageWithoutNavbar (page, gesBack = true) {
      this.$router.open({
        name: 'personal.' + page,
        type: 'PUSH',
        navShow: false,
        navTitle: '',
        gesBack
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

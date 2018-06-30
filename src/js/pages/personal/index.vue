<template>
  <scroller :class="$class('page')">
    <wxc-cell 
      :has-top-border="false"
      :has-bottom-border="false"
      class="border-top"
      title="AC匿名版"
      desc="人是会思考的芦苇"
      :cell-style="cellStyle"
    >
      <div slot="title">
        <text :class="$class('cell-content')">AC匿名版</text>
        <text :class="$class('cell-desc-text')">人是会思考的芦苇</text>
      </div>
      <slot name="value">
        <text :class="$class('version')">v1.0.beta.9</text>
      </slot>
    </wxc-cell>

    <div style="margin-top: 20px;">
      <wxc-cell :has-arrow="true" :has-vertical-indent="false" :cell-style="cellStyle" @wxcCellClicked="openPage('cookie')" class="border-top border-bottom" :has-bottom-border="false">
        <text slot="title" :class="$class('cell-content')">饼干</text>
        <image class="cell-icon" slot="label" src="bmlocal://assets/cookie@2x.png"></image>
      </wxc-cell>
      <wxc-cell :has-arrow="true" :has-vertical-indent="false" :cell-style="cellStyle" @wxcCellClicked="openPage('favorite.folder', false)" class="border-bottom" :has-bottom-border="false">
        <text slot="title" :class="$class('cell-content')">收藏</text>
        <image class="cell-icon" slot="label" src="bmlocal://assets/favorite@2x.png"></image>
      </wxc-cell>
      <wxc-cell :has-arrow="true" :has-vertical-indent="false" :cell-style="cellStyle" @wxcCellClicked="openPage('history')" class="border-bottom" :has-bottom-border="false">
        <text slot="title" :class="$class('cell-content')">历史</text>
        <image class="cell-icon" slot="label" src="bmlocal://assets/history@2x.png"></image>
      </wxc-cell>
      <wxc-cell :has-arrow="true" :has-vertical-indent="false" :cell-style="cellStyle" @wxcCellClicked="openPage('drafts')" class="border-bottom" :has-bottom-border="false">
        <text slot="title" :class="$class('cell-content')">草稿</text>
        <image class="cell-icon" slot="label" src="bmlocal://assets/drafts@2x.png"></image>
      </wxc-cell>
      <wxc-cell :has-arrow="true" :has-vertical-indent="false" :cell-style="cellStyle" @wxcCellClicked="openPage('setting')" class="border-bottom" :has-bottom-border="false">
        <text slot="title" :class="$class('cell-content')">设置</text>
        <image class="cell-icon" slot="label" src="bmlocal://assets/setting@2x.png"></image>
      </wxc-cell>
      <wxc-cell :has-arrow="true" :has-vertical-indent="false" :cell-style="cellStyle" @wxcCellClicked="openPage('about')" class="border-bottom" :has-bottom-border="false">
        <text slot="title" :class="$class('cell-content')">关于</text>
        <image class="cell-icon" slot="label" src="bmlocal://assets/about@2x.png"></image>
      </wxc-cell>
    </div>
    <div style="margin-top: 20px;">
      <wxc-cell :has-vertical-indent="false" class="border-top border-bottom" :cell-style="cellStyle" :has-top-border="false" :has-bottom-border="false">
        <text :class="$class('cell-content')" slot="title">夜间模式</text>
        <switch :checked="appConfig.night" slot="value" @change="switchNight">
        </switch>
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
      listenConfig: true
    }
  },
  methods: {
    openPage (page, gesBack = true) {
      this.$router.open({
        name: 'personal.' + page,
        type: 'PUSH',
        backgroundColor: this.appConfig.night ? '#333' : '',
        gesBack
      })
    },
    openPageWithoutNavbar (page, gesBack = true) {
      this.$router.open({
        name: 'personal.' + page,
        type: 'PUSH',
        navShow: false,
        navTitle: '',
        backgroundColor: this.appConfig.night ? '#333' : '',
        gesBack
      })
    },
    switchNight (event) {
      let config = this.appConfig
      config.night = event.value
      this.$site.config = config
      this.$event.emit('reloadConfig', config)
    }
  },
  computed: {
    cellStyle () {
      if (this.appConfig.night) {
        return {
          'padding': '23px',
          backgroundColor: '#444',
          borderColor: '#666'
        }
      } else {
        return {
          'padding': '23px',
          backgroundColor: '#fff',
          borderColor: '#e2e2e2'
        }
      }
    }
  },
  eros: {
    beforeBackAppear () {
      this.__initConfig(this.appConfig)
    }
  }
}
</script>

<style>
.page {
  border-top-style: solid;
  border-top-color: #dfdfdf;
  border-top-width: 1px;
}
.page-night {
  border-top-color: #222;
  background-color: #333;
}
.version {
  color: #999;
}
.version-night {
  color: #eee;
}
.cell-title {
  font-family: iconfont;
}
.cell-icon {
  width: 55px;
  height: 55px;
  margin-right: 20px;
}
.cell-content {
  color: #333333;
  font-size: 30px;
  line-height: 40px;
}
.cell-content-night {
  color: #fff;
}

.cell-desc-text {
  color: #999999;
  font-size: 24px;
  line-height: 30px;
  margin-top: 4px;
  margin-right: 30px;
}
.cell-desc-text-night {
  color: #aaa;
}

.border-top {
  border-top-width: 1px;
}
.border-bottom {
  border-bottom-width: 1px;
}
</style>

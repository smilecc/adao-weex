<template>
  <scroller :class="$class('page')">
    <div style="margin: 20px; margin-bottom: 10px">
      <text :class="$class('group-title')">软件设置</text>
    </div>
    <wxc-cell class="border-top border-bottom" :cell-style="cellStyle" :has-top-border="false" :has-bottom-border="false">
      <text :class="$class('cell-content')" slot="title">显示图片</text>
      <switch :checked="$site.config.displayImage" slot="value" @change="displayImage">
      </switch>
    </wxc-cell>
    <wxc-cell class="border-bottom" :cell-style="cellStyle" :has-top-border="false" :has-bottom-border="false">
      <div slot="title">
        <text :class="$class('cell-content')">显示回复</text>
        <text :class="$class('cell-desc-text')">控制版块详情中显示对该串的回复</text>
      </div>
      <switch :checked="$site.config.displayReply" slot="value" @change="displayReply">
      </switch>
    </wxc-cell>

    <wxc-cell :has-arrow="true" :cell-style="cellStyle" @wxcCellClicked="pickFontSize" class="border-bottom" :has-bottom-border="false">
      <text slot="title" :class="$class('cell-content')">字体偏好</text>
      <text slot="value" :class="$class('cell-content')">{{ currentFontSize }}</text>
    </wxc-cell>

    <div style="margin: 20px; margin-bottom: 10px" v-if="false">
      <text :class="$class('group-title')">站点选择</text>
    </div>
    <wxc-radio v-if="false" :config="cellStyle" :list="siteList" @wxcRadioListChecked="changeSite"></wxc-radio>
  </scroller>
</template>

<script>
import { WxcCell, WxcRadio } from 'weex-ui'
const picker = weex.requireModule('picker')
export default {
  components: {
    WxcCell,
    WxcRadio
  },
  data () {
    return {
      listenConfig: true,
      siteList: [
        // {
        //   title: '主站',
        //   value: 'adnmb',
        //   checked: false
        // },
        {
          title: '备胎岛',
          value: 'tnmb',
          checked: false
        }
      ]
    }
  },
  created () {
    // 设置当前的站点
    for (let site of this.siteList) {
      if (site.value === this.$site.currentSite.name) {
        site.checked = true
      }
    }
  },
  methods: {
    displayImage (event) {
      let config = this.$site.config
      config.displayImage = event.value
      this.setConfig(config)
    },
    displayReply (event) {
      let config = this.$site.config
      config.displayReply = event.value
      this.setConfig(config)
    },
    changeSite (event) {
      if (event.value === this.$site.currentSite.name) {
        return
      }
      this.$site.currentSite = event.value
      this.$event.emit('resetSite', event.value)
    },
    setConfig (config) {
      this.$site.config = config
      this.$event.emit('reloadConfig', config)
    },
    pickFontSize () {
      let items = ['标准', '偏大', '特大']
      let index = items.indexOf(this.currentFontSize)
      picker.pick({
        items,
        index
      }, ({result, data}) => {
        if (result === 'success') {
          let sizeName = 'NORM'
          switch (data) {
            case 0:
              sizeName = 'NORM'
              break
            case 1:
              sizeName = 'BIG'
              break
            case 2:
              sizeName = 'EXTRALARGE'
              break
          }
          let config = this.$site.config
          config.fontSize = sizeName
          this.setConfig(config)
        }
      })
    }
  },
  computed: {
    cellStyle () {
      if (this.appConfig.night) {
        return {
          backgroundColor: '#444',
          borderColor: '#666'
        }
      } else {
        return {
          backgroundColor: '#fff',
          borderColor: '#e2e2e2'
        }
      }
    },
    currentFontSize () {
      if (this.appConfig.fontSize) {
        if (this.appConfig.fontSize === 'NORM') {
          return '标准'
        } else if (this.appConfig.fontSize === 'BIG') {
          return '偏大'
        } else if (this.appConfig.fontSize === 'EXTRALARGE') {
          return '特大'
        }
        return ''
      } else {
        return '标准'
      }
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
.group-title {
  font-size: 25px;
  color: #666;
}
.group-title-night {
  color: #aaa;
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

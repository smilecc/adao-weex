<template>
  <scroller class="page">
    <div style="margin: 20px; margin-bottom: 10px">
      <text style="font-size: 25px; color: #666">软件设置</text>
    </div>
    <wxc-cell title="显示图片">
      <switch :checked="$site.config.displayImage" slot="value" @change="displayImage">
      </switch>
    </wxc-cell>
    <wxc-cell title="显示回复" desc="控制版块详情中显示对该串的回复">
      <switch :checked="$site.config.displayReply" slot="value" @change="displayReply">
      </switch>
    </wxc-cell>

    <div style="margin: 20px; margin-bottom: 10px">
      <text style="font-size: 25px; color: #666">站点选择</text>
    </div>
    <wxc-radio :list="siteList" @wxcRadioListChecked="changeSite"></wxc-radio>
  </scroller>
</template>

<script>
import { WxcCell, WxcRadio } from 'weex-ui'
export default {
  components: {
    WxcCell,
    WxcRadio
  },
  data () {
    return {
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
</style>

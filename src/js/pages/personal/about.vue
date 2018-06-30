<template>
  <div>
    <div class="intro">
      <text class="title">AC匿名版</text>
      <text class="version">v1.0.beta</text>
    </div>
    <div class="group">
      <wxc-cell title="项目地址" v-if="false" :has-arrow="true" @wxcCellClicked="openGithub"></wxc-cell>
      <wxc-cell title="开源组件" :has-arrow="true" @wxcCellClicked="openOpenSource"></wxc-cell>
      <wxc-cell title="关于作者" :has-arrow="true" @wxcCellClicked="openBlog"></wxc-cell>
      <wxc-cell title="致谢" :has-arrow="true" @wxcCellClicked="openThank"></wxc-cell>
    </div>
  </div>
</template>

<script>
import { WxcCell } from 'weex-ui'
export default {
  components: {
    WxcCell
  },
  methods: {
    openGithub () {
      this.$router.openBrowser('https://github.com/smilecc/adao-weex')
    },
    openOpenSource () {
      this.$router.open({
        name: 'personal.opensource',
        type: 'PUSH'
      })
    },
    openBlog () {
      this.$router.openBrowser('https://weibo.com/smilexc8')
    },
    openThank () {
      this.$router.open({
        name: 'personal.thank',
        type: 'PUSH'
      })
    }
  }
}
</script>

<style>
.intro {
  margin: 50px 0;
}
.title {
  text-align: center;
  font-size: 42px;
}
.version {
  text-align: center;
  color: #777;
}
</style>

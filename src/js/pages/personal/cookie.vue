<template>
  <scroller class="page">
    <div v-if="cookies.length > 0">
      <div style="margin: 20px; margin-bottom: 10px">
        <text style="font-size: 25px; color: #666">点击饼干名称即可编辑</text>
      </div>
      <wxc-cell
        v-for="(cookie, cIndex) in cookies"
        :key="cIndex"
        :title="cookie.date"
        :desc="cookie.cookie"
        @wxcCellClicked="operationCookie(cookie)"
      >
        <switch slot="value"
          :checked="cookie.cookie === currentCookie.cookie"
          @change="event => onCookieChange(cookie, event)"
        >
        </switch>
      </wxc-cell>
    </div>
    <wxc-result
      type="noGoods"
      :custom-set="noCookieResult"
      :show="noCookies"
      padding-top="232"
    >
    </wxc-result>
  </scroller>
</template>

<script>
import { WxcCell, WxcResult } from 'weex-ui'
const stream = weex.requireModule('stream')
const modal = weex.requireModule('modal')
const actionSheet = weex.requireModule('actionSheet')
export default {
  components: {
    WxcCell,
    WxcResult
  },
  data () {
    return {
      cookies: [],
      noCookies: false,
      currentCookie: {
        cookie: '',
        date: ''
      },
      noCookieResult: {
        noGoods: {
          button: null,
          content: '哎呀呀，还没有一块饼干呢',
          desc: '点击 + 号试试'
        }
      }
    }
  },
  created () {
    this.$notice.loading.show('整理饼干中')
  },
  mounted () {
    this.initNavBar()
    // 获取当前Cookie
    let currentCookie = this.$site.cookie
    if (currentCookie) {
      this.currentCookie = currentCookie
    }
    // 获取所有Cookie
    this.cookies = this.$site.cookies
    if (this.cookies.length === 0) {
      this.noCookies = true
    }
    this.$notice.loading.hide()    
  },
  methods: {
    initNavBar () {
      // 标题栏右侧操作
      this.$navigator.setRightItem({
        image: 'bmlocal://assets/plus@2x.png'
      }, () => {
        actionSheet.create({
          title: '新增饼干',
          message: '可以通过以下方式添加饼干',
          items: [{
            type: 0,
            message: '自动获取'
          }, {
            type: 0,
            message: '手动输入'
          }, {
            type: 0,
            message: '扫描二维码'
          }, {
            type: 1,
            message: '取消'
          }]
        }, result => {
          if (result.result === 'success') {
            if (result.data.index === 0) {
              this.getNewCookie()
            } else if (result.data.index === 1) {
              this.inputCookie()
            } else if (result.data.index === 2) {
              this.scanCookie()
            }
          }
        })
      })
    },
    getNewCookie () {
      let url = this.$site.currentSite.domain + '/Api/getCookie'
      this.$notice.loading.show('正在获取')
      stream.fetch({
        method: 'GET',
        url,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
          'Cookie': ''
        }
      }, response => {
        this.$notice.loading.hide()
        if (response.data === '"ok"') {
          if (response.headers['Set-Cookie']) {
            let match = response.headers['Set-Cookie'].match(/userhash=((?!deleted).[\W\w]+?);/)
            if (match.length > 1) {
              this.appendCookie(match[0])
              this.$notice.toast({
                message: '新饼干获取成功~'
              })
              return
            }
          }
        }
        this.$notice.toast({
          message: '新饼干获取失败~'
        })
      })
    },
    operationCookie (cookie) {
      actionSheet.create({
        title: '操作饼干',
        message: '正在对[' + cookie.date + ']进行操作',
        items: [{
          type: 0,
          message: '复制'
        }, {
          type: 2,
          message: '删除'
        }, {
          type: 1,
          message: '取消'
        }]
      }, result => {
        if (result.result === 'success') {
          if (result.data.index === 0) {
            this.copyString(cookie.cookie)
          } else if (result.data.index === 1) {
            this.$notice.confirm({
              title: '确认',
              message: '是否确认要删除该饼干',
              okCallback: () => {
                this.deleteCookie(cookie)
                this.$notice.toast({ message: '饼干已销毁' })
              }
            })
          }
        }
      })
    },
    appendCookie (cookie) {
      // 如果是第一枚Cookie则自动设置为启用状态
      let cookieObj = {
        cookie: cookie,
        date: (new Date()).toLocaleString('zh-CN')
      }
      if (this.cookies.length === 0) {
        this.$site.cookie = cookieObj
        this.currentCookie = cookieObj
      }
      // 将Cookie存入存储
      this.$site.appendCookie(cookieObj)
      this.cookies = this.$site.cookies
      this.noCookies = false
    },
    onCookieChange (cookie, event) {
      if (event.value) {
        this.$site.cookie = cookie
        this.currentCookie = cookie
      } else {
        this.$notice.toast({ message: '最少要选择一个饼干🍪' })
      }
    },
    deleteCookie (cookie) {
      for (let i = 0; i < this.cookies.length; i++) {
        if (this.cookies[i].cookie === cookie.cookie) {
          this.cookies.splice(i, 1)
        }
      }
      this.$site.cookies = this.cookies
      if (this.cookies.length === 0) {
        this.noCookies = true
        this.$site.cookie = null
      } else {
        this.$site.cookie = this.cookies[0]
        this.currentCookie = this.cookies[0]
      }
    },
    // 手动输入添加饼干
    inputCookie () {
      modal.prompt({
        message: '请输入你的Cookie',
        okTitle: '添加🍪',
        cancelTitle: '取消'
      }, value => {
        if (value.result === '添加🍪') {
          this.appendCookie(value.data)
          this.$notice.toast({ message: '添加🍪成功' })
        }
      })
    },
    scanCookie () {
      let $setStateBar = () => {
        this.$navigator.setNavigationInfo({
          title: '饼干管理',
          statusBarStyle: 'Default'
        })
      }
      this.$tools.scan().then((resData) => {
        if (resData.text) {
          this.appendCookie(resData.text)
          this.$notice.toast({ message: '添加🍪成功' })
        }
        $setStateBar()
      }, error => {

      })
      $setStateBar()
    },
    // 复制字符串
    copyString (content) {
      this.$tools.copyString(content).then(response => {
        this.$notice.toast({ message: '复制成功' })
      })
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

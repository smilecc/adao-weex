<template>
  <div>
    <textarea
      :autofocus="true"
      :value="initReply"
      :rows="rows"
      @input="onInput"
      placeholder="请在此书写你的回复..."
      class="textarea"
    >
    </textarea>
    <div style="margin: 20px">
      <wxc-button v-if="uploadImage.length === 0" text="增加图片" size="small" type="blue" @wxcButtonClicked="pickImage"></wxc-button>
      <image v-else class="image-preview" resize="cover" :src="uploadImage[0]" @click="pickImage"></image>
    </div>
  </div>
</template>

<script>
import { WxcButton } from 'weex-ui'
const stream = weex.requireModule('stream')
const bmAxios = weex.requireModule('bmAxios')
export default {
  components: {
    WxcButton
  },
  data () {
    return {
      rows: 10,
      initReply: '',
      replyContent: '',
      threadId: '',
      uploadImage: []
    }
  },
  created () {
    this.$router.getParams().then(response => {
      if (response.replyId) {
        this.setInitReply('>>No.' + response.replyId + '\n')
      }
      this.threadId = response.threadId
    })
  },
  mounted () {
    this.$navigator.setRightItem({
      text: '发表',
      textColor: 'rgb(29, 161, 242)'
    }, () => {
      this.submitReply()
    })
  },
  methods: {
    setInitReply (content) {
      this.initReply = content
      this.replyContent = content
    },
    onInput (event) {
      this.replyContent = event.value
    },
    submitReply () {
      let currentCookie = this.$site.cookie
      if (currentCookie) {
        if (this.uploadImage.length === 0) {
          this.sendReply(currentCookie)
        } else {
          this.sendImage(currentCookie)
        }
      } else {
        this.$notice.confirm({
          title: '暂无饼干🍪',
          message: '暂无可用饼干，请先获取饼干后再进行操作',
          okTitle: '去添加饼干',
          okCallback: () => {
            this.$router.open({
              name: 'personal.cookie',
              type: 'PUSH'
            })
          }
        })
      }
    },
    pickImage () {
      this.$image.pick({
        maxCount: 1
      }).then(response => {
        this.uploadImage = response
      })
    },
    sendReply (currentCookie) {
      this.$notice.loading.show('正在用力')
      let threadId = encodeURIComponent(this.threadId)
      let content = encodeURIComponent(this.replyContent)
      stream.fetch({
        method: 'POST',
        url: this.postUrl,
        headers: {
          'User-Agent': 'HavfunClient-iOS',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': currentCookie.cookie
        },
        type: 'text',
        body: encodeURI(`resto=${this.threadId}&content=${this.replyContent}`)
      }, response => {
        this.$notice.loading.hide()
        if (response.data.indexOf('回复成功') !== -1) {
          this.onReplySuccess()
        } else {
          this.onReplyFail()
        }
      })
    },
    sendImage (currentCookie) {
      bmAxios.uploadImage({
        url: this.postUrl,
        params: {
          resto: this.threadId,
          content: this.replyContent
        },
        header: {
          Cookie: currentCookie.cookie
        },
        images: this.uploadImage
      }, (response) => {
        if (response.data instanceof Array && response.data.length > 0) {
          if (response.data[0].indexOf('回复成功') !== -1) {
            this.onReplySuccess()
          } else {
            this.onReplyFail()
          }
        } else {
          this.onReplyFail()
        }
      })
    },
    onReplySuccess () {
      this.$event.emit('replySuccess')
      this.$router.back()
    },
    onReplyFail () {
      this.$notice.confirm({
        title: '回复失败',
        message: '可能是饼干失效或其他错误',
        okTitle: '管理饼干',
        okCallback: () => {
          this.$router.open({
            name: 'personal.cookie',
            type: 'PUSH'
          })
        }
      })
    }
  },
  computed: {
    postUrl () {
      return this.$site.currentSite.domain + '/Home/Forum/doReplyThread'
    }
  }
}
</script>

<style>
.textarea {
  line-height: 40px;
  background-color: #fff;
  padding: 15px;
  height: 400px;
}
.image-preview {
  width: 250px;
  height: 250px;
}
</style>

<template>
  <div>
    <textarea
      ref="input"
      :autofocus="true"
      :value="initReply"
      :rows="rows"
      placeholder="请在此书写你的内容..."
      @input="onInput"
      class="textarea"
    >
    </textarea>
    <textarea-tools class="btn-group">
      <div class="tools-btn" @click="popFace">
        <text class="tools-btn-text">(｀･ω･) 颜文字</text>
      </div>
      <image v-if="uploadImage.length !== 0" class="image-preview" resize="cover" :src="uploadImage[0]" @click="pickImage"></image>
      <div class="tools-btn" @click="pickImage">
        <text class="tools-btn-text">上传图片</text>
      </div>
    </textarea-tools>
    <face-pop :show.sync="facePop.show" @select="onFaceSelect" @cancel="onFaceCancel">
    </face-pop>
  </div>
</template>

<script>
import { WxcButton } from 'weex-ui'
import Face from '../components/Face'
const stream = weex.requireModule('stream')
const bmAxios = weex.requireModule('bmAxios')
const actionSheet = weex.requireModule('actionSheet')
export default {
  components: {
    WxcButton,
    'face-pop': Face
  },
  data () {
    return {
      rows: 10,
      initReply: '',
      replyContent: '',
      threadId: '',
      forumId: '',
      forumName: '',
      draftId: '',
      uploadImage: [],
      facePop: {
        show: false,
        selectPromise: {
          promise: undefined,
          reject: undefined,
          resolve: undefined
        }
      }
    }
  },
  created () {
    this.initNavbarLeft()
    this.$router.getParams().then(response => {
      if (response.replyId) {
        this.setInitReply('>>No.' + response.replyId + '\n')
      }
      if (response.content) {
        this.setInitReply(response.content)
      }
      if (response.forumName) {
        this.forumName = response.forumName
      }
      if (response.draftId) {
        this.draftId = response.draftId
      }
      if (response.forumId) {
        this.forumId = response.forumId
      } else {
        this.threadId = response.threadId
      }
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
      let sendBody = ''
      if (this.forumId) {
        // 发布新串
        sendBody = encodeURI(`fid=${this.forumId}&content=${this.replyContent}`)
      } else {
        // 回复串
        sendBody = encodeURI(`resto=${this.threadId}&content=${this.replyContent}`)
      }
      stream.fetch({
        method: 'POST',
        url: this.postUrl,
        headers: {
          'User-Agent': 'HavfunClient-iOS',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': currentCookie.cookie
        },
        type: 'text',
        body: sendBody
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
      let sendBody = {}
      if (this.forumId) {
        // 发布新串
        sendBody['fid'] = this.forumId
      } else {
        // 回复串
        sendBody['resto'] = this.threadId
      }
      bmAxios.uploadImage({
        url: this.postUrl,
        params: {
          ...sendBody,
          content: this.replyContent
        },
        header: {
          Cookie: currentCookie.cookie
        },
        images: this.uploadImage
      }, (response) => {
        if (response.data instanceof Array && response.data.length > 0) {
          if (response.data[0].indexOf('p class="success"') !== -1) {
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
      if (this.forumId) {
        this.$event.emit('postSuccess')
      } else {
        this.$event.emit('replySuccess')
      }
      if (this.draftId) {
        this.$event.emit('deleteDrafts', {
          id: this.draftId
        })
      }
      this.$notice.toast({ message: '发表成功' })
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
    },
    popFace () {
      this.$refs['input'].getSelectionRange(({selectionStart, selectionEnd}) => {
        this.$tools.resignKeyboard().then(() => {
          let start = this.replyContent.substr(0, selectionStart)
          let end = this.replyContent.substr(selectionStart, this.replyContent.length)
          this.facePop.show = true

          this.facePop.selectPromise.promise = new Promise((resolve, reject) => {
            this.facePop.selectPromise.resolve = resolve
            this.facePop.selectPromise.reject = reject
          })
          let $setFocus = (overLength) => {
            let selectPos = selectionStart + overLength
            this.$refs['input'].focus()
            this.$refs['input'].setSelectionRange(selectPos, selectPos)
          }
          // 选择表情
          this.facePop.selectPromise.promise.then(({ text: faceText }) => {
            let text = start + faceText + end
            this.$refs['input'].setText(text)
            this.onInput({ value: text })
            // 设置焦点
            $setFocus(faceText.length)
          }).catch(() => {
            $setFocus(0)
          })
        })
      })
    },
    onFaceSelect (face) {
      if (this.facePop.selectPromise.resolve) {
        this.facePop.selectPromise.resolve(face)
      }
    },
    onFaceCancel () {
      if (this.facePop.selectPromise.reject) {
        this.facePop.selectPromise.reject()
      }
    },
    initNavbarLeft () {
      this.$navigator.setLeftItem({
        text: '放弃',
        textColor: 'red'
      }, () => {
        // 如果没有内容则返回
        if (!this.replyContent) {
          this.$router.back()
          return
        }
        // 如果有内容则弹出选项
        actionSheet.create({
          title: '放弃回复',
          message: '放弃后不可撤回',
          items: [{
            type: 0,
            message: '存为草稿'
          }, {
            type: 2,
            message: '放弃'
          }, {
            type: 1,
            message: '取消'
          }]
        }, result => {
          if (result.result === 'success') {
            if (result.data.index === 0) {
              // 存为草稿
              if (this.draftId) {
                this.$event.emit('saveDrafts', {
                  id: this.draftId,
                  content: this.replyContent
                })
              } else {
                this.saveDraft()
              }
              this.$notice.toast({ message: '保存成功' })
              this.$router.back()
            } else if (result.data.index === 1) {
              this.$router.back()
            }
          }
        })
      })
    },
    saveDraft () {
      let draft = {
        threadId: this.threadId,
        forumId: this.forumId,
        forumName: this.forumName,
        siteName: this.$site.currentSite.name,
        content: this.replyContent,
        time: (new Date()).toLocaleString('zh-CN')
      }
      // 从存储中获取
      let myDrafts = this.$storage.getSync('myDrafts')
      // 初始化
      if (!myDrafts) {
        myDrafts = {
          list: [],
          maxId: 0
        }
      }
      // 设置ID
      draft.id = ++myDrafts.maxId
      myDrafts.list = [
        draft,
        ...myDrafts.list
      ]
      // 存储
      this.$storage.setSync('myDrafts', myDrafts)
    }
  },
  computed: {
    postUrl () {
      if (this.forumId) {
        return this.$site.currentSite.domain + '/Home/Forum/doPostThread'
      } else {
        return this.$site.currentSite.domain + '/Home/Forum/doReplyThread'
      }
    }
  }
}
</script>

<style>
.textarea {
  line-height: 40px;
  background-color: #fff;
  padding: 15px;
  padding-bottom: 50px;
  /* height: 400px; */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 80px;
}
.image-preview {
  width: 66px;
  height: 66px;
  border-radius: 3px;
  margin-top: 7px;
  margin-right: 10px;
}
.btn-group {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FF6666;
  height: 80px;
  flex-direction: row;
  justify-content: flex-end;
}
.tools-btn {
  padding-top: 18px;
  margin-right: 20px;
}
.tools-btn-text {
  color: #fff;
}
</style>

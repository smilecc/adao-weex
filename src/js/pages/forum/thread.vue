<template>
  <div :class="$class('page')">
    <div :class="$class('border-shadow')"></div>
    <scroller
      @loadmore="onLoadMore"
      :loadmoreoffset="1500"
    >
      <div ref="main" :class="$class('thread-main')" v-if="thread.contentList.length > 0">
        <!-- 板块信息 -->
        <div class="thread-user">
          <!-- 用户信息 -->
          <div class="thread-user-name">
            <bmrichtext style="color: #888; flex: 1">
              <bmspan :class="$class('thread-user-username')" :value="thread.name"></bmspan>
              <bmspan :style="{ color: thread.admin == 1 ? 'red' : '#888' }" :value="` ${thread.userid}`"></bmspan>
              <bmspan v-if="thread.sage == 1" style="color: red" :value="` SAGE`"></bmspan>
            </bmrichtext>
            <div class="forum-name" v-if="thread.forumName">
              <text style="font-size: 25px; color: #333">{{ thread.forumName }}</text>
            </div>
          </div>
          <!-- 时间 -->
          <bmrichtext style="color: #888; font-size: 20px; margin-top: 3px">
            <bmspan :value="`No.${thread.id}`"></bmspan>
            <bmspan :value="` ${thread.now}`"></bmspan>
          </bmrichtext>
        </div>
        <!-- 标题 -->
        <div class="thread-title">
          <text :class="$class('thread-title-text')">{{ thread.title }}</text>
        </div>
        <!-- 串的内容 -->
        <w-html :list="thread.contentList"></w-html>
        <!-- 图片 -->
        <image
          v-if="config.displayImage && thread.img"
          :class="$class('thread-image')"
          resize="contain"
          :src="$site.getImageUrl(thread.img, thread.ext)"
          @click="showImage(thread.img, thread.ext)"
        >
        </image>
      </div>
      
      <div class="reply" v-if="replys.list.length > 0">
        <div class="finish" v-if="startPage != 1" @click="loadPreviousPage">
          <text class="finish-text">当前第{{ startPage }}页 点此加载上一页</text>
        </div>
        <text class="reply-title">回复</text>
        <div v-for="(reply, rIndex) in replys.list" :key="rIndex" @click="onOperationReply(reply)" :class="$class('reply-card')">
          <div class="reply-user">
            <!-- 用户信息 -->
            <div class="thread-user-name">
              <bmrichtext style="color: #888; flex: 1">
                <bmspan v-if="reply.admin == 1" style="color: red" :value="reply.userid"></bmspan>
                <bmspan v-else-if="reply.userid == thread.userid" :class="$class('reply-userid-po')" :value="reply.userid"></bmspan>
                <bmspan v-else :class="$class('reply-userid')" :value="reply.userid"></bmspan>
                <bmspan v-if="reply.userid == thread.userid" :class="$class('reply-tag-po')" value=" PO主"></bmspan>
                <bmspan v-if="reply.admin == 1" class="reply-tag-admin" value=" 红名"></bmspan>
              </bmrichtext>
            </div>
            <!-- 时间 -->
            <bmrichtext style="color: #888; font-size: 20px; margin-top: 3px">
              <bmspan :value="`No.${reply.id}`"></bmspan>
              <bmspan :value="` ${reply.now}`"></bmspan>
            </bmrichtext>
          </div>
          <w-html ref="reply" :list="reply.contentList" :replys="replyList"></w-html>
          <image
            v-if="config.displayImage && reply.img"
            :class="$class('thread-image')"
            resize="contain"
            :src="$site.getImageUrl(reply.img, reply.ext)"
            @click="showImage(reply.img, reply.ext)"
          >
          </image>
        </div>
      </div>
      <div class="finish" v-if="replys.isLoaded">
        <text class="finish-text">- 我也是有底线的 上拉可刷新 -</text>
      </div>
      <loading class="loading" @loading="onLoadMore" :display="replys.pullLoading ? 'show' : 'hide'">
        <loading-indicator class="indicator"></loading-indicator>
      </loading>
    </scroller>
    <div class="tip-refresh">
      <wxc-part-loading :width="55" :height="55" :show="replys.loading"></wxc-part-loading>
    </div>
    <favorite
      :show.sync="favorite.show"
      :thread-id="thread.id"
      :thread-title="favoriteName"
      :forum-name="thread.forumName"
    ></favorite>
  </div>
</template>

<script>
import WHtml from '../components/w-html'
import Favorite from '../components/Favorite'
import { WxcPartLoading } from 'weex-ui'
const img = weex.requireModule('imagePicker')
const actionSheet = weex.requireModule('actionSheet')
const dom = weex.requireModule('dom')
const modal = weex.requireModule('modal')
export default {
  components: {
    WHtml,
    WxcPartLoading,
    Favorite
  },
  data () {
    return {
      currentPage: 1,
      startPage: 1,
      thread: {
        id: '',
        userid: '',
        name: '无名氏',
        forumName: '',
        title: '串',
        sage: '0',
        admin: '0',
        img: '',
        ext: '',
        replyCount: 0,
        now: '',
        contentList: [],
        contentText: '',
        imageList: []
      },
      replys: {
        list: [],
        loaded: {},
        isLoaded: false,
        loading: false,
        pullLoading: false
      },
      favorite: {
        show: false
      },
      config: {}
    }
  },
  created () {
    this.config = this.$site.config
    this.$event.on('reloadConfig', config => {
      this.config = config
    })
  },
  mounted () {
    this.initNavBar()
    // 加载更多
    this.$event.on('replySuccess', ({ content }) => {
      this.$notice.toast({ message: '回复成功' })
      // 计入回复记录
      this.$site.recordHistory({
        type: 'reply',
        threadId: this.thread.id,
        threadContent: this.thread.contentText,
        forumName: this.thread.forumName,
        postContent: content
      })
      this.currentPage--
      this.onLoadMore()
    })
    this.$router.getParams().then(response => {
      this.thread.id = response.threadId
      if ('forumName' in response) {
        this.thread.forumName = response.forumName
      }
      this.$notice.loading.show('正在前往')
      this.loadData().then(response => {
        if (response.replys.length < 19) {
          this.replys.isLoaded = true;
        }
        // 设置标题栏
        this.$navigator.setNavigationInfo({
          title: this.thread.title
        }, () => {
          // 回到顶部
          dom.scrollToElement(this.$refs['main'], {})
        })
        // 取消loading
        this.$notice.loading.hide()
      }).catch(error => {
        this.$notice.loading.hide()
      })
    })
  },
  methods: {
    initNavBar () {
      // 标题栏右侧操作
      this.$navigator.setRightItem({
        image: 'bmlocal://assets/ellipsis@2x.png'
      }, () => {
        actionSheet.create({
          title: '串的操作',
          message: '对本串进行一些操作',
          items: [{
            type: 0,
            message: '回复'
          }, {
            type: 0,
            message: '收藏'
          }, {
            type: 0,
            message: '跳页'
          }, {
            type: 1,
            message: '取消'
          }]
        }, result => {
          if (result.result === 'success') {
            if (result.data.index === 0) {
              this.onReply()
            } else if (result.data.index === 1) {
              this.favorite.show = true
            } else if (result.data.index === 2) {
              // 计算页数
              let pageCount = parseInt(this.thread.replyCount / 19)
              if (this.thread.replyCount % 19 > 0) {
                pageCount += 1
              }
              if (this.currentPage > pageCount) {
                pageCount = this.currentPage
              }
              // 弹出输入框
              modal.prompt({
                message: '共' + pageCount + '页，当前加载到' + this.currentPage + '页\n请输入数字页数，例如 6',
                okTitle: '跳转',
                cancelTitle: '取消'
              }, value => {
                if (value.result === '跳转') {
                  this.replys.list = []
                  this.$notice.loading.show('正在跳转')
                  this.currentPage = parseInt(value.data)
                  this.startPage = this.currentPage
                  // 初始化已加载
                  this.replys.loaded = {}
                  // 初始化图片列表
                  this.thread.imageList = []
                  this.pushImage(this.thread)
                  this.loadData().then(response => {
                    if (response.replys.length < 19) {
                      this.replys.isLoaded = true;
                    }
                    this.$notice.loading.hide()
                  }).catch(error => {
                    this.$notice.loading.hide()
                  })
                }
              })
            }
          }
        })
      })
    },
    loadData ({ loadPreviousPage = false } = {}) {
      return new Promise((resolve, reject) => {
        this.$fetch({
          method: 'GET',
          name: 'forum.thread',
          data: {
            id: this.thread.id,
            page: loadPreviousPage ? this.startPage : this.currentPage
          }
        }).then(async response => {
          // 解析主串内容
          if (this.currentPage === 1) {
            this.$html.parse(response.content).then(({ list, text }) => {
              this.thread.contentList = list
              this.thread.contentText = text
              // 计入浏览记录
              this.$site.recordHistory({
                type: 'visit',
                threadId: this.thread.id,
                threadContent: text,
                forumName: this.thread.forumName
              })
            })
            this.thread.userid = response.userid
            this.thread.now = response.now
            this.thread.name = response.name
            this.thread.title = response.title
            this.thread.img = response.img
            this.thread.ext = response.ext
            this.thread.replyCount = response.replyCount
            this.thread.sage = response.sage
            this.thread.admin = response.admin
            this.pushImage(response)
          }
          // 用于储存加载上一页时的数据
          let previousReply = []
          let previousImage = []
          // 解析回复内容
          for (let reply of response.replys) {
            // 只加载未在loadedReplyIds中的
            if (!(reply.id in this.replys.loaded)) {
              this.replys.loaded[reply.id] = ''
              let replyHtml = await this.$html.parse(reply.content)
              this.$set(reply, 'contentList', replyHtml.list)
              this.$set(reply, 'contentText', replyHtml.text)
              if (loadPreviousPage) {
                // 是否为加载上一页
                previousReply.push(reply)
                if (reply.img) {
                  previousImage.push(this.$site.getImageUrl(reply.img, reply.ext, 'image'))
                }
              } else {
                this.replys.list.push(reply)
                this.pushImage(reply)
              }
            }
          }
          // 如为加载上一页 则将数据插入到头部
          if (loadPreviousPage) {
            this.replys.list.splice(0, 0, ...previousReply)
            // 判断主串是否有图片
            if (this.thread.img) {
              this.thread.imageList.splice(1, 0, ...previousImage)
            } else {
              this.thread.imageList.splice(0, 0, ...previousImage)
            }
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    onLoadMore () {
      if (this.replys.loading) {
        return
      }
      this.currentPage++
      this.replys.loading = true
      this.loadData().then(response => {
        if (response.replys.length !== 19) {
          this.currentPage--
          this.replys.isLoaded = true
        }
        this.replys.loading = false
      })
    },
    onOperationReply (reply) {
      actionSheet.create({
        title: '操作',
        message: '对No.' + reply.id + '进行操作',
        items: [{
          type: 0,
          message: '回复'
        }, {
          type: 0,
          message: '复制'
        }, {
          type: 1,
          message: '取消'
        }]
      }, result => {
        if (result.result === 'success') {
          // 复制内容
          if (result.data.index === 1) {
            this.copyString(reply.contentText)
          } else if (result.data.index === 0) {
            this.onReply(reply.id)
          }
        }
      })
    },
    pushImage (thread, loadPreviousPage = false) {
      if (thread.img) {
        this.thread.imageList.push(this.$site.getImageUrl(thread.img, thread.ext, 'image'))
      }
    },
    // 显示图片
    showImage (currentImage) {
      currentImage = this.thread.imageList.find(element => {
        return element.indexOf(currentImage) !== -1
      })
      if (!currentImage) {
        this.$notice.alert({
          title: '图片加载失败',
          message: '未找到该图片，加载失败'
        })
        return
      }
      img.previewImage({
        urls: this.thread.imageList,
        current: currentImage
      })
    },
    // 复制字符串
    copyString (content) {
      this.$tools.copyString(content).then(response => {
        this.$notice.toast({ message: '复制成功' })
      })
    },
    onReply (replyId = '') {
      this.$router.open({
        name: 'forum.reply',
        type: 'PUSH',
        gesBack: false,
        backgroundColor: this.appConfig.night ? '#333' : '',
        params: {
          threadId: this.thread.id,
          replyId
        }
      })
    },
    // 加载上一页
    loadPreviousPage () {
      if (this.startPage <= 1 || this.replys.loading) {
        return
      }
      this.startPage--
      this.$notice.loading.show('正在加载第' + this.startPage + '页')

      this.loadData({ loadPreviousPage: true }).then(response => {
        this.$notice.loading.hide()
      }).catch(error => {
        this.$notice.loading.hide()
        this.startPage++
      })
    }
  },
  computed: {
    favoriteName () {
      if (this.thread.contentText.length > 10) {
        return this.thread.contentText.substr(0, 10) + '...'
      } else {
        return this.thread.contentText
      }
    },
    replyList () {
      return [
        this.thread,
        ...this.replys.list
      ]
    }
  }
}
</script>

<style>
.page-night {
  background-color: #333;
}
.border-shadow {
  box-shadow: 1px 0px 15px #ccc;
  position: fixed;
  top: -20px;
  left: 0;
  right: 0;
  height: 20px;
  background-color: #fff;
}
.border-shadow-night {
  box-shadow: 0px 0px 0 #222;
}
.thread-main {
  border-top-color: #f0f0f0;
  border-top-style: solid;
  border-top-width: 1px;
  background-color: #fff;
  padding: 30px 40px;
}
.thread-main-night {
  background-color: #272727;
  border-top-color: #222;
}
.thread-user {
  margin-bottom: 30px;
}
.thread-user-name {
  flex-direction: row;
  justify-content: space-between;
}
.thread-user-username {
  color: #333;
}
.thread-user-username-night {
  color: #ddd;
}
.thread-title-text {
  color: #000;
  font-weight: 500;
  font-size: 33px;
}
.thread-title-text-night {
  color: #fff;
}
.forum-name {
  background-color: #e8e8e8;
  padding: 3px 7px;
  border-radius: 5px;
}
.thread-title {
  margin-bottom: 18px;
}

.reply {
  margin-top: 30px;
}
.reply-user {
  margin-bottom: 10px
}
.reply-title {
  margin-left: 20px;
  font-size: 23px;
  margin-bottom: 10px;
  color: #888;
}
.reply-card {
  background-color: #fff;
  padding: 24px 35px;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  border-bottom-color: #f2f2f2;
}
.reply-card-night {
  background-color: #272727;
  border-bottom-color: #444;
}
.reply-tag-po {
  color: #333;
  font-size: 16px;
}
.reply-tag-po-night {
  color: #ddd;
}
.reply-userid-po {
  color: #000;
}
.reply-userid-po-night {
  color: #fff;
}
.reply-tag-admin {
  font-size: 16px;
  color: red;
}
.thread-image {
  width: 200px;
  height: 200px;
  margin-top: 10px;
  margin-right: 20px;
  border-radius: 5px;
  border-style: solid;
  border-width: 1px;
  border-color: #dfdfdf;
}
.thread-image-night {
  border-color: #555;
}

.finish {
  margin: 30px 0;
}
.finish-text {
  text-align: center;
  color: #aaa;
}
.tip-refresh {
  position: fixed;
  bottom: 25px;
  right: 25px;
}


</style>

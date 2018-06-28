<template>
  <div>
    <div class="border-shadow"></div>
    <scroller
      @loadmore="onLoadMore"
      :loadmoreoffset="1500"
    >
      <div ref="main" class="thread-main" v-if="thread.contentList.length > 0">
        <!-- 板块信息 -->
        <div class="thread-user">
          <!-- 用户信息 -->
          <div class="thread-user-name">
            <bmrichtext style="color: #888; flex: 1">
              <bmspan style="color: #333" :value="thread.name"></bmspan>
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
          <text style="font-weight: 500; font-size: 33px">{{ thread.title }}</text>
        </div>
        <!-- 串的内容 -->
        <w-html :list="thread.contentList"></w-html>
        <!-- 图片 -->
        <image
          v-if="config.displayImage && thread.img"
          class="thread-image"
          resize="contain"
          :src="$site.getImageUrl(thread.img, thread.ext)"
          @click="showImage(thread.img, thread.ext)"
        >
        </image>
      </div>
      <div class="reply" v-if="replys.list.length > 0">
        <text class="reply-title">回复</text>
        <div v-for="(reply, rIndex) in replys.list" :key="rIndex" @click="onOperationReply(reply)" class="reply-card">
          <div class="reply-user">
            <!-- 用户信息 -->
            <div class="thread-user-name">
              <bmrichtext style="color: #888; flex: 1">
                <bmspan v-if="reply.admin == 1" style="color: red" :value="reply.userid"></bmspan>
                <bmspan v-else-if="reply.userid == thread.userid" style="color: #000" :value="reply.userid"></bmspan>
                <bmspan v-else style="color: #888" :value="reply.userid"></bmspan>
                <bmspan v-if="reply.userid == thread.userid" class="reply-tag-po" value=" PO主"></bmspan>
                <bmspan v-if="reply.admin == 1" class="reply-tag-admin" value=" 红名"></bmspan>
              </bmrichtext>
            </div>
            <!-- 时间 -->
            <bmrichtext style="color: #888; font-size: 20px; margin-top: 3px">
              <bmspan :value="`No.${reply.id}`"></bmspan>
              <bmspan :value="` ${reply.now}`"></bmspan>
            </bmrichtext>
          </div>
          <w-html ref="reply" :list="reply.contentList" :replys="replys.list"></w-html>
          <image
            v-if="config.displayImage && reply.img"
            class="thread-image"
            resize="contain"
            :src="$site.getImageUrl(reply.img, reply.ext)"
            @click="showImage(reply.img, reply.ext)"
          >
          </image>
        </div>
      </div>
      <div class="finish" v-if="replys.isLoaded">
        <text class="finish-text">- 我也是有底线的 -</text>
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
export default {
  components: {
    WHtml,
    WxcPartLoading,
    Favorite
  },
  data () {
    return {
      currentPage: 1,
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
    this.$event.on('replySuccess', () => {
      this.$notice.toast({ message: '回复成功' })
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
        image: 'bmlocal://assets/edit@2x.png'
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
            type: 1,
            message: '取消'
          }]
        }, result => {
          if (result.result === 'success') {
            if (result.data.index === 0) {
              this.onReply()
            } else if (result.data.index === 1) {
              this.favorite.show = true
            }
          }
        })
      })
    },
    loadData () {
      return new Promise((resolve, reject) => {
        this.$fetch({
          method: 'GET',
          name: 'forum.thread',
          data: {
            id: this.thread.id,
            page: this.currentPage
          }
        }).then(async response => {
          // 解析主串内容
          if (this.currentPage === 1) {
            this.$html.parse(response.content).then(({ list, text }) => {
              this.thread.contentList = list
              this.thread.contentText = text
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
          // 解析回复内容
          for (let reply of response.replys) {
            // 只加载未在loadedReplyIds中的
            if (!(reply.id in this.replys.loaded)) {
              this.replys.loaded[reply.id] = ''
              let replyHtml = await this.$html.parse(reply.content)
              this.$set(reply, 'contentList', replyHtml.list)
              this.$set(reply, 'contentText', replyHtml.text)
              this.replys.list.push(reply)
              this.pushImage(reply)
            }
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    onLoadMore () {
      this.currentPage++
      if (this.replys.loading) {
        return
      }
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
    pushImage (thread) {
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
        params: {
          threadId: this.thread.id,
          replyId
        }
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
    }
  }
}
</script>

<style>
.border-shadow {
  box-shadow: 1px 0px 15px #ccc;
  position: fixed;
  top: -20px;
  left: 0;
  right: 0;
  height: 20px;
  background-color: #fff;
}
.thread-main {
  border-top-color: #f0f0f0;
  border-top-style: solid;
  border-top-width: 1px;
  background-color: #fff;
  padding: 30px 40px;
}
.thread-user {
  margin-bottom: 30px;
}
.thread-user-name {
  flex-direction: row;
  justify-content: space-between;
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
.reply-tag-po {
  color: #333;
  font-size: 16px;
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

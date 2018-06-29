<template>
  <div class="wrapper">
    <div class="border-shadow"></div>
    <div class="forum" v-if="forums.assignId === 0">
      <scroller :show-scrollbar="false" scroll-direction="horizontal" class="forum-swich">
        <div
          ref="forum-items"
          v-for="(item, index) in forums.list"
          :key="index"
          @click="selectForum(index)"
          class="forum-item"
          :class="[ forums.selected === index ? 'forum-item-active' : '' ]"
        >
          <text class="forum-item-text" :class="[ forums.selected === index ? 'forum-item-text-active' : '' ]">{{ item.name }}</text>
        </div>
        <div class="forum-item" @click="openFavoriteManager">
          <text>+</text>
        </div>
      </scroller>
    </div>
    <list
      ref="list"
      :show-scrollbar="false"
      :showRefresh="true"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
      :loadmoreoffset="2000"
      @scroll="renderList"
      :offset-accuracy="300"
      v-if="!initLoading"
    >
      <cell style="height: 10px"></cell>
      <cell v-for="(item, index) in threads.list" :key="index" class="thread-item" >
        <div class="thread-card" @click="onThreadClick(item.id)">
          <div class="thread-info">
            <bmrichtext style="color: #888">
              <!-- <bmspan :value="`No.${item.id}`"></bmspan> -->
              <bmspan v-if="item.admin == 1" style="color: red" :value="`${item.userid}`"></bmspan>
              <bmspan v-else :value="`${item.userid}`"></bmspan>
              <bmspan v-if="item.sage == 1" style="color: red" :value="` SAGE`"></bmspan>
            </bmrichtext>
            <div class="thread-replycount">
              <text class="thread-replycount-text">{{ item.replyCount }}</text>
            </div>
            <div class="thread-time">
              <text class="thread-time-text">{{ item.now }}</text>
            </div>
          </div>
          <w-html :list="item.contentList"></w-html>
          <!-- 图片 -->
          <image
            v-if="config.displayImage && item.img"
            class="thread-image"
            resize="contain"
            :src="$site.getImageUrl(item.img, item.ext)"
            @click="showImage(item.img, item.ext)"
          >
          </image>
          <!-- 回复 -->
          <div v-if="config.displayReply" v-for="(reply, rIndex) in item.replys" :key="rIndex" class="reply-card">
            <div class="reply-info">
              <text class="reply-info-text">{{ reply.userid }}</text>
              <text class="reply-info-text">{{ reply.now.substr(13, 8) }}</text>            
            </div>
            <div class="reply-content">
              <w-html :list="reply.contentList"></w-html>
            </div>
          </div>
        </div>
      </cell>
    </list>
    <wxc-result
      type="noGoods"
      :custom-set="error.config"
      :show="error.show && threads.list.length === 0"
      @wxcResultButtonClicked="initLoadForum"
      padding-top="232"
    >
    </wxc-result>
    <div class="tip-refresh">
      <wxc-part-loading :width="55" :height="55" :show="threads.isLoadMore"></wxc-part-loading>
    </div>
  </div>
</template>

<script>
import { WxcResult, WxcPartLoading } from 'weex-ui'
import WHtml from '../components/w-html'
const img = weex.requireModule('imagePicker')
const dom = weex.requireModule('dom')
export default {
  components: {
    WHtml,
    WxcResult,
    WxcPartLoading
  },
  data () {
    return {
      initLoading: false,
      maxScrollPosition: 0,
      error: {
        show: false,
        config: {
          noGoods: {
            button: '刷新一下',
            content: '抱歉，没有获取到数据呢',
            desc: '刷新一下试试'
          }
        }
      },
      forums: {
        selected: 0,
        assignId: -1,
        list: [],
        isLoadMore: false
      },
      threads: {
        currentPage: 1,
        list: []
      },
      config: {}
    }
  },
  created () {
    this.config = this.$site.config
    this.$event.on('reloadConfig', config => {
      this.config = config
    })
    this.$event.on('resetSite', siteName => {
      this.$site.currentSite = siteName
      this.forums.list = this.$site.favoriteForums
      this.forums.selected = 0
      this.threads.list = []
      this.error.show = true
    })
    // 初始化板块
    this.forums.list = this.$site.favoriteForums
    // 订阅重新加载事件
    this.$event.on('reloadForums', () => {
      this.forums.list = this.$site.favoriteForums
    })
    // 是否为指定板块
    this.$router.getParams().then(response => {
      // 是否为指定板块
      if (response.forumId) {
        this.forums.assignId = response.forumId
        this.$navigator.setNavigationInfo({
          title: response.forumName
        })
        // 标题栏右侧操作
        this.$navigator.setRightItem({
          image: 'bmlocal://assets/edit@2x.png'
        }, () => {
          this.$router.open({
            name: 'forum.reply',
            type: 'PUSH',
            gesBack: false,
            params: {
              forumId: response.forumId,
              forumName: response.forumName
            }
          })
        })
        // 回帖成功重新加载
        this.$event.on('postSuccess', () => {
          this.initLoadForum()
        })
      } else {
        this.forums.assignId = 0
      }
      this.initLoadForum()
    })
  },
  methods: {
    initLoadForum () {
      this.initLoading = true
      this.maxScrollPosition = 0
      this.threads.list = []
      this.threads.currentPage = 1
      this.$notice.loading.show('正在折越')
      this.error.show = false
      this.readForum().then(() => {
        this.$notice.loading.hide()
        this.initLoading = false
      }).catch(error => {
        this.$notice.loading.hide()
        this.initLoading = false
        this.error.show = true
      })
    },
    loadForum() {},
    renderList (event) {
      if (event.contentOffset.y < this.maxScrollPosition) {
        this.maxScrollPosition = event.contentOffset.y
        this.threads.list.push([{ type: 'text', value: 'temp' }])
        this.$nextTick(() => {
          this.threads.list.pop()
        })
      }
    },
    // 读取板块内容
    readForum () {
      return new Promise((resolve, reject) => {
        this.$fetch({
          method: 'GET',
          name: 'forum.read',
          data: {
            id: this.currentForumId,
            page: this.threads.currentPage
          }
        }).then(async response => {
          for (let item of response) {
            let threadHtml = await this.$html.parse(item.content)
            this.$set(item, 'contentList', threadHtml.list)

            for (let reply of item.replys) {
              let replyHtml = await this.$html.parse(reply.content)
              this.$set(reply, 'contentList', replyHtml.list)
            }
            this.threads.list.push(item)
          }
          resolve()
        }, error => {
          reject(error)
        })
      })
    },
    onRefresh () {
      this.initLoadForum()
    },
    onLoadMore () {
      if (this.threads.isLoadMore) {
        return
      }
      this.threads.currentPage++
      this.threads.isLoadMore = true
      this.readForum().then(response => {
        this.threads.isLoadMore = false
      }).catch(error => {
        this.threads.isLoadMore = false
      })
    },
    onThreadClick (threadId) {
      this.$router.open({
        name: 'forum.thread',
        type: 'PUSH',
        params: {
          threadId,
          forumName: this.forums.list[this.forums.selected].name
        }
      })
    },
    // 选择板块
    selectForum (index) {
      this.forums.selected = index
      if (index < 3) {
        index = 0
      } else {
        index = index - 2
      }
      dom.scrollToElement(this.$refs['forum-items'][index], {})
      // 切换板块
      this.currentForumId = this.forums.list[index].id
      this.initLoadForum()
    },
    showImage (path, ext) {
      let imgUrl = this.$site.getImageUrl(path, ext, 'image')
      img.previewImage({
        urls: [imgUrl],
        current: imgUrl
      })
    },
    openFavoriteManager () {
      this.$router.open({
        name: 'forum.favorite',
        type: 'PUSH',
        backgroundColor: '#fff'
      })
    }
  },
  computed: {
    // 当前浏览的板块ID
    currentForumId () {
      if (this.forums.assignId !== 0) {
        return this.forums.assignId
      } else if (this.forums.list.length === 0) {
        return -1
      } else {
        return this.forums.list[this.forums.selected].id
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.border-shadow {
  box-shadow: 1px 0px 15px #ccc;
  position: fixed;
  top: -20px;
  left: 0;
  right: 0;
  height: 20px;
  background-color: #fff;
}
.wrapper {
  background-color: #f7f8fa;
}
.forum {
  border-bottom-color: #f0f0f0;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  background-color: #fff;
  padding-bottom: 15px;
}
.forum-swich {
  padding-top: 65px;
  flex-direction: row;
  flex: 1;
  height: 125px;
}
.forum-item {
  min-width: 100px;
  justify-content: center;
  margin-left: 25px;
  padding-left: 20px;
  padding-right: 20px;
  margin-bottom: 6px;
}
.forum-item-active {
  background-color: #5993ff;
  border-radius: 35px;
}
.forum-item-text {
  font-size: 26px;
  text-align: center;
}
.forum-item-text-active {
  color: #fff;
}

.thread-item {
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 15px;
  padding-bottom: 10px;
}
.thread-card {
  background-color: #fff;
  box-shadow: 1px 0px 15px #e3e3e3;
  border-radius: 8px;
  padding: 24px;
}
.thread-info {
  margin-bottom: 10px;
}
.thread-replycount {
  position: absolute;
  right: 0px;
  top: 0px;
}
.thread-image {
  width: 200px;
  height: 200px;
  margin-top: 10px;
  margin-right: 20px;
  border-radius: 5px;
  border-style: solid;
  border-width: 1px;
  border-color: #f2f2f2;
}
.thread-time {
  flex: 1;
}
.thread-time-text {
  font-size: 19px;
  color: #666;
}
.thread-replycount-text {
  font-size: 22px;
  color: #666;
}

.reply-card {
  flex-direction: row;
  margin-top: 25px;
}
.reply-info {
  width: 120px;
  height: 70px;
  background-color: #e3e3e3;
  border-radius: 8px;
  padding-top: 10px;
}
.reply-info-text {
  font-size: 20px;
  text-align: center;
}
.reply-content {
  flex: 1;
  padding-left: 15px;
}
.tip-refresh {
  position: fixed;
  bottom: 25px;
  right: 25px;
}
</style>

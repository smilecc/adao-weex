<template>
  <div :class="$class('page')">
    <div :class="$class('banner')" ref="banner" v-if="!result.show">
      <div class="timeline-title">
        <text :class="$class('timeline-title-text')">时间线</text>
      </div>
      <div class="banner-button-group">
        <div class="banner-button" @click="showPostPop">
          <wxc-icon :icon-style="{ fontSize: '34px', color: appConfig.night ? '#fff' : '#000', fontWeight: '700' }" name="add"></wxc-icon>
          <text :class="$class('post-thread-text')"> 发串</text>
        </div>
      </div>
    </div>
    <!-- 发串弹窗 -->
    <wxc-popup
      popup-color="#fff"
      pos="top"
      :show="thread.showPostPop"
      @wxcPopupOverlayClicked="thread.showPostPop = false"
    >
      <div :class="$class('post-tips')">
        <text :class="$class('post-tips-text')">请选择一个版块</text>
      </div>
      <forum-list type="post" :border-top="false" class="pop-menu"></forum-list>
    </wxc-popup>
    <list
      ref="list"
      class="list"
      :showRefresh="true"
      :show-scrollbar="false"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
      :loadmoreoffset="2000"
      @scroll="renderList"
      :offset-accuracy="300"
    >
      <cell class="thread-item" v-for="(thread, tIndex) in thread.list" :key="tIndex">
        <div :class="$class('thread-card')" @click="onThreadClick(thread.id, getForumName(thread.fid))">
          <!-- 串介绍 -->
          <div class="thread-info">
            <div class="thread-info-forum"><text style="font-size: 22px; color: #fff">{{ getForumName(thread.fid) }}</text></div>
            <div class="thread-info-content">
              <text :class="$class('thread-info-text', 'thread-userid')">  {{ thread.userid }}</text>
              <text :class="$class('thread-info-text', 'thread-time')">{{ thread.now }}</text>
              <div class="thread-info-replycount">
                <text :class="$class('thread-info-text')" style="text-align: right">{{ thread.replyCount }}</text>
              </div>
            </div>
          </div>
          <!-- 串内容 -->
          <div class="thread-content">
            <w-html class="thread-text" :list="thread.contentList"></w-html>
            <image
              v-if="config.displayImage && thread.img"
              class="thread-image"
              resize="contain"
              :src="$site.getImageUrl(thread.img, thread.ext)"
              @click="showImage(thread.img, thread.ext)"
            >
            </image>
          </div>
        </div>
      </cell>
    </list>
    <div class="tip-refresh">
      <wxc-part-loading :width="55" :height="55" :show="thread.loading"></wxc-part-loading>
    </div>
    <wxc-result
      :type="result.type"
      :show="result.show"
      @wxcResultButtonClicked="onResultClick"
      padding-top="232"
    >
    </wxc-result>
  </div>
</template>

<script>
import { WxcIcon, WxcPartLoading, WxcPopup, WxcResult } from 'weex-ui'
import WHtml from '../components/w-html'
const img = weex.requireModule('imagePicker')
import ForumList from './list'
export default {
  components: {
    WxcIcon,
    WHtml,
    WxcPartLoading,
    WxcPopup,
    ForumList,
    WxcResult
  },
  data () {
    return {
      listenConfig: true,
      maxScrollPosition: 0,
      result: {
        show: false,
        type: 'noNetwork',
        onAppearReload: false
      },
      thread: {
        list: [],
        loaded: {},
        currentPage: 1,
        loading: false,
        showPostPop: false
      },
      forums: {},
      config: {}
    }
  },
  mounted () {
    // 设置配置
    this.config = this.$site.config
    this.$event.on('reloadConfig', config => {
      this.thread.list = []
      this.result.onAppearReload = true
      this.config = config
    })
    this.initLoad()
  },
  methods: {
    initLoad () {
      let networkStatus = this.$tools.networkStatus()
      if (networkStatus === 'NOT_REACHABLE') {
        this.result.type = 'noNetwork'
        this.result.show = true
        return
      } else {
        this.result.show = false
      }
      this.$site.forums.then(forums => {
        this.$notice.loading.show('正在折越')
        for (let forumGroup of forums) {
          for (let forum of forumGroup.forums) {
            if (forum.id > 0) {
              this.forums[forum.id] = forum
            }
          }
        }
        this.loadData().then(response => {
          this.$notice.loading.hide()
        }).catch(error => {
          this.$notice.loading.hide()
        })
      })
    },
    onRefresh () {
      this.thread.list = []
      this.thread.loaded = {}
      this.thread.currentPage = 1
      this.maxScrollPosition = 0
      this.thread.loading = false
      this.loadData().then(response => {
        this.$refs["list"].refreshEnd()
      }).catch(error => {
        this.$refs["list"].refreshEnd()
      })
    },
    renderList (event) {
      if (event.contentOffset.y < this.maxScrollPosition) {
        this.maxScrollPosition = event.contentOffset.y
        this.thread.list.push([{ type: 'text', value: 'temp' }])
        this.$nextTick(() => {
          this.thread.list.pop()
        })
      }
    },
    loadData () {
      return new Promise((resolve, reject) => {
        this.$fetch({
          method: 'GET',
          name: 'forum.timeline',
          data: {
            page: this.thread.currentPage
          }
        }).then(async response => {
          for (let item of response) {
            let threadHtml = await this.$html.parse({
              content: item.content,
              limit: {
                line: 5,
                length: 60
              }
            })
            this.$set(item, 'contentList', threadHtml.list)
            // 去除重复
            if (!this.thread.loaded[item.id]) {
              this.thread.loaded[item.id] = true
              this.thread.list.push(item)
            }
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    onThreadClick (threadId, forumName) {
      this.$router.open({
        name: 'forum.thread',
        type: 'PUSH',
        backgroundColor: this.appConfig.night ? '#222' : '',
        params: {
          threadId,
          forumName
        }
      })
    },
    onLoadMore () {
      if (this.thread.loading) {
        return
      }
      this.thread.currentPage++
      this.thread.loading = true
      this.loadData().then(response => {
        this.thread.loading = false
      }).catch(error => {
        this.thread.loading = false
      })
    },
    getForumName (forumId) {
      let forum = this.forums[forumId]
      if (forum) {
        return forum.name
      } else {
        return '未知'
      }
    },
    showImage (path, ext) {
      let imgUrl = this.$site.getImageUrl(path, ext, 'image')
      img.previewImage({
        urls: [imgUrl],
        current: imgUrl
      })
    },
    onResultClick () {
      if (this.result.type === 'noNetwork') {
        this.$router.refresh()
      }
    },
    showPostPop () {
      this.$notice.loading.show('正在折越')
      this.thread.showPostPop = true
    }
  },
  eros: {
    beforeBackAppear () {
      this.$notice.loading.hide()
      if (this.result.onAppearReload) {
        this.result.onAppearReload = false
        this.$router.refresh()
      }
      this.__initConfig(this.appConfig)
    }
  }
}
</script>

<style>
.page {
  padding-top: 165px;
  /* padding-bottom: 165px; */
}
.page-night {
  background-color: #222;
}
.banner {
  background-color: #fff;
  padding: 35px;
  padding-top: 70px;
  padding-bottom: 25px;
  flex-direction: row;
  box-shadow: 1px 0px 15px #ccc;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}
.banner-night {
  background-color: #222;
  box-shadow: 0 0 0 #000;
}
.timeline-title-text {
  font-size: 55px;
  font-weight: 700;
}
.timeline-title-text-night {
  color: #fff;
}
.post-thread-text-night {
  color: #fff;
}
.banner-button-group {
  flex: 1;
  margin-top: 18px;
}
.banner-button {
  flex-direction: row;
  justify-content: flex-end;
}

.thread-item {
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 16px;
  padding-bottom: 10px;
}
.thread-card {
  background-color: #fff;
  box-shadow: 1px 0px 15px #e3e3e3;
  border-radius: 8px;
  padding: 20px;
}
.thread-card-night {
  background-color: #444;
  box-shadow: 1px 0px 15px #222;
}
.thread-info {
  flex-direction: row;
}
.thread-info-content {
  flex-direction: row;
  padding-top: 2px;
  flex: 1;
}
.thread-info-forum {
  background-color: #a1a1a1;
  border-radius: 20px;
  padding: 1px 9px;
}
.thread-info-text {
  font-size: 22px;
  color: #666;
}
.thread-info-text-night {
  color: #c1c1c1;
}
.thread-userid {
  width: 140px;
}
.thread-info-replycount {
  flex: 1;
  padding-top: 2px;
}

.list {
  padding-top: 7px;
  padding-bottom: 20px;
}
.thread-content {
  margin: 0 2px;
  margin-top: 10px;
  flex-direction: row;
}
.thread-text {
  flex: 1;
  padding-left: 7px;
}
.thread-image {
  width: 150px;
  height: 150px;
}

.refresh {
  justify-content: center;
  background-color: #666;

}
.indicator {
  color: #000;
  text-align: center;
}
.tip-refresh {
  position: fixed;
  bottom: 25px;
  right: 25px;
}
.pop-menu {
}
.post-tips {
  background-color: #fff;
  padding-top: 60px;
  padding-left: 25px;
}
.post-tips-night {
  background-color: #333;
}
.post-tips-text {
  color: #000;
}
.post-tips-text-night {
  color: #fff;
}
</style>

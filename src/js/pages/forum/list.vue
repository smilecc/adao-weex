<template>
  <scroller class="page" :class="[ borderTop ? 'page-border-top' : '' ]">
    <div v-for="(group, gIndex) in groups" :key="gIndex" v-if="group.forums.length != 0">
      <div class="group-title">
        <text class="group-title-text">{{ group.title }}</text>
      </div>
      <wxc-grid-select
        :single="true"
        :list="group.forums"
        @select="onSelect"
      >
      </wxc-grid-select>
    </div>
  </scroller>
</template>

<script>
import { WxcGridSelect } from 'weex-ui'
export default {
  components: {
    WxcGridSelect
  },
  props: {
    type: {
      type: String,
      default: 'list'
    },
    borderTop: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      groups: []
    }
  },
  created () {
    this.$notice.loading.show('正在折越')
    // 初始化列表
    this.$site.forums.then(forums => {
      this.groups = forums.map(group => {
        return {
          title: group.name,
          forums: group.forums.filter(forum => forum.id > 0).map(forum => {
            return {
              id: forum.id,
              title: forum.name
            }
          })
        }
      })
      this.$notice.loading.hide()
    })
  },
  methods: {
    onSelect ({selectIndex, checked, checkedList}) {
      let forum = checkedList[0]
      forum.checked = false
      if (this.type === 'list') {
        this.$router.open({
          name: 'forum.index',
          type: 'PUSH',
          params: {
            forumId: forum.id,
            forumName: forum.title
          }
        })
      } else if (this.type === 'post') {
        this.$router.open({
          name: 'forum.reply',
          type: 'PUSH',
          gesBack: false,
          params: {
            forumId: forum.id,
            forumName: forum.title
          }
        })
      }
    }
  }
}
</script>

<style>
.page {
  padding: 0 20px;
  background-color: #fff;
}
.page-border-top {
  border-top-color: #dfdfdf;
  border-top-style: solid;
  border-top-width: 1px;
}
.group-title {
  margin-top: 23px;
  margin-bottom: 10px;
  margin-left: 3px;
  padding: 10px 15px;
  border-left-style: solid;
  border-left-color: red;
  border-left-width: 8px;
}
.group-title-text {
  font-size: 22px;
}
</style>

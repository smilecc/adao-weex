<template>
  <scroller :class="$class('page', borderTop ? 'page-border-top' : '')">
    <div v-for="(group, gIndex) in groups" :key="gIndex" v-if="group.forums.length != 0">
      <div class="group-title">
        <text :class="$class('group-title-text')">{{ group.title }}</text>
      </div>
      <wxc-grid-select
        :single="true"
        :list="group.forums"
        @select="onSelect"
        :custom-styles="gridStyles"
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
      listenConfig: true,
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
          backgroundColor: this.appConfig.night ? '#222' : '',
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
          backgroundColor: this.appConfig.night ? '#333' : '',
          params: {
            forumId: forum.id,
            forumName: forum.title
          }
        })
      }
    }
  },
  computed: {
    gridStyles () {
      if (this.appConfig.night) {
        return {
          backgroundColor: '#555',
          color: '#ddd'
        }
      } else {
        return {

        }
      }
    }
  },
  eros: {
    beforeBackAppear () {
      this.__initConfig(this.appConfig)
    }
  }
}
</script>

<style>
.page {
  padding: 0 20px;
  background-color: #fff;
}
.page-night {
  background-color: #333;
  border-top-width: 0px;
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
  color: #000;
}
.group-title-text-night {
  color: #fff;
}
</style>

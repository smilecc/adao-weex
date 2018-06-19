<template>
  <scroller class="page">
    <div  v-for="(group, gIndex) in groups" :key="gIndex" v-if="group.forums.length != 0">
      <div class="group-title">
        <text class="group-title-text">{{ group.title }}</text>
      </div>
      <wxc-grid-select
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
  data () {
    return {
      groups: [],
      checkedList: []
    }
  },
  created () {
    this.$notice.loading.show('正在折越')
    this.$navigator.setRightItem({
      image: 'bmlocal://assets/check@2x.png'
    }, () => {
      this.$site.favoriteForums = this.checkedList.map(forum => {
        return {
          id: forum.id,
          name: forum.title
        }
      })
      this.$event.emit('reloadForums')
      this.$notice.toast({ message: '保存成功' })
      this.$router.back()
    })
    // 获取当前列表
    this.checkedList = this.$site.favoriteForums.map(item => {
      return {
        id: item.id,
        title: item.name
      }
    })
    // 初始化列表
    this.$site.forums.then(forums => {
      this.groups = forums.map(group => {
        return {
          title: group.name,
          forums: group.forums.filter(forum => forum.id > 0).map(forum => {
            let checked = this.checkedList.findIndex(item => item.id == forum.id) !== -1
            return {
              id: forum.id,
              title: forum.name,
              checked
            }
          })
        }
      })
      this.$notice.loading.hide()
    })
  },
  methods: {
    onSelect ({selectIndex, checked, checkedList}) {
      this.checkedList = checkedList
    }
  }
}
</script>

<style>
.page {
  padding: 0 20px;
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

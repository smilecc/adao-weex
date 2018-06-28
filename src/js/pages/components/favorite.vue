<template>
  <wxc-popup
    ref="pop"
    popup-color="#fff"
    pos="bottom"
    :show="show"
    @wxcPopupOverlayClicked="onClose"
  >
    <wxc-minibar
      title="收藏串"
      left-text="取消"
      right-text="确定"
      background-color="#F2F3F4"
      @wxcMinibarLeftButtonClicked="onClose"
      @wxcMinibarRightButtonClicked="onSave"
      :use-default-return="false"
    >
    </wxc-minibar>
    <scroller>
      <wxc-checkbox-list :list="favorite.list" @wxcCheckBoxListChecked="onCheck"></wxc-checkbox-list>
    </scroller>
  </wxc-popup>
</template>

<script>
import { WxcCheckboxList, WxcPopup, WxcMinibar } from 'weex-ui'
export default {
  components: {
    WxcCheckboxList,
    WxcPopup,
    WxcMinibar
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    threadId: {
      type: [Number, String],
      default: 0
    },
    threadTitle: {
      type: String,
      default: ''
    },
    forumName: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      favorite: {
        list: [],
        maxId: 0
      },
      empty: false,
      checkedList: []
    }
  },
  mounted () {
    let favorite = this.$storage.getSync('myFavorite')
    if (favorite) {
      this.favorite = favorite
      if (favorite.list.length == 0) {
        this.empty = true
      }
    } else {
      this.empty = true
    }
    // 为空的话初始化一个默认收藏夹
    if (this.empty) {
      this.favorite = {
        list: [{
          id: 1,
          value: 1,
          title: '默认收藏夹',
          time: (new Date()).toLocaleString('zh-CN'),
          list: []
        }],
        maxId: 1
      }
      this.$storage.setSync('myFavorite', this.favorite)
    }
  },
  methods: {
    initData () {
      for (let folder of this.favorite.list) {
        let index = folder.list.findIndex(thread => {
          return thread.id == this.threadId
        })
        this.$set(folder, 'checked', index !== -1)
        if (index !== -1) {
          this.checkedList.push[folder.id]
        }
      }
    },
    onClose () {
      this.$refs.pop.hide()
      setTimeout(() => {
        this.$emit('update:show', false)
      }, 200)
    },
    onSave () {
      for (let folder of this.favorite.list) {
        // 检查是否选中
        let checked = this.checkedList.findIndex(item => item === folder.id) !== -1
        // 查找是否在收藏夹中
        let index = folder.list.findIndex(thread => {
          return thread.id == this.threadId
        })
        if (checked) {
          // 选中
          if (index === -1) {
            // 未在该收藏夹里面 插入
            folder.list.push({
              id: this.threadId,
              title: this.threadTitle,
              forumName: this.forumName,
              siteName: this.$site.currentSite.name,
              time: (new Date()).toLocaleString('zh-CN')
            })
          }
        } else {
          // 未选中
          if (index !== -1) {
            // 已在收藏夹中 移除
            folder.list.splice(index, 1)
          }
        }
        delete folder.checked
      }
      this.$storage.setSync('myFavorite', this.favorite)
      this.$notice.toast({ message: '收藏成功' })
      this.onClose()
    },
    onCheck ({ checkedList }) {
      this.checkedList = checkedList
    }
  },
  watch: {
    show (newVal) {
      if (newVal) {
        this.initData()
      }
    }
  }
}
</script>

<style>

</style>

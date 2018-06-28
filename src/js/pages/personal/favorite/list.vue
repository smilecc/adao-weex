<template>
  <scroller>
    <wxc-cell
      v-for="(thread, tIndex) in currentFolderList"
      :key="tIndex"
      :title="thread.title"
      :desc="`${thread.forumName} | No.${thread.id} | ${thread.time}`"
      :has-arrow="true"
      @wxcCellClicked="onCellClick(thread)"
    >
    </wxc-cell>
    <wxc-result
      type="noGoods"
      :custom-set="noCookieResult"
      :show="folderId !== 0 && currentFolderList.length === 0"
      padding-top="232"
    >
    </wxc-result>
  </scroller>
</template>

<script>
import { WxcCell, WxcResult } from 'weex-ui'
const actionSheet = weex.requireModule('actionSheet')
const modal = weex.requireModule('modal')
export default {
  components: {
    WxcCell,
    WxcResult
  },
  data () {
    return {
      folderId: 0,
      favorite: {
        list: [],
        maxId: 0
      },
      noCookieResult: {
        noGoods: {
          button: null,
          content: '哎呀呀',
          desc: '这个收藏夹还没有内容呢'
        }
      }
    }
  },
  created () {
    this.loadData()
  },
  methods: {
    loadData () {
      this.$notice.loading.show('正在加载')
      this.$router.getParams().then(response => {
        this.folderId = response.folderId
        this.favorite = this.$storage.getSync('myFavorite')
        this.$notice.loading.hide()
      })
    },
    onCellClick (thread) {
      actionSheet.create({
        title: '操作收藏',
        message: thread.title,
        items: [{
          type: 0,
          message: '打开'
        }, {
          type: 0,
          message: '重命名'
        }, {
          type: 2,
          message: '删除'
        }, {
          type: 1,
          message: '取消'
        }]
      }, result => {
        if (result.result === 'success') {
          if (result.data.index === 0) {
            // 打开收藏
            this.$router.open({
              name: 'forum.thread',
              type: 'PUSH',
              params: {
                threadId: thread.id,
                forumName: thread.forumName
              }
            })
          } else if (result.data.index === 1) {
            // 重命名收藏
            modal.prompt({
              message: '重命名[' + thread.title + ']',
              okTitle: '修改',
              cancelTitle: '取消'
            }, value => {
              if (value.result === '修改') {
                if (value.data) {
                  thread.title = value.data
                  this.save()
                  this.$notice.toast({ message: '修改成功' })
                } else {
                  this.$notice.alert({ message: '名称不能为空' })
                }
              }
            })
          } else if (result.data.index === 2) {
            // 删除收藏
            this.$notice.confirm({
              title: '删除[' + thread.title + ']',
              message: '是否确认要删除，操作后不可撤销？',
              okCallback: () => {
                let threadIndex = this.currentFolderList.findIndex(item => {
                  return item.id === thread.id
                })
                this.currentFolderList.splice(threadIndex, 1)
                this.save()
                this.$notice.toast({ message: '删除成功' })
              }
            })
          }
        }
      })
    },
    save () {
      this.$storage.setSync('myFavorite', this.favorite)
    }
  },
  computed: {
    currentFolderList () {
      if (this.folderId !== 0) {
        let folder = this.favorite.list.find(item => {
          return item.id === this.folderId
        })
        if (folder) {
          return folder.list
        } else {
          return []
        }
      } else {
        return []
      }
    }
  }
}
</script>

<style>

</style>

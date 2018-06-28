<template>
  <scroller>
    <wxc-cell
      v-for="(draft, index) in drafts.list"
      :key="index"
      :title="getTitle(draft.content)"
      :desc="getDesc(draft)"
      :has-arrow="true"
      @wxcCellClicked="onCellClick(draft, index)"
    >
    </wxc-cell>
    <wxc-result
      type="noGoods"
      :custom-set="noCookieResult"
      :show="isEmpty && drafts.list.length === 0"
      padding-top="232"
    >
    </wxc-result>
  </scroller>
</template>

<script>
import { WxcCell, WxcResult } from 'weex-ui'
const actionSheet = weex.requireModule('actionSheet')
export default {
  components: {
    WxcCell,
    WxcResult
  },
  data () {
    return {
      drafts: {
        list: [],
        maxId: 0
      },
      isEmpty: false,
      noCookieResult: {
        noGoods: {
          button: null,
          content: '哎呀呀',
          desc: '草稿箱还没有内容呢'
        }
      }
    }
  },
  mounted () {
    // this.$storage.delete('myDrafts')
    this.initData()
    // 当发表的时候 删除草稿
    this.$event.on('deleteDrafts', draft => {
      let draftIndex = this.drafts.list.findIndex(item => {
        return draft.id === item.id
      })
      this.drafts.list.splice(draftIndex, 1)
      this.save()
    })
    // 重新保存草稿
    this.$event.on('saveDrafts', draft => {
      let findDraft = this.drafts.list.find(item => {
        return draft.id === item.id
      })
      findDraft.content = draft.content
      this.save()
    })
  },
  methods: {
    initData () {
      let drafts = this.$storage.getSync('myDrafts')
      if (drafts) {
        this.drafts = drafts
      } else {
        this.drafts = {
          list: [],
          maxId: 0
        }
      }
      if (this.drafts.list.length === 0) {
        this.isEmpty = true
      }
    },
    getTitle (content) {
      if (content) {
        if (content.length > 15) {
          return content.replace(/\n/g, ' ').substr(0, 15) + '...'
        } else {
          return content.replace(/\n/g, ' ')
        }
      } else {
        return '无标题'
      }
    },
    getDesc (draft) {
      if (draft.forumId) {
        return `${draft.forumName} | ${draft.time}`
      } else {
        return `No.${draft.threadId} | ${draft.time}`
      }
    },
    onCellClick (draft, index) {
      actionSheet.create({
        title: '操作草稿',
        message: this.getTitle(draft.content),
        items: [{
          type: 0,
          message: '编辑'
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
            // 编辑
            let params = {}
            if (draft.forumId) {
              params = {
                forumId: draft.forumId,
                forumName: draft.forumName
              }
            } else {
              params = {
                threadId: draft.threadId
              }
            }
            params.content = draft.content
            params.draftId = draft.id
            // 跳转路由
            this.$router.open({
              name: 'forum.reply',
              type: 'PUSH',
              gesBack: false,
              params
            })
          } else if (result.data.index === 1) {
            // 删除
            this.drafts.list.splice(index, 1)
          }
        }
      })
    },
    save () {
      this.$storage.setSync('myDrafts', this.drafts)
    }
  }
}
</script>

<style>

</style>

<template>
  <scroller class="page">
    <swipe-cell
      v-for="(folder, fIndex) in favorite.list"
      :key="fIndex"
      :title="folder.title"
      :items="cellActions"
      @click="openFolder(folder)"
      @actionClick="index => onActionClick(folder, index)"
    >
    </swipe-cell>
  </scroller>
</template>

<script>
import SwipeCell from '../../components/swipe-cell'
const modal = weex.requireModule('modal')
export default {
  components: {
    SwipeCell
  },
  data () {
    return {
      favorite: {
        list: [],
        maxId: 0
      },
      cellActions: [{
        'title': '取消',
        'bgcolor' : '#c6c7c8'
      }, {
        'title': '删除',
        'bgcolor' : '#fa3300'
      }, {
        'title': '重命名',
        'bgcolor' : '#f2a139'
      }]
    }
  },
  created () {
    // 标题栏操作按钮
    this.$navigator.setRightItem({
      image: 'bmlocal://assets/plus@2x.png'
    }, this.createFolder)
    // 初始化数据
    this.favorite = this.loadData()
    // this.$notice.alert({ message: JSON.stringify(this.favorite) })
  },
  methods: {
    loadData () {
      let favorite = this.$storage.getSync('myFavorite')
      if (favorite) {
        return favorite
      } else {
        return {
          list: [],
          maxId: 0
        }
      }
    },
    // 创建收藏夹
    createFolder () {
      modal.prompt({
        message: '请输入收藏夹名称',
        okTitle: '创建',
        cancelTitle: '取消'
      }, value => {
        if (value.result === '创建') {
          if (value.data) {
            this.appendFolder(value.data)
            this.$notice.toast({ message: '创建成功' })
          } else {
            this.$notice.alert({ message: '收藏夹名称不能为空' })
          }
        }
      })
    },
    onActionClick (folder, index) {
      if (index === 1) {
        // 删除
        this.$notice.confirm({
          title: '删除[' + folder.title + ']',
          message: '是否确认要删除，操作后不可撤销？',
          okCallback: () => {
            this.removeFolder(folder.id)
            this.$notice.toast({ message: '删除成功' })
          }
        })
      } else if (index === 2) {
        // 重命名
        modal.prompt({
          message: '重命名[' + folder.title + ']',
          okTitle: '修改',
          cancelTitle: '取消'
        }, value => {
          if (value.result === '修改') {
            if (value.data) {
              this.renameFolder(folder.id, value.data)
              this.$notice.toast({ message: '修改成功' })
            } else {
              this.$notice.alert({ message: '收藏夹名称不能为空' })
            }
          }
        })
      }
    },
    appendFolder (folderName) {
      this.favorite.maxId++
      this.favorite.list.push({
        id: this.favorite.maxId,
        value: this.favorite.maxId,
        title: folderName,
        time: (new Date()).toLocaleString('zh-CN'),
        list: []
      })
      this.save()
    },
    // 删除收藏夹
    removeFolder (folderId) {
      let folderIndex = this.favorite.list.findIndex(item => {
        return item.id === folderId
      })
      this.favorite.list.splice(folderIndex, 1)
      this.save()
    },
    // 重命名收藏夹
    renameFolder (folderId, newName) {
      let folder = this.favorite.list.find(item => {
        return item.id === folderId
      })
      folder.title = newName
      this.save()
    },
    // 保存收藏夹
    save () {
      this.$storage.setSync('myFavorite', this.favorite)
    },
    // 打开收藏夹详情
    openFolder (folder) {
      this.$router.open({
        name: 'personal.favorite.list',
        type: 'PUSH',
        navTitle: folder.title,
        params: {
          folderId: folder.id
        }
      })
    }
  }
}
</script>

<style>
.page {
  border-top-color: #f0f0f0;
  border-top-style: solid;
  border-top-width: 1px;
}
</style>

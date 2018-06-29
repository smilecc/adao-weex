<template>
  <div>
    <div class="type">
      <scroller :show-scrollbar="false" scroll-direction="horizontal" class="type-swich">
        <div
          ref="type-items"
          v-for="(item, index) in typeList"
          :key="index"
          @click="selectType(index)"
          class="type-item"
          :class="[ type.selected === index ? 'type-item-active' : '' ]"
        >
          <text class="type-item-text" :class="[ type.selected === index ? 'type-item-text-active' : '' ]">{{ item.title }}</text>
        </div>
      </scroller>
    </div>
    <list>
      <cell v-for="(record, rIndex) in historyList" :key="rIndex" class="record-item" @click="onCellClick(record)">
        <div class="record-card">
          <div class="record-body">
            <div class="record-info">
              <div class="record-info-forum"><text style="font-size: 22px; color: #fff">{{ record.type === 'visit' ? '浏览' : '回复' }}</text></div>
              <div class="record-info-content">
                <text class="record-info-text">  {{ record.forumName }}</text>
                <text class="record-info-text record-threadid"> No.{{ record.threadId }}</text>
                <text class="record-info-text record-time"> {{ record.time }}</text>
              </div>
            </div>
            <div class="record-thread-content">
              <text style="lines: 4; font-size: 28px" :value="record.threadContent"></text>
            </div>
          </div>
          <div class="record-post" v-if="record.type === 'reply'">
            <text style="font-size: 22px; color: #666">我的回复</text>
            <text style="font-size: 29px" :value="record.postContent"></text>
          </div>
        </div>
      </cell>
    </list>
  </div>
</template>

<script>
import WHtml from '../components/w-html'
export default {
  components: {
    WHtml
  },
  data () {
    return {
      typeList: [{
        title: '全部',
        type: 'all'
      }, {
        title: '浏览',
        type: 'visit'
      }, {
      //   title: '发串',
      //   type: 'post'
      // }, {
        title: '回复',
        type: 'reply'
      }],
      type: {
        selected: 0
      },
      history: {
        list: [],
        maxId: 0
      }
    }
  },
  created () {
    this.initData()
  },
  methods: {
    initData () {
      let currentSite = this.$site.currentSite
      let history = this.$storage.getSync('myHistory:' + currentSite.name)
      if (history) {
        this.history = history
      }
    },
    selectType (typeIndex) {
      this.type.selected = typeIndex
    },
    onCellClick (record) {
      this.$router.open({
        name: 'forum.thread',
        type: 'PUSH',
        params: {
          threadId: record.threadId,
          forumName: record.forumName
        }
      })
    }
  },
  computed: {
    historyList () {
      let currentType = this.typeList[this.type.selected]
      if (currentType.type === 'all') {
        return this.history.list
      }
      return this.history.list.filter(item => {
        return item.type === currentType.type
      })
    }
  }
}
</script>

<style>
.type {
  border-bottom-color: #f0f0f0;
  border-bottom-style: solid;
  border-bottom-width: 1px;
  background-color: #fff;
  padding-bottom: 15px;
}
.type-swich {
  padding-top: 10px;
  flex-direction: row;
  flex: 1;
  height: 70px;
}
.type-item {
  min-width: 100px;
  justify-content: center;
  margin-left: 25px;
  padding-left: 20px;
  padding-right: 20px;
  margin-bottom: 6px;
}
.type-item-active {
  background-color: #5993ff;
  border-radius: 35px;
}
.type-item-text {
  font-size: 26px;
  text-align: center;
}
.type-item-text-active {
  color: #fff;
}

.record-item {
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 16px;
  padding-bottom: 10px;
}
.record-card {
  background-color: #fff;
  box-shadow: 1px 0px 15px #e3e3e3;
  border-radius: 8px;
  padding: 0;
}
.record-body {
  padding: 20px;
  padding-bottom: 10px;
}
.record-info {
  flex-direction: row;
}
.record-info-content {
  flex-direction: row;
  padding-top: 2px;
  flex: 1;
}
.record-info-forum {
  background-color: #a1a1a1;
  border-radius: 20px;
  padding: 1px 9px;
}
.record-info-text {
  font-size: 22px;
  color: #666;
}
.record-threadid {
  padding-top: 2px;
}
.record-thread-content {
  margin-top: 20px;
  padding-bottom: 10px;
}
.record-post {
  background-color: #ddd;
  padding: 20px;
  padding-bottom: 11px;
  border-radius: 8px;
}
</style>

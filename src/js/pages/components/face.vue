<template>
  <wxc-popup
    ref="pop"
    popup-color="#fff"
    pos="bottom"
    :animation="popAnimation"
    :show="show"
    @wxcPopupOverlayClicked="onCancel"
  >
    <wxc-minibar
      title="颜文字"
      left-text="取消"
      background-color="#F2F3F4"
      @wxcMinibarLeftButtonClicked="onCancel"
      :use-default-return="false"
    >
    </wxc-minibar>
    <scroller class="face-scroller">
      <div class="face-title" v-if="ofenList.length > 0">
        <text class="face-title-text">最近使用</text>
      </div>
      <div class="face-fall" v-if="ofenList.length > 0">
        <div v-for="(face, fIndex) in ofenList" :key="fIndex" class="face-item" @click="onClickFace(face)">
          <text>{{ face.text }}</text>
        </div>
      </div>
      <div class="face-title">
        <text class="face-title-text">全部表情</text>
      </div>
      <div class="face-fall">
        <div v-for="(face, fIndex) in faceList" :key="fIndex" class="face-item" @click="onClickFace(face)">
          <text>{{ face.text }}</text>
        </div>
      </div>
    </scroller>
  </wxc-popup>
</template>

<script>
import { WxcCheckboxList, WxcPopup, WxcMinibar } from 'weex-ui'
import FaceList from './faceList'
export default {
  components: {
    WxcPopup,
    WxcMinibar
  },
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      popAnimation: {
        duration: 250,
        timingFunction: 'ease-in'
      },
      faceList: FaceList,
      ofenList: []
    }
  },
  mounted () {
    let ofenList = this.$storage.getSync('ofenFace')
    if (ofenList) {
      this.ofenList = ofenList
    } else {
      this.ofenList = []
    }
  },
  methods: {
    onCancel () {
      this.$emit('cancel')
      this.onClose()
    },
    onClose () {
      this.$refs.pop.hide()
      setTimeout(() => {
        this.$emit('update:show', false)
      }, 200)
    },
    onSave () {
      this.onClose()
    },
    onClickFace (face) {
      this.$emit('select', face)
      // 保存到最近使用
      let faceIndex = this.ofenList.findIndex(item => {
        return item.text === face.text
      })
      if (faceIndex !== -1) {
        this.ofenList.splice(faceIndex, 1)
      }
      this.ofenList = [
        face,
        ...this.ofenList.slice(0, 9)
      ]
      this.$storage.setSync('ofenFace', this.ofenList)
      this.onClose()
    }
  }
}
</script>

<style>
.face-scroller {
  background-color: #eaeaea;
}
.face-title {
  padding: 10px;
  padding-top: 20px;
  padding-left: 30px;
  padding-bottom: 0px;
}
.face-title-text {
  font-size: 23px;
  color: #888;
}
.face-fall {
  padding: 20px;
  padding-right: 0px;
  flex-direction: row;
  flex-wrap: wrap;
  /* justify-content: space-around; */
}
.face-item {
  flex: 1 1 160px;
  padding: 15px 30px;
  background-color: #fff;
  border-style: solid;
  border-color: #dfdfdf;
  border-width: 1px;
  border-radius: 50px;
  margin-bottom: 20px;
  margin-right: 20px;
  height: 75px;
}
</style>

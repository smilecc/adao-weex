<template>
  <div @appear="repaint">
    <div v-for="(line, lIndex) in list" :key="lIndex" style="margin-top: 8px">
      <bmrichtext ref="richText" style="line-height: 37px">
        <div v-for="(element, eIndex) in line.list" :key="eIndex">
          <bmspan
            v-if="element.type == 'link'"
            class="link"
            :value="element.value"
            :style="element.style ? element.style : {}"
            @click="onLinkClick(element)"
          >
          </bmspan>
          <bmspan
            v-else
            :value="element.value"
            :style="element.style ? element.style : {}"
          >
          </bmspan>
        </div>
      </bmrichtext>
      <div v-if="isQuote(line)" class="quote">
        <bmrichtext class="quote-text" v-if="getQuote(line).id > 0">
          <bmspan :value="getQuote(line).content"></bmspan>
        </bmrichtext>
        <bmrichtext class="quote-text" v-else>
          <bmspan value="未找到该串"></bmspan>
        </bmrichtext>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    list: {
      type: Array
    },
    replys: {
      type: Array
    }
  },
  data () {
    return {
      quote: {}
    }
  },
  methods: {
    onLinkClick (element) {
      this.$router.openBrowser(element.href)
    },
    isQuote (line) {
      if (this.replys) {
        return /No\.(\d+)/.test(line.text)
      } else {
        return false
      }
    },
    getQuote (line) {
      // 先从缓存中查找
      if (line.text in this.quote) {
        return this.quote[line.text]
      } else {
        let matchList = line.text.match(/No\.(\d+)/)
        let reply = {
          id: 0,
          userid: '',
          now: '',
          content: ''
        }
        // 匹配串号
        if (matchList.length < 2) {
          this.quote[line.text] = reply
          return reply
        }
        reply.id = matchList[1]
        // 查找串
        let currentReply = this.replys.find(element => {
          return element.id == reply.id
        })
        // 未找到串
        if (!currentReply) {
          reply.id = 0
          this.quote[line.text] = reply
          return reply
        }
        reply.id = currentReply.id
        reply.userid = currentReply.userid
        reply.now = currentReply.now
        reply.content = currentReply.contentText
        this.quote[line.text] = reply
        return reply
      }
    },
    repaint () {
      for (let rt of this.$refs['richText']) {
        rt.updateRichText()
        console.log('repaint')
      }
    }
  }
}
</script>

<style scoped>
.link {
  color: blue;
}
.quote {
  background-color: #eee;
  padding: 10px;
  border-radius: 5px;
  margin-top: 2px;
  margin-bottom: 5px;
}
.quote-text {
  font-size: 22px;
  color: #666;
}
</style>


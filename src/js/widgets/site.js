const Site = Object.create(null)

Site.install = (Vue, options) => {
  var _site = null
  var _config = null
  Vue.prototype.$site = {
    get currentSite () {
      if (_site === null) {
        let siteName = Vue.prototype.$storage.getSync('currentSite')
        if (siteName) {
          _site = options.sites[siteName]
        } else {
          _site = options.sites[options.default]
        }
      }
      return _site
    },
    set currentSite (siteName) {
      Vue.prototype.$storage.setSync('currentSite', siteName)
      _site = options.sites[siteName]
    },
    get baseUrl () {
      return this.currentSite.domain
    },
    get favoriteForums () {
      let currentSite = this.currentSite
      let favoriteForums = Vue.prototype.$storage.getSync('favoriteForums:' + currentSite.name)
      if (favoriteForums) {
        return favoriteForums
      } else {
        return currentSite.defaultForums
      }
    },
    set favoriteForums (value) {
      Vue.prototype.$storage.setSync('favoriteForums:' + this.currentSite.name, value)
    },
    getImageUrl (path, ext, mode = 'thumb') {
      return this.currentSite.cdn + `${mode}/${path}${ext}`
    },
    get forums () {
      let currentSite = this.currentSite
      return new Promise(async (resolve, reject) => {
        // 从存储中获取
        let forums = Vue.prototype.$storage.getSync('forums:' + currentSite.name)
        if (forums) {
          resolve(forums)
          return
        }
        // 从网络中获取
        forums = Vue.prototype.$fetch({
          method: 'GET',
          name: 'forum.list'
        }).then(response => {
          Vue.prototype.$storage.setSync('forums:' + currentSite.name, response)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 饼干🍪
    get cookies () {
      let cookies = Vue.prototype.$storage.getSync('cookies:' + this.currentSite.name)
      if (cookies) {
        return cookies
      } else {
        return []
      }
    },
    set cookies (newCookies) {
      Vue.prototype.$storage.setSync('cookies:' + this.currentSite.name, newCookies)
    },
    get cookie () {
      return Vue.prototype.$storage.getSync('cookie:' + this.currentSite.name)
    },
    set cookie (value) {
      Vue.prototype.$storage.setSync('cookie:' + this.currentSite.name, value)
    },
    appendCookie (cookie) {
      let cookies = this.cookies
      cookies.push(cookie)
      this.cookies = cookies
    },
    get config () {
      if (_config) {
        return _config
      } else {
        _config = Vue.prototype.$storage.getSync('config')
        if (!_config) {
          // 没有配置 使用默认配置
          this.config = {
            displayImage: true,
            displayReply: false,
            night: false
          }
        }
        return _config
      }
    },
    set config (value) {
      _config = value
      Vue.prototype.$storage.setSync('config', _config)
    },
    recordHistory ({ type, threadId, threadContent, forumName = '', postContent = '' }) {
      let currentSite = this.currentSite
      let history = Vue.prototype.$storage.getSync('myHistory:' + currentSite.name)
      // 如果没有history则初始化一个
      if (!history) {
        history = {
          list: [],
          maxId: 0
        }
      }
      // 如果重新打开了最近打开的帖子 那么不记录
      if (type === 'visit' && history.list.length > 0 && history.list[0].threadId == threadId) {
        return
      }
      history.list.splice(0, 0, {
        id: ++history.maxId,
        type,
        threadId,
        threadContent: threadContent.length > 80 ? threadContent.substr(0, 80) + '...' : threadContent,
        postContent,
        forumName,
        time: (new Date()).toLocaleString('zh-CN')
      })
      // 超出一千条则删除早期记录
      if (history.list.length >= 1000) {
        history.list.splice(1000, history.list.length)
      }
      // 存储
      Vue.prototype.$storage.setSync('myHistory:' + currentSite.name, history)
    }
  }
}

export default Site

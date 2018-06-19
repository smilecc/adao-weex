const Site = Object.create(null)

Site.install = (Vue, options) => {
  var _site = null
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
    }
  }
}

export default Site

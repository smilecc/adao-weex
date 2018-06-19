const modal = weex.requireModule('bmModal')
Request = Object.create(null)

Request.install = (Vue, options) => {
  Vue.prototype.$request = {
    getUrl (interfaceUrl) {
      // 从存储中取出域名
      let interfaceDomain = Vue.$storage.getSync('interfaceDomain')
      // 如果不存在则生成
      if (!interfaceDomain) {
        interfaceDomain = {
          domain: 'http://adnmb1.com'
        }
        // Vue.$storage.setSync('interfaceDomain', interfaceDomain)
      }
      return `${interfaceDomain.domain}${interfaceUrl}`
    },
    fetch (options) {
      return Vue.$fetch({
        ...options,
        url: this.getUrl()
      })
    }
  }
}

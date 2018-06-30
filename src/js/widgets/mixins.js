const Mixins = Object.create(null)

Mixins.install = (Vue, options) => {
  Vue.mixin({
    data () {
      return {
        appConfig: {}
      }
    },
    created () {
      if (this.listenConfig) {
        this.__initConfig(this.$site.config)
        this.$event.on('reloadConfig', config => {
          this.__initConfig(config)
        })
      } else {
        this.appConfig = this.$site.config
      }
    },
    methods: {
      __initConfig (newConfig) {
        this.appConfig = newConfig
        if (this.isComponent) {
          return
        }
        if (this.appConfig.fontSize) {
          // 如果有字体偏好 则先设置字体再设置颜色
          this.$font.changeFontSize({
            fontSize: this.appConfig.fontSize
          }).then(response => {
            this.$setNavbarTheme(this.appConfig.night)
          }).catch(error => {
            this.$setNavbarTheme(this.appConfig.night)
          })
        } else {
          this.$setNavbarTheme(this.appConfig.night)
        }
      },
      $setNavbarTheme (night) {
        if (night) {
          this.$navigator.setNavigationInfo({
            statusBarStyle: 'LightContent',
            navBgColor: '#222',
            navTitleColor: '#fff',
            tabbarBgColor: '#222'
          })
        } else {
          this.$navigator.setNavigationInfo({
            statusBarStyle: 'Default',
            navBgColor: '#fff',
            navTitleColor: '#000',
            tabbarBgColor: '#fff'
          })
        }
      },
      $class (className, ...classes) {
        if (this.appConfig.night === undefined) {
          this.appConfig = {
            ...this.appConfig,
            night: false
          }
          this.$site.config = this.appConfig
        }
        return [ className, ...classes, this.appConfig.night ? `${className}-night` : '']
      }
    }
  })
}

Vue.use(Mixins)

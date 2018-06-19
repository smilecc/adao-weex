// 这里的后缀都是 .js 因为打包出来的都是js文件，而不是.vue文件，我们要告诉客户端跳转那个js

//  这里的路径和dev.json路径的区别
//  pages里面配置的是路由跳转的地址，也就是dev生成的 dist文件夹下的js bundle路径 从dist/js开始
//  dev.json 的 exports 需要打包的js地址，填入src的需要被打包成js bundle的地址   从src开始

export default {
  'forum.index': {
    title: '首页',
    url: '/pages/forum/index.js'
  },
  'forum.list': {
    title: '发现',
    url: '/pages/forum/list.js'
  },
  'forum.thread': {
    title: '串',
    url: '/pages/forum/thread.js'
  },
  'forum.reply': {
    title: '回复串',
    url: '/pages/forum/reply.js'
  },
  'forum.favorite': {
    title: '喜欢的板',
    url: '/pages/forum/favorite.js'
  },
  'personal.index': {
    title: '个人',
    url: '/pages/personal/index.js'
  },
  'personal.cookie': {
    title: '饼干管理',
    url: '/pages/personal/cookie.js'
  },
  'personal.setting': {
    title: '设置',
    url: '/pages/personal/setting.js'
  },'personal.about': {
    title: '关于',
    url: '/pages/personal/about.js'
  }
}
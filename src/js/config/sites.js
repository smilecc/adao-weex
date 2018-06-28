export default {
  default: 'tnmb',
  sites: {
    'adnmb': {
      name: 'adnmb',
      domain: 'https://adnmb.adao.smilec.cc',
      cdn: '',
      defaultForums: [{
        id: 4,
        name: '综合版1'
      }, {
        id: 20,
        name: '欢乐恶搞'
      }, {
        id: 11,
        name: '推理(脑洞)'
      }, {
        id: 111,
        name: '跑团'
      }, {
        id: 30,
        name: '技术(码农)'
      }]
    },
    'tnmb': {
      name: 'tnmb',
      domain: 'https://tnmb.adao.smilec.cc',
      cdn: 'https://tnmbstatic.fastmirror.org/Public/Upload/',
      defaultForums: [{
        id: 1,
        name: '综合'
      }, {
        id: 2,
        name: '技术'
      }, {
        id: 6,
        name: '游戏'
      }, {
        id: 11,
        name: '小说'
      }, {
        id: 13,
        name: '数码音乐'
      }, {
        id: 22,
        name: '喵版'
      }]
    }
  }
}

// appBoard，mediator 不建议进行修改 如果修改了 也请对应修改
module.exports = {
    'eslint': false,
    'webpackWarnings': false,
    'exports': [
        // appBoard
        'js/config/index.js',
        // mediator
        'js/mediator/index.vue',
        // home
        'js/pages/forum/timeline.vue',
        'js/pages/forum/index.vue',
        'js/pages/forum/list.vue',
        'js/pages/forum/thread.vue',
        'js/pages/forum/reply.vue',
        'js/pages/forum/favorite.vue',
        // 个人
        'js/pages/personal/index.vue',
        'js/pages/personal/setting.vue',
        'js/pages/personal/cookie.vue',
        'js/pages/personal/about.vue',
        'js/pages/personal/about/opensource.vue',
        'js/pages/personal/about/thank.vue',
        'js/pages/personal/drafts.vue',
        // 历史
        'js/pages/personal/history.vue',
        // 收藏夹
        'js/pages/personal/favorite/folder.vue',
        'js/pages/personal/favorite/list.vue'
    ],
    'alias': {
        'Components': 'js/components',
        'Common': 'js/common',
        'Config': 'js/config',
        'Widget': 'js/widget',
        'Pages': 'js/pages',
        'Utils': 'js/utils'
    },
    'diff': {
        'pwd': '/Users/smilec/code/nodejs/adao/build-pack',
        'proxy': 'http://123.206.199.206:27011/static/'
    },
    'server': {
        'path': './',
        'port': 8889
    },
    'mockServer': {
        'port': 52077,
        'mockDir': './dist/mock'
    },
    'socketServer': {
        'port': 8890,
        'switch': true
    }
}
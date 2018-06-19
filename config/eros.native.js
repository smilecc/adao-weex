module.exports = {
    'appName': 'eros-adao',
    'appBoard': '/config/index.js',
    // android 监听全局事件homeBack 如果为true 安卓端需要自行调用router.finish方法来关闭应用
    'androidIsListenHomeBack': 'true',
    'version': {
        'android': '1.0.0',
        'iOS': '1.0.0'
    },
    'page': {
        'homePage': 'tabBar',
        'mediatorPage': '/mediator/index.js',
        'navBarColor': '#ffffff',
        'navItemColor': '#000000'
    },
    'url': {
        'image': 'https://lev-inf.benmu-health.com/test/xxx',
        'bundleUpdate': 'http://localhosts:3001/app/check'
    },
    'zipFolder': {
        'iOS': '/ios/WeexEros/WeexEros',
        'android': '/android/WeexFrameworkWrapper/app/src/main/assets'
    },
    'getui': {
        'enabled': 'false',
        'appId': '',
        'appKey': '',
        'appSecret': ''
    },
    'tabBar': {
        'color': '#777777',
        'selectedColor': '#00b4cb',
        'backgroundColor': '#fff',
        'borderColor': '#f0f0f0',
        'list': [{
                'pagePath': '/pages/forum/index.js',
                'text': '首页',
                'icon': 'bmlocal://assets/tabbar/forum@2x.png',
                'selectedIcon': 'bmlocal://assets/tabbar/forum-active@2x.png',
                'navShow': 'false',
                'navTitle': "首页"
            },
            {
                'pagePath': '/pages/forum/list.js',
                'text': '板块',
                'icon': 'bmlocal://assets/tabbar/forum-list@2x.png',
                'selectedIcon': 'bmlocal://assets/tabbar/forum-list-active@2x.png',
                'navShow': 'true',
                'navTitle': '板块'
            },
            {
                'pagePath': '/pages/personal/index.js',
                'text': '个人',
                'icon': 'bmlocal://assets/tabbar/personal@2x.png',
                'selectedIcon': 'bmlocal://assets/tabbar/personal-active@2x.png',
                'navShow': 'true',
                'navTitle': '个人'
            }
        ]
    }
}
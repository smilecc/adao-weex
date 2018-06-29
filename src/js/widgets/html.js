import HtmlParser from "htmlparser2"
const Html = Object.create(null)

Html.install = (Vue, options) => {
    Vue.prototype.$html = {
        parse (_option) {
            let option = {}
            let htmlContent = ''
            if (typeof _option === 'string') {
                htmlContent = _option
            } else {
                htmlContent = _option.content
                option = _option
            }
            return new Promise((resolve, reject) => {
                let richList = [{
                    list: [],
                    text: ''
                }]
                let contentText = ''
                let currentLength = 0
                let $push = (config) => {
                    if ('value' in config && config.value) {
                        // 替换换行符
                        config.value = config.value.replace(/\n/g, '')
                        config.value = config.value.replace(/\r/g, '')
                        // 替换HTML实体
                        config.value = config.value.replace(/&quot;/g, '"')
                        config.value = config.value.replace(/&apos;/g, '\'')
                        config.value = config.value.replace(/&amp;/g, '&')
                        config.value = config.value.replace(/&lt;/g, '<')
                        config.value = config.value.replace(/&gt;/g, '>')
                        // 解析链接
                        let reg = new RegExp("(https?://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])", 'g')
                        if (config.type === 'text' && reg.test(config.value)) {
                            let list = config.value.split(reg)
                            for (let text of list) {
                                if (text.indexOf('https://') === 0 || text.indexOf('http://') === 0) {
                                    $push({
                                        type: 'link',
                                        href: text,
                                        value: text
                                    })
                                } else {
                                    $push({
                                        ...config,
                                        value: text
                                    })
                                }
                            }
                            return
                        }

                        // 统计当前长度
                        contentText += config.value
                        richList[richList.length - 1].text += config.value
                        currentLength += config.value.length
                    }
                    richList[richList.length - 1].list.push(config)
                }
                let $nextLine = () => {
                    richList.push({
                        list: [],
                        text: ''
                    })
                    contentText += '\n'
                }
                let $processNode = (node) => {
                    let result = {
                        style: {
                        },
                        text: ''
                    }

                    // 粗体
                    if (node.name === 'strong') {
                        result.style['fontWeight'] = '700'
                    }
                    
                    // 样式
                    if (node.name === 'font' && node.attribs) {
                        if ('color' in node.attribs) {
                            result.style['color'] = node.attribs.color
                        }
                    }

                    // 解析文字和子样式
                    if (node.data) {
                        result.text = node.data
                    } else if (node.children.length === 0) {
                        result.text = ''
                    } else {
                        for (let childrenNode of node.children) {
                            let childrenResult = $processNode(childrenNode)
                            result.style = {
                                ...result.style,
                                ...childrenResult.style
                            }
                            result.text += childrenResult.text
                        }
                    }

                    return result
                }
                // HTML 处理器
                let handler = new HtmlParser.DomHandler((error, dom) => {
                    if (error) {
                        // 解析失败
                        $push({
                            type: 'text',
                            value: '解析失败'
                        })
                        reject(error)
                        return
                    }
                    // 解析成功
                    for (let element of dom) {
                        // 处理HTML tag
                        if (element.type === 'text') {
                            $push({
                                type: 'text',
                                value: element.data,
                                theme: 'dark'
                            })
                        } else if (element.type === 'tag') {
                            if (element.name === 'br') {
                                $nextLine()
                            } else if (element.name === 'a') {
                                let result = $processNode(element)
                                $push({
                                    type: 'link',
                                    value: result.text,
                                    style: result.style,
                                    href: element.attribs.href
                                })
                            } else {
                                let result = $processNode(element)
                                $push({
                                    type: 'text',
                                    style: result.style,
                                    value: result.text
                                })
                            }
                        }
                        // 限制长度选项是否开启
                        if (option['limit']) {
                            if (option['limit']['line']) {
                                // 超出限制行数
                                if (richList.length > option['limit']['line']) {
                                    $push({
                                        type: 'text',
                                        style: {},
                                        value: '...'
                                    })
                                    break
                                }
                            }
                            // 根据选项限制长度
                            if (option['limit']['length']) {
                                if (currentLength >= option['limit']['length']) {
                                    let overLength = currentLength - option['limit']['length']
                                    let lastVal = richList[richList.length - 1].value
                                    if (lastVal) {
                                        lastVal = lastVal.substr(0, lastVal.length - overLength)
                                        richList[richList.length - 1].value = lastVal
                                    }
                                    $push({
                                        type: 'text',
                                        style: {},
                                        value: '...'
                                    })
                                    break
                                }
                            }
                        }
                    }
                    resolve({
                        'list': richList,
                        'text': contentText
                    })
                })
                let parser = new HtmlParser.Parser(handler)
                parser.write(htmlContent)
                parser.end()
            })
        }
    }
}

Vue.use(Html)

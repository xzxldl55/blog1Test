const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')
const querystring = require('querystring')

const getPostData = (req) => {
    return new Promise((resolve, reject) => {
        // console.log(req.method, req.headers['content-type'])
        if (req.method !== 'POST') {
            // console.log("It's not Post")
            resolve({})
            return
        }
        if (req.headers['content-type'] !== 'application/json') {
            // console.log("Data format error")
            resolve({})
            return
        }
        let postData = ''
        req.on('data', chunk => {
            postData += chunk.toString()
        })
        req.on('end', () => {
            if (!postData) {
                // console.log("Get empty")
                resolve({})
                return
            }
            resolve(JSON.parse(postData))
        })
    })
}

const serverHandle = (req, res) => {
    // set ret format
    res.setHeader('Content-type', 'application/json')
    // 获取并存储请求路径
    const url = req.url
    req.path = url.split('?')[0]
    // 解析query
    req.query = querystring.parse(url.split('?')[1])
    // 解析Cookie
    req.cookie = {}
    const cookieStr = req.headers.cookie || ''
    cookieStr.split(';').forEach(item => {
        if (!item) return item
        const arr = item.split('=')
        const key = arr[0].trim() // 去除首尾空格
        const val = arr[1].trim()
        req.cookie[key] = val
    })
    // 解析Post数据
    getPostData(req).then(postData => {
        // 存储postData
        req.body = postData

        // 路由
        // blog Router
        const blogResult = handleBlogRouter(req, res)
        if (blogResult) {
            blogResult.then(blogData => {
                res.end(JSON.stringify(blogData))
            })
            return // 同步返回掉，以免往继续下执行
        }
        // user Router
        const userData = handleUserRouter(req, res)
        if (userData) {
            userData.then(data => {
                res.end(JSON.stringify(data))
            })
            return
        }

        // 404
        res.writeHead(404, { 'Content-type': 'text/p;ain' })
        res.write("404")
        res.end()
    })
}
module.exports = serverHandle
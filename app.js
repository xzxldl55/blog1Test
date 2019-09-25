const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')
const querystring = require('querystring')
const { redisGet, redisSet } = require('./src/db/redis')

// session 数据
/**
 * 问题：（如果直接将session数据存储在js变量中）
 * ① 当前session直接存在js变量中，nodeJS进程内存有限，当访问量过大，内存将会激增（内存溢出）
 * ② 正式上线是多进程的，进程间内存无法共享（多进程数据同步）
 * ==> 解决，使用redis：
 * redis是webserver最常用的缓存数据库，数据放在内存中（优点：访问快；缺点：内存昂贵且服务器奔溃的话数据将会丢失）
 * --> 如此webserver与redis拆分为两个单独的服务
 * ！为何放在redis而不放在mysql：
 * ① session访问频繁，对性能要求高
 * ② session可以不考虑断电丢失数据的问题
 * ③ session数据量不会太大
 */
// const SESSION_DATA = {}

const getCookieExpires  = () => {
    const d = new Date()
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
    return d.toGMTString()
}

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
    // 解析session
    // if (userId) {
    //     if (!SESSION_DATA[userId]) {
    //         SESSION_DATA[userId] = {}
    //     }
    // } else {
    //     needSetSession = true
    //     userId = `${Date.now()}_${Math.random() * 10}`
    //     SESSION_DATA[userId] = {}
    // }
    // req.session = SESSION_DATA[userId]
    // console.log(SESSION_DATA)
    /**
     * 因为userId为一个随机数，保证了每位用户的随机性，如当前用户userId为1565939099155_0.3584586724902761
     * 如此SESSION_DATA = {
     *      1565939099155_0.3584586724902761: {
     *          
     *      }
     * }
     * 最终则将这个用户对应的session覆盖到req.session中，Server端则通过session来识别用户，给用户提供服务
     */
    let needSetSession = false
    let userId = req.cookie.userid // 第一次服务时，为空，将会设置其的值
    if (!userId) {
        needSetSession = true
        userId = `${Date.now()}_${Math.random() * 10}`
        // 初始化session
        redisSet(userId, {})
    }
    // 获取session ==> 使用redis
    req.sessionId = userId
    redisGet(req.sessionId).then(sessionData => {
        if (sessionData === null) {
            // redis中没有则给其初始化
            redisSet(req.sessionId, {})
            req.session = {}
        } else {
            req.session = sessionData
        }
        // 将Promise连起来
        // 解析Post数据
        return getPostData(req)
    }).then(postData => {
        // 存储postData
        req.body = postData

        // 路由
        // blog Router
        const blogResult = handleBlogRouter(req, res)
        if (blogResult) {
            blogResult.then(blogData => {
                if (needSetSession) res.setHeader('Set-Cookie', `userid=${req.sessionId}; path=/; httpOnly; expirse=${getCookieExpires()}`)
                res.end(JSON.stringify(blogData))
            })
            return // 同步返回掉，以免往继续下执行
        }
        // user Router
        const userData = handleUserRouter(req, res)
        if (userData) {
            userData.then(data => {
                if (needSetSession) res.setHeader('Set-Cookie', `userid=${req.sessionId}; path=/; httpOnly; expirse=${getCookieExpires()}`)
                res.end(JSON.stringify(data))
            })
            return
        }

        // 404
        res.writeHead(404, { 'Content-type': 'text/plain' })
        res.write("404")
        res.end()
    })
}
module.exports = serverHandle
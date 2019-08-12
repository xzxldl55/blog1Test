const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')
const querystring = require('querystring')

const serverHandle = (req, res) => {
    // set ret format
    res.setHeader('Content-type', 'application/json')
    // 获取并存储请求路径
    const url = req.url
    req.path = url.split('?')[0]
    // 解析query
    req.query = querystring.parse(url.split('?')[1])
    
    // blog Router
    const blogData = handleBlogRouter(req, res)
    if (blogData) {
        res.end(JSON.stringify(blogData))
        return
    }

    // user Router
    const userData = handleUserRouter(req, res)
    if (userData) {
        res.end(JSON.stringify(userData))
        return
    }

    // 404
    res.writeHead(404, { 'Content-type': 'text/p;ain' })
    res.write("404")
    res.end()
}
module.exports = serverHandle
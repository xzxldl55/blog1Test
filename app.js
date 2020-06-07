const querystring = require('querystring')
const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')
const { redisGet, redisSet } = require('./src/db/redis')
const {
  accessLog
} = require('./src/utils/log')

// session数据
let SESSION_DATA = {}

// 获取cookie过期时间
const getCookieExpires = () => {
  const d = new Date()
  // 1天后国企
  d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
  // cookie规定过期时间格式GMT
  return d.toGMTString()
}


// 处理postData的异步数据
const getPostData = (req) => {
  const promise = new Promise((res, rej) => {
    // 特殊情况处理
    if (req.method !== 'POST') {
      res({})
      return
    }
    if (req.headers['content-type'] !== 'application/json') {
      res({})
      return
    }
    
    // 接收数据
    let postData = ''
    req.on('data', chunk => {
      postData += chunk.toString()
    })
    req.on('end', () => {
      if (!postData) {
        res({})
        return
      }
      res(
        JSON.parse(postData)
      )
    })
  })
  return promise
}

// Server的handler函数
const serverHandler = (req, res) => {
  // 记录accessLog
  accessLog(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`)

  // 设置返回数据的格式
  res.setHeader('Content-type', 'application/json')

  // 解析通用request数据
  const url = req.url
  req.path = url.split('?')[0]
  req.query = querystring.parse(url.split('?')[1])

  // 解析cookie
  req.cookie = {}
  const cookieStrs = req.headers.cookie || ''
  cookieStrs.split(';').forEach(v => {
    if (!v)
      return
    const arr = v.split('=')
    const key = arr[0].trim() // 去掉客户端自动加的空格
    const val = arr[1]
    req.cookie[key] = val
  })


  // Redis 解析 session 
  let needSetCookie = false
  let userId = req.cookie.userid
  if (!userId) {
    needSetCookie = true
    userId = Date.now() + '_' +  Math.random()
    // 初始化session
    redisSet(userId, {})
  }
  req.sessionId = userId

  // 获取session
  redisGet(req.sessionId).then(sessionData => {
    // 若该session为空，则将其进行初始化（有userId，但无sessionData情况）
    if (!sessionData) {
      redisSet(req.sessionId, {})
      req.session = {}
    } else {
      // 存在则直接赋值
      req.session = sessionData
    }

    // 连接解析PostData的promise
    /**
     * 解析PostData
     * - 要在处路由前解析PostData，因为post传输数据是异步的
     */
    return getPostData(req)
  })
  .then(postData => {
    req.body = postData
    
    /**
    * 再进行路由处理，如此路由处理中都能获得到post的数据了
    */
    // blog Router
    const blogResult = handleBlogRouter(req, res)
    // user　Router
    const userResult = handleUserRouter(req, res)

    // 用if，else if， else单一进入的方式，将异步的路由处理与同步404处理放在一起
    if (blogResult) {
      blogResult.then(blogData => {
        if (blogData) {
          // 设置当前用户cookie，前后端对应的userid：
          // 记得path设为根路由，否则其他API则无法访问到cookie
          // 在进行前端操作的限制，防止前端修改添加httpOnly，这样前端改了也无效的
          // 添加过期时间
          if (needSetCookie) {
            res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
          }
          res.end(res.end(
            JSON.stringify(blogData)
          ))
          return 
        }
      })
    } else if (userResult) {
      userResult.then(userData => {
        if (needSetCookie) {
          res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
        }
        res.end(res.end(
          JSON.stringify(userData)
        ))
        return 
      })
    } else {
      // 未命中设计的路由 404 
      res.writeHead(404, {'Content-type': 'text/html'})
      res.write(`<h1 style="color: red;">404 Not Found!</h1>`)
      res.end()
    }
  })
}

module.exports = serverHandler
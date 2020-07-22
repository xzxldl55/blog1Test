const http = require('http')
const slice = Array.prototype.slice

class LikeExpress {
  constructor () {
    // 中间件信息store
    this.routes = {
      all: [],
      get: [],
      post: []
    }
  }

  // 注册中间件
  register (path) {
    const info = {}
    // 某一路由的匹配
    if (typeof path === 'string') {
      info.path = path
      info.stack = slice.call(arguments, 1) // 从第二各参数开始，转换为数组存入stack
    } else { // 对所有路由都匹配
      info.path = '/'
      info.stack = slice.call(arguments, 0) // 从第一个参数开始
    }
    return info
  }

  use () {
    const info = this.register(...arguments)
    this.routes.all.push(info)
  }

  get () {
    const info = this.register(...arguments)
    this.routes.get.push(info)
  }

  post () {
    const info = this.register(...arguments)
    this.routes.post.push(info)
  }

  match (method, url) {
    let stack = []
    if (url === '/favicon.ico') {
      return stack
    }

    // 获取routes
    let curRoutes = []
    curRoutes = curRoutes.concat(this.routes.all) // use的中间件全都要
    curRoutes = curRoutes.concat(this.routes[method]) // 获取当前方法对应的中间件

    curRoutes.forEach(routeInfo => {
      // 前缀匹配路由（父路径 & 自己），当匹配时，保留中间件
      if (url.indexOf(routeInfo.path) === 0) {
        stack = stack.concat(routeInfo.stack)
      }
    })
    // 返回当前请求匹配的所有中间件handler函数
    return stack
  }

  // 执行中间件 - 核心next机制
  handle (req, res, stack) {
    const next = () => {
      // 拿到第一个匹配的中间件
      let middleware = stack.shift() // 取出数组头部第一个
      if (middleware) {
        // 执行中间件函数 -> 将我们定义的这个next函数传入，当在中间件函数内执行到next()时，又将重复这个步骤了，一个一个拿。
        middleware(req, res, next)
      }
    }
    next()
  }

  callback () {
    return (req, res) => {
      res.json = (data) => {
        res.setHeader('Content-type', 'application')
        res.end(
          JSON.stringify(data)
        )
      }
      // 来区分当前请求下，哪些中间件需要被访问
      const url = req.url
      const method = req.method.toLowerCase()

      // 获取当前请求匹配的中间件函数
      const resultList = this.match(method, url)

      // 执行这些中间件函数
      this.handle(req, res, resultList)
    }
  }

  listen () {
    const server = http.createServer(this.callback())
    server.listen(...arguments)
  }
}

module.exports = () => {
  return new LikeExpress()
}
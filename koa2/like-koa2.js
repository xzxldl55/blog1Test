const http = require('http')

// 组合中间件函数
function compose (middlewareList) {
  return function (ctx) {
    /**
     * 中间件执行逻辑
     *    实现中间件next机制（中间件分发）
     *    逻辑与Express基本一致，设置一个中间件调用函数，
     *    将其作为next传入，并同时利用i+1的自增原则，
     *    实现中间件的依次执行
     * 通过try catch的方式保证中间件都是返回的Promise对象
     */
    function dispatch (i) {
      const middleware = middlewareList[i]
      try {
        return Promise.resolve(
          middleware(ctx, dispatch.bind(null, i + 1))
        )
      } catch (err) {
        return Promise.reject(err)
      }
    }
    return dispatch(0)
  }
}

class LikeKoa2 {
  constructor () {
    this.middlewareList = []
  }

  use (middleware) {
    this.middlewareList.push(middleware)
    // 链式调用
    return this
  }

  createCtx (req, res) {
    const ctx = {
      req, 
      res
    }
    ctx.query = req.query
    return ctx
  }

  handleRequest (ctx, middleware) {
    return middleware(ctx)
  }

  callback () {
    const middleware = compose(this.middlewareList)
    return (req, res) => {
      const ctx = this.createCtx(req, res)
      if (ctx.req.url === '/favicon.ico')
        return 
      this.handleRequest(ctx, middleware)
    }
  }

  listen () {
    const server = http.createServer(this.callback())
    server.listen(...arguments)
  }
}

module.exports = LikeKoa2
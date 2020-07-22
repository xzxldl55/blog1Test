# Express - blog

## 中间件
- 目的：
  - 将公共的功能模块简便的进行拆分，组合使用
- 运行流程：
  - 1、`app.use(fun)`：第一个参数没有写路由，则每个请求实例都将经过它`fun`
  - 2、`fun`执行到next时，将执行下一个`app.use(fun1)`里的`fun1`，如果`fun1`内没有找到next()将跳回上一个的`fun`继续着其`next()`向下执行，直到执行完毕了`fun`，实例结束，后面的`app.use`将不会再被执行了（没有`next`）
  - 3、......直到遇到路由匹配
  - 4、遇到符合的路由，则进入执行，且当无res返回时，遇到`next()`继续向下执行
  - 5、...直到遇到`res.xxx`返回，结束这次请求实例
- 原则：
  - 遇到`next()`执行下一个`app.use`
  - 当一个中间件内没有`next()`，则将不会继续向下执行了 It's over
- 使用方法
  - 1、`app.use(function middleware1 (req, res, next)  {...})`：直接传入中间件函数
  - 2、`app.use('/api/test', function routerMiddleware (req, res, next) {...})`：不计较req.method方法，进行路由匹配，对匹配成功的执行`routerMiddleware`函数
  - 3、`app.use('/api/test', function middleWare2 (req, res, next) {...}, function routerMiddleware2 (req, res, next) {...})`：在执行路由匹配的同时混入一个中间件（如登录验证），在执行匹配成功的中间件函数`routerMiddleware2`之前，先执行`middleWare2`函数

## Session:
- 使用express-session中间件：直接对接服务端session与前后端cookie
- 安装redis && connect-redis插件：将session存储到redis
- 自己实践时的问题与解决
  - 傻乎乎的直接default形式引入的redisClient，应该按照导出规范引入`const { redisClient } = require(...)`
  - `connect-redis @ 4.0.4`，创建sessionRedisClient实例时，要按照规范：
    - 正确：`new RedisStore({ client: redisClient })`
    - 错误：`new RedisStore({ redisClient })` || `new RedisStore(redisClient)`
    - 因为源码中对其定义是：
    ```
    constructor(options = {}) {
      this.client = options.client
    }
    get () {
      this.client.get(...)
    }
    ```

## Express中间件原理
- 核心：next() ，上一个中间件通过next触发下一个中间件
- 收集：app.use | app.get | app.post 收集中间件
- 监听 app.listen
- 步骤：
  - 1、收集中间件们：use，get，post，将其按照method与path分类存储好
  - 2、listen监听，创建httpServer，在handle函数内执行当前请求所匹配的中间件们
  - 3、依据req.method && req.url 来与第1步中我们收集的中间件进行匹配，得到我们本次需要执行的中间件队列列表
  - 4、对中间件列表进行执行 -> 设置next函数，其功能为从中间件队列中取出，队头的中间件，并执行这个中间件（这里我们在执行时将这个next函数传入，所以当正在执行的中间件遇到next()时，将依据上面的逻辑，执行下一个队头中间件。）。
  - 5、执行完毕。
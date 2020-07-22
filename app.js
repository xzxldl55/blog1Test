const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const morgan = require('koa-morgan')
const path = require('path')
const fs = require('fs')

const session = require('koa-generic-session')
const redisStore = require('koa-redis')
const { REDIS_CONF } = require('./conf/db')

const index = require('./routes/index')
const users = require('./routes/users')
const blog = require('./routes/blog')
const user = require('./routes/user')

// 错误监测
onerror(app)

// body解析（支持多种content-type）
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json()) // 解析完将他们都转化为json格式

// 日志 (基于koa-morgan)
const ENV = process.env.NODE_ENV
if (ENV !== 'production') {
  app.use(morgan('dev'))
} else {
  const logFileName = path.join(__dirname, 'logs', 'access.log')
  const writeStream = fs.createWriteStream(logFileName, {
    flags: 'a'
  })
  app.use(morgan('combined', {
    stream: writeStream
  }))
}

// app.use(require('koa-static')(__dirname + '/public'))
// app.use(views(__dirname + '/views', {
//   extension: 'pug'
// }))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next() // 继续执行
  // 本次服务请求完了之后，再回来这里，打印出本次请求消耗的时间
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

/**
 * Session处理
 */
app.keys = ['Xzxldl520..']
app.use(session({
  // cookie配置
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  },
  // redis
  store: redisStore({
    all: `${REDIS_CONF.host}:${REDIS_CONF.port}`
  })
}))

// routes
/**
 * allowedMethods：作用是在所有中间件执行完成后，处理当ctx.status为空 | 404时 来丰富res.header的
 *  其处理了为了三个情况：
 *  501
 *  200
 *  405
 *  ...出现错误的情况
 */
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(blog.routes(), blog.allowedMethods())
app.use(user.routes(), user.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app

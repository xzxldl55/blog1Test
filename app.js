var createError = require('http-errors');
var express = require('express');
var path = require('path');
const fs = require('fs')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session')
// 关联session与redis
const RedisStore = require('connect-redis')(session)

const blogRouter = require('./routes/blog')
const userRouter = require('./routes/user')

// Express实例初始化
var app = express();

// view engine setup Views视图层引擎设置
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

const ENV = process.env.NODE_ENV
if (ENV === 'production') {
  // 注册日志记录插件（第一个参数为日志输出格式）
  const logFileName = path.join(__dirname, 'logs', 'access.log')
  const writeStream = fs.createWriteStream(logFileName, {
    flags: 'a'
  })
  app.use(logger('combined', {
    // 输出流位置（默认控制台stdout）
    stream: writeStream // 输出到日志文件的写入流内
  })); 
} else {
  app.use(logger('dev')); 
}

app.use(express.json()); // postData数据(json类型)处理
app.use(express.urlencoded({ extended: false })); // postData数据(其他格式)处理
app.use(cookieParser()); // 解析cookie

// 创建session容器，将其与redis的连接关联！
const { redisClient } = require('./db/redis')
const sessionStore = new RedisStore({
  client: redisClient
})
// session解析，将每个用户的信息存储到相应的req.session内
//  并指定session存储容器为上面与redis关联的“sessionStore”
app.use(session({
  secret: 'XzxLdl..123', // 密匙
  cookie: { // cookie配置
    path: '/', // 默认也是这个
    httpOnly: true, // ~
    maxAge: 24 * 60 * 60 * 1000 // 毫秒单位
  },
  resave: true,
  saveUninitialized: false,
  store: sessionStore
}))
// app.use(express.static(path.join(__dirname, 'public'))); // 静态资源文件处理

/**
 * 注册路由
 */
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/api/blog', blogRouter);
app.use('/api/user', userRouter);

// 处理404错误页
app.use(function(req, res, next) {
  next(createError(404));
});

// 错误处理
app.use(function(err, req, res, next) {
  console.log(err)
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;

const {
  login
} = require('../controller/user')
const {
  SuccessModel,
  ErrorModel
} = require('../model/resModel')
const {
  redisSet,
  redisGet
} = require('../db/redis')



const handleUserRouter = (req, res) => {
  const method = req.method

  // 登录
  if (method === 'POST' && req.path === '/api/user/login') {
    const { username, password } = req.body
    // const { username, password } = req.query
    const result = login(username, password)
    return result.then(data => {
      if (data.username) {
        // 登陆后设置当前请求对应用户的session，这样对应app.js中每个请求都会去提取该用户的session数据，再来对该用户进行后续验证
        /**
         * 登录成功后，将设置到
         * SESSION_DATA[当前用户userId].username = xxx
         * SESSION_DATA[当前用户userId].realname = xxx
         * 如此，又因为在res中会将该userId注入cookie中
         * 所以该userId对应用户之后的请求都将会在session解析时，获取到其对应的session
         */
        req.session.username = data.username
        req.session.realname = data.realname
        // 同步到redis
        redisSet(req.sessionId, req.session)
        
        return new SuccessModel(data)
      } else {
        return new ErrorModel('登录失败')
      }
    })
  }

  // 登录验证测试
  // if (method === 'GET' && req.path === '/api/user/login-test') {
  //   if (req.session.username) {
  //     return Promise.resolve(
  //       new SuccessModel({
  //         session: req.session['username']
  //       })
  //     )
  //   } else {
  //     return Promise.resolve(
  //       new ErrorModel('尚未登录')
  //     )
  //   }
  // }
}

module.exports = handleUserRouter
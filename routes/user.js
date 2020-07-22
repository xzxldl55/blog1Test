var express = require('express');
var router = express.Router();
const {
  SuccessModel,
  ErrorModel
} = require('../model/resModel')
const {
  login
} = require('../controller/user')

router.post('/login', function (req, res, next) {
  const { username, password } = req.body // 通过express.json()中间件的注册已经解析好了postData
  const result = login(username, password)

  result.then(data => {
    if (data.username) {
      // 不需要再手动同步到redis，express-session将自动同步到redis
      req.session.username = data.username
      req.session.realname = data.realname

      res.json(
        new SuccessModel(data)
      )
    } else {
      res.json(
        new ErrorModel('登录失败')
      )
    }
  })
})


module.exports = router;
var express = require('express');
var router = express.Router();
const {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
} = require('../controller/blog')
const {
  SuccessModel,
  ErrorModel
} = require('../model/resModel')
const loginCheck = require('../middleware/loginCheck')

router.get('/list', (req, res, next) => {
  let author = req.query.author || ''
  const keyword = req.query.keyword || ''

  if (req.query.isadmin) {
    if (req.session.username) {
      author = req.session.username
    } else {
      res.json(
        new ErrorModel('请先登录！')
      )
      return
    }
  }

  const result = getList(author, keyword)

  result.then(listData => {
    // 直接返回json格式的数据（setHeader -> Content-type: application/json && JSON.stringfy({xx})）
    res.json(
      new SuccessModel(listData)
    )
  })
});

router.get('/detail', (req, res, next) => {
  const result = getDetail(req.query.id)
  result.then(data => {
    if (data) {
      res.json(
        new SuccessModel(data)
      )
      return
    }
    res.json(
      new ErrorModel('数据错误')
    )
  })
});

// 添加了loginCheck中间件
router.post('/new', loginCheck, (req, res, next) => {
  req.body.author = req.session.username
  const result = newBlog(req.body)
  result.then(data => {
    if (data) {
      res.json(
        new SuccessModel(data)
      )
      return
    }
    res.json(
      new ErrorModel('数据错误')
    )
  }).catch(err => {
    res.json(
      new ErrorModel(err)
    )
  })
})

router.post('/update', loginCheck, (req, res, next) => {
  const result = updateBlog(req.query.id, req.body)
  result.then(val => {
    if (val) 
      res.json(
        new SuccessModel()
      )
    else
      res.json(
        new ErrorModel('更新失败')
      )
  })
})

router.post('/delete', loginCheck, (req, res, next) => {
  const result = delBlog(req.query.id, req.session.username)
  result.then(val => {
    if (val) {
      res.json(
        new SuccessModel()
      )
    } else {
      res.json(
        new ErrorModel('删除失败')
      )
    }
  })
})

module.exports = router;

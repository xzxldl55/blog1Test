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


// 登录验证中间件
const loginCheck = (req) => {
  if (!req.session.username) {
    return Promise.resolve(
      new ErrorModel('请先登录')
    )
  }
}


const handleBlogRouter = (req, res) => {
  const method = req.method
  const id = req.query.id

  // 获取博客列表
  if (method === 'GET' && req.path === '/api/blog/list') {
    let author = req.query.author || ''
    const keyword = req.query.keyword || ''

    // 针对admin界面做过滤
    if (req.query.isadmin) {
      const loginCheckResult = loginCheck(req)
      if (loginCheckResult) { // 未登录
        return loginCheckResult
      }
      // 强制只能查看到自己的博客
      author = req.session.username
    }

    const result = getList(author, keyword)

    // 以Promise形式返回出去
    return result.then(listData => {
      if (listData) {
        return new SuccessModel(listData)
      } else {
        return new ErrorModel('没有数据')
      }
    })
  }

  // 博客详情
  if (method === 'GET' && req.path === '/api/blog/detail') {
    const result = getDetail(id)
    return result.then(data => {
      if (data) {
        return new SuccessModel(data)
      } else {
        return new ErrorModel('没有查询到该博文')
      }
    })

  }

  // 新建博客
  if (method === 'POST' && req.path === '/api/blog/new') {
    // 登录验证，如果有值说明未登录
    const loginCheckResult = loginCheck(req)
    if (loginCheckResult) {
      return loginCheckResult
    }

    req.body.author = req.session.username
    const result = newBlog(req.body)
    return result.then(data => {
      return new SuccessModel(data)
    })
  }

  // 更新博客
  if (method === 'POST' && req.path === '/api/blog/update') {
    const loginCheckResult = loginCheck(req)
    if (loginCheckResult) {
      return loginCheckResult
    }

    const result = updateBlog(id, req.body)
    return result.then(val => {
      if (val) {
        return new SuccessModel(val)
      } else {
        return new ErrorModel('更新失败')
      }
    })
  }
  
  // 删除博客
  if (method === 'POST' && req.path === '/api/blog/delete') {
    const loginCheckResult = loginCheck(req)
    if (loginCheckResult) {
      return loginCheckResult
    }

    const author = req.session.username
    const result = delBlog(id, author)
    
    return result.then(val => {
      if (val) {
        return new SuccessModel(val)
      } else {
        return new ErrorModel('删除失败')
      }
    })
  }
}

module.exports = handleBlogRouter
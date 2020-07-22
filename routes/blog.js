const router = require('koa-router')()
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

router.prefix('/api/blog')

router.get('/list', async (ctx, next) => {
  let author = ctx.query.author || ''
  const keyword = ctx.query.keyword || ''

  if (ctx.query.isadmin) {
    if (!ctx.session.username) {
      ctx.body = new ErrorModel('请先登录')
      return
    }
    author = ctx.session.username
  }

  const data = await getList(author, keyword)
  ctx.body = new SuccessModel(data)
})

router.get('/detail', async (ctx, next) => {
  const data = await getDetail(ctx.query.id)

  ctx.body = new SuccessModel(data)
})

router.post('/new', loginCheck, async (ctx, next) => {
  const body = ctx.request.body
  body.author = ctx.session.username

  const data = await newBlog(body)

  ctx.body = new SuccessModel(data)
})

router.post('/update', loginCheck, async (ctx, next) => {
  const body = ctx.request.body
  const val = await updateBlog(ctx.query.id, body)

  if (val) {
    ctx.body = new SuccessModel()
  } else {
    ctx.body = new ErrorModel('更新失败')
  }
})

router.post('/delete', loginCheck, async (ctx, next) => {
  const val = await delBlog(ctx.query.id, ctx.session.username)

  if (val) {
    ctx.body = new SuccessModel()
  } else {
    ctx.body = new ErrorModel('删除失败')
  }
})

module.exports = router
const Koa = require('./like-koa2')
const app = new Koa()

app.use(async (ctx, next) => {
  console.log('1 - s')
  await next()
  const rt = ctx['X-Response-Time']
  console.log(`${ctx.req.method} - ${ctx.req.url} - ${rt}`)
  console.log('1 - e')
})

app.use(async (ctx, next) => {
  console.log('2 - s')
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx['X-Response-Time'] = `${ms}ms`
  console.log('2 - e')
})

app.use(async (ctx, next) => {
  console.log('3 - s')
  ctx.res.end('This is like Koa2')
  console.log('3 - e')
})

app.listen(3000, () => {
  console.log('start!')
})
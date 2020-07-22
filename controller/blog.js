const { 
  exec,
  escape
} = require('../db/mysql')
const xss = require('xss')

// 控制器，用于对接口的数据进行处理
const getList = async (author, keyword) => {
  let sql = `select * from blog where 1=1 `
  if (author) {
    author = escape(author)
    sql += `and author=${author} `
  }
  if (keyword) {
    keyword = escape(`%${keyword}%`)
    sql += `and title like ${keyword} `
  }
  sql += `order by createtime desc;`
  return await exec(sql)
}

const getDetail = async (id) => {
  id = escape(id)
  let sql = `select * from blog where id=${id};`
  // 返回单条数据
  const rows = await exec(sql)
  return rows[0]
}

const newBlog = async (blogData = {}) => {
  let { title, content, author } = blogData
  const createtime = Date.now()
  title = xss(escape(title))
  content = xss(escape(content))
  author = escape(author)

  let sql = `insert into blog(title, content, createtime, author) values(${title}, ${content}, '${createtime}', ${author});`

  const insertData = await exec(sql)
  return {
    id: insertData.insertId
  }
}

const updateBlog = async (id, blogData = {}) => {
  let { title, content } = blogData
  title = escape(title)
  content = escape(content)
  id = escape(id)

  let sql = `update blog set title=${title}, content=${content} where id=${id};`

  const updateData = await exec(sql)

  if (updateData.affectedRows > 0) {
    return true
  } else {
    return false
  }
}

const delBlog = async (id, author) => {
  id = escape(id)
  author = escape(author)
  let sql = `delete from blog where id=${id} and author=${author};`

  const delData = await exec(sql)
  if (delData.affectedRows > 0) {
    return true
  } else {
    return false
  }
}

// 这里async函数返回的都是一个Promise，所以在外面路由中间件都需要用await来接收返回值
module.exports = {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
}
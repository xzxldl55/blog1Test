const { exec } = require('../db/mysql')

// 控制器，用于对接口的数据进行处理
const getList = (author, keyword) => {
  let sql = `select * from blog where 1=1 `
  if (author) {
    sql += `and author='${author}' `
  }
  if (keyword) {
    sql += `and title like '%${keyword}%' `
  }
  sql += `order by createtime desc;`
  return exec(sql)
}

const getDetail = (id) => {
  let sql = `select * from blog where id='${id}';`
  // 返回单条数据
  return exec(sql).then(rows => {
    return rows[0]
  })
}

const newBlog = (blogData = {}) => {
  const { title, content, author } = blogData
  const createtime = Date.now()

  let sql = `insert into blog(title, content, createtime, author) values('${title}', '${content}', '${createtime}', '${author}');`

  return exec(sql).then(insertData => {
    return {
      id: insertData.insertId
    }
  })
}

const updateBlog = (id, blogData = {}) => {
  const { title, content } = blogData

  let sql = `update blog set title='${title}', content='${content}' where id=${id};`

  return exec(sql).then(updateData => {
    if (updateData.affectedRows > 0) {
      return true
    } else {
      return false
    }
  })
}

const delBlog = (id, author) => {
  let sql = `delete from blog where id=${id} and author='${author}';`

  return exec(sql).then(delData => {
    if (delData.affectedRows > 0) {
      return true
    } else {
      return false
    }
  })
}

module.exports = {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
}
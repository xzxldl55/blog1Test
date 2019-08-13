const { exec } = require('../db/mysql')

const getList = (author, keyword) => {
    let sql = `
        select * 
        from blogs
        where 1=1
    `
    if (author) sql += ` AND author=${author}`
    if (keyword) sql += ` AND title like "${ '%' + keyword + '%' }"`
    sql += `order by createtime desc;`
    // console.log(sql)
    return exec(sql)
}
const getDetail = (id) => {
    let sql = `
        select *
        from blogs
        where id='${id}'
    `
    return exec(sql).then(rows => {
        return rows[0] || {}
    })
}
const newBlog = (blogData = {}) => {
    const title = blogData.title
    const content = blogData.content
    const author = blogData.author
    const createtime = Date.now()

    let sql = `
        insert into blogs(title, content, createtime, author) 
        values('${title}', '${content}', '${createtime}', '${author}')
    `
    return exec(sql).then(insertData => {
        return insertData.insertId
    })
}
const updateBlog = (id, blogData = {}) => {
    console.log(id, blogData)
    return true
}
const delBlog  = (id) => {
    console.log('Del: ', id)
    return true
}

module.exports = {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    delBlog
}
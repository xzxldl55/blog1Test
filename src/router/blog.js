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

const handleBlogRouter = (req, res) => {
    const method = req.method
    const id = req.query.id || -1

    if (method === 'GET' && req.path === '/api/blog/list') {
        const { author, keyword } = req.query || ''
        const result = getList(author, keyword)
        // console.log(result)
        // return a Promise Obj to app
        return result.then(listData => {
            return (new SuccessModel(listData, '成功'))
        })
    }
    if (method === "GET" && req.path === '/api/blog/detail') {
        const result = getDetail(id)

        return result.then(detailData => {
            return (new SuccessModel(detailData, '成功'))
        })
    }
    if (method === 'POST' && req.path === '/api/blog/new') {
        const result = newBlog(req.body)
        return result.then(id => {
            return (new SuccessModel({
                id: id
            }, '成功'))
        })
    }
    if (method === 'POST' && req.path === '/api/blog/update') {
        const result = updateBlog(id, req.body)

        return result.then(updateData => {
            if (updateData) return new SuccessModel(updateData, '成功')
            else return (new ErrorModel(updateData, '失败'))
        })
    }
    if (method === 'POST' && req.path === '/api/blog/delete') {
        const result = delBlog(id, req.body.author) // 传入author保证只能自己删除自己的文章（author真实环境后端从session获取）
        return result.then(deleteData => {
            if (deleteData) return new SuccessModel(deleteData, '成功')
            else return (new ErrorModel(deleteData, '失败'))
        })
    }
}

module.exports = handleBlogRouter
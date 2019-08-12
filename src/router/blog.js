const { getList } = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')

const handleBlogRouter = (req, res) => {
    const method = req.method

    if (method === 'GET' && req.path === '/api/blog/list') {
        const { author, keyword } = req.query || ''
        const listData = getList(author, keyword)

        // 使用Model来格式化返回数据
        return (new SuccessModel(listData, '成功'))
    }
    if (method === "GET" && req.path === '/api/blog/detail') {
        return {
            msg: 'Blog detail'
        }
    }
    if (method === 'POST' && req.path === '/api/blog/new') {
        return {
            msg: 'new a new blog'
        }
    }
    if (method === 'POST' && req.path === '/api/blog/update') {
        return {
            msg: 'Update'
        }
    }
    if (method === 'POST' && req.path === '/api/blog/delete') {
        return {
            msg: 'Delete Blog'
        }
    }
}

module.exports = handleBlogRouter
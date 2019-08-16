const {
    loginOperation
} = require('../controller/user')
const { 
    SuccessModel, 
    ErrorModel 
} = require('../model/resModel')
const {
    redisGet,
    redisSet
} = require('../db/redis')

const getCookieExpires  = () => {
    const d = new Date()
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
    return d.toGMTString()
}

const handleUserRouter = (req, res) => {
    const method = req.method

    if (method === 'POST' &&req.path === '/api/user/login') {
        const { username, password } = req.body
        const result = loginOperation(username, password)
        return result.then(loginData => {
            if (loginData.username) {
                // 添加登录信息cookie--> path=/表示在整个站点都能访问; httpOnly表示只允许服务端修改，客户端不允许修改
                // ！！！注意：cookie前后端都可见，如果存放username（手机号邮箱或昵称）会有一定安全性问题，所以可以存放userId这类不与用户信息直接相关的数据
                // res.setHeader('Set-Cookie', `username=${loginData.username}; path=/; httpOnly; expirse=${getCookieExpires()}`)
                req.session.username = loginData.username
                req.session.realname = loginData.realname
                // 同步到redis中
                redisSet(req.sessionId, req.session)
                console.log(req.session)
                return new SuccessModel(req.session, '登陆成功')
            } else {
                return new ErrorModel('登录失败')
            }
        })
    }

    
}

module.exports = handleUserRouter
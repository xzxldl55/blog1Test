const {
    loginOperation
} = require('../controller/user')
const { 
    SuccessModel, 
    ErrorModel 
} = require('../model/resModel')

const getCookieExpires  = () => {
    const d = new Date()
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
    return d.toGMTString()
}

const handleUserROuter = (req, res) => {
    const method = req.method

    if (method === 'POST' &&req.path === '/api/user/login') {
        const { username, password } = req.body
        const result = loginOperation(username, password)
        return result.then(loginData => {
            if (loginData.username) {
                // 添加登录信息cookie--> path=/表示在整个站点都能访问; httpOnly表示只允许服务端修改，客户端不允许修改
                res.setHeader('Set-Cookie', `username=${loginData.username}; path=/; httpOnly; expirse=${getCookieExpires()}`)
                return new SuccessModel(loginData, '登陆成功')
            } else {
                return new ErrorModel('登录失败')
            }
        })
    }

    
}

module.exports = handleUserROuter
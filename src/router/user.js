const {
    loginOperation
} = require('../controller/user')
const { 
    SuccessModel, 
    ErrorModel 
} = require('../model/resModel')

const handleUserROuter = (req, res) => {
    const method = req.method

    if (method === 'POST' &&req.path === '/api/user/login') {
        const { username, password } = req.body
        const loginData = loginOperation(username, password)
        if (loginData) {
            return new SuccessModel(loginData, '成功')
        } else {
            return new ErrorModel(loginData, '失败')
        }
    }
}

module.exports = handleUserROuter
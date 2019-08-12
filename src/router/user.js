const handleUserROuter = (req, res) => {
    const method = req.method

    if (method === 'POST' &&req.path === '/api/user/login') {
        return {
            msg: 'login'
        }
    }
}

module.exports = handleUserROuter
const loginOperation = (username, password) => {
    console.log(username, password)
    if (username === 'xzxldl' && password === '123') return true
    else return false
}

module.exports = {
    loginOperation
}
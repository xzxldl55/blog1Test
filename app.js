const serverHandle = (req, res) => {
    // set ret format
    res.setHeader('Content-type', 'application/json')
    const resData = {
        name: 'xzxldl',
        age: 21,
        env: process.env.NODE_ENV // cross-env定义的全局变量
    }
    res.end(JSON.stringify(resData))
}
module.exports = serverHandle
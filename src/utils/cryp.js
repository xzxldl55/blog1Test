const crypto = require('crypto')

// 密匙
const SECRET_KEY = 'XZX_520#..'

// md5加密
function md5 (content) {
  let md5 = crypto.createHash('md5')
  return md5.update(content).digest('hex')
} 

// 密码加密函数
function genPassword (password) {
  const str = `password=${password}&key=${SECRET_KEY}`
  return md5(str)
}

module.exports = {
  genPassword
}
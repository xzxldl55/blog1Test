const { 
  exec,
  escape
} = require('../db/mysql')
const {
  genPassword
} = require('../utils/cryp')

const login = async (username, password) => {
  
  // 生成加密密码
  password = genPassword(password)

  /**
   * 使用escape防止SQL注入
   *  escape会将里面的内容用''包裹起来，保证内容作为一个整体以字符串形式出现（把你内容里的'变成\'转译成字符串而不是'标识符）
   *  这样就防止了我们人工在下面用''拼接时造成的SQL代码注入问题
   */
  username = escape(username)
  password = escape(password)


  const sql = `
    select username, realname from user where username=${username} and password=${password};
  `

  const rows = await exec(sql)
  return rows[0] || {}
}

module.exports = {
  login
}
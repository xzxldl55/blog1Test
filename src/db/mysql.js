const mysql = require('mysql')
const { MYSQL_CONF } = require('../conf/db')
const {
  errorLog
} = require('../utils/log')

// 创建数据库连接对象: 这里使用单例模式，一个实例用于全局使用
const con = mysql.createConnection(MYSQL_CONF)

// 开始连接
con.connect(function (err) {
  if (err) {
    errorLog(`MySQL Error: ${err} -- time: ${Date.now()}`)
  }
})

// 统一执行SQL的函数
function exec (sql) {
  const promise = new Promise((res, rej) => {
    con.query(sql, (err, result) => {
      if (err) {
        errorLog(`MySQL Error: ${err} -- time: ${Date.now()}`)
        rej(err)
      }
      res(result)
    })
  })
  return promise
}

function dbEnd () {
  con.end()
}

module.exports = {
  exec,
  dbEnd
}
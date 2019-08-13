const mysql = require('mysql')
const { MYSQL_CONF } = require('../conf/db')

const con = mysql.createConnection(MYSQL_CONF)

con.connect()

function exec (sql) {
    return new Promise((resolve, reject) => {
        con.query(sql, (err, res) => {
            if (err) {
                reject(err)
                return
            }
            resolve(res)
        })
    })
}

module.exports = {
    exec
}
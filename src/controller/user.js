const { exec } = require('../db/mysql')

const loginOperation = (username, password) => {
    let sql = `
        select username, realname from user where username='${username}' and password='${password}'
    `
    return exec(sql).then(rows => {
        return rows[0] || {}
    })
}

module.exports = {
    loginOperation
}
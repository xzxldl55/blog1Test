const env = process.env.NODE_ENV

let MYSQL_CONF

if (env === 'dev') {
    MYSQL_CONF = {
        host: 'localhost',
        user: 'root',
        password: 'xzxldl55',
        port: '3306',
        database: 'xzxldl'
    }
} else if (env === 'production') {
    MYSQL_CONF = {
        host: 'localhost',
        user: 'root',
        password: 'xzxldl55',
        port: '3306',
        database: 'xzxldl'
    }
}

module.exports = {
    MYSQL_CONF
}
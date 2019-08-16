const redis = require('redis')
const { REDIS_CONF } = require('../conf/db')

// 创建Redis客户端(prot, host)
const redisClient = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)
// 监测错误
redisClient.on('error', err => {
    console.error(err)
})

const redisSet = function(key, val) {
    if (typeof val === 'object') val = JSON.stringify(val)
    redisClient.set(key, val, redis.print)
}
const redisGet = function(key) {
    return new Promise((resolve, reject) => {
        redisClient.get(key, (err, val) => {
            console.log('get:',key)
            if (err) {
                reject(err)
                return
            }
            if (val === null) {
                resolve(null)
                return
            }
            try {
                resolve(JSON.parse(val))
            } catch (e) {
                resolve(val)
            }
        })
    })
}

module.exports = {
    redisSet,
    redisGet
}
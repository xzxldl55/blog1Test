const redis = require('redis')
const { REDIS_CONF } = require('../conf/db')

const redisClient = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)
redisClient.on('error', err => {
  if (err)
    console.log(err)
})

function redisSet (key, value) {
  if (typeof value === 'object') {
    value = JSON.stringify(value)
  }
  redisClient.set(key, value, redis.print)
}

function redisGet (key) {
  const promise = new Promise((res, rej) => {
    redisClient.get(key, (err, val) => {
      if (err) {
        rej(err)
        return
      }
      if (!val) {
        res(null)
      }
      
      // 对JSON字符串处理
      try {
        res(
          JSON.parse(val)
        )
      } catch (e) {
        res(val)
      }
    })
  })

  return promise
}

module.exports = {
  redisSet,
  redisGet
}
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const fileName = path.join(__dirname, '../', '../', 'logs', 'access.log')

const readStream = fs.createReadStream(fileName)

const rl = readline.createInterface({
  input: readStream
})

var chromeNum = 0
var sumNum = 0

rl.on('line', function (lineData) {
  if (!lineData) {
    return
  }
  // 总行数
  sumNum++

  const arr = lineData.split(' -- ')
  // user-agent
  if (arr[2] && arr[2].indexOf('Chrome') > 0) {
    chromeNum++
  }
})
// 读取完成
rl.on('close', function () {
  console.log('Chrome占比：', String((chromeNum / sumNum) * 100).slice(0, 5), '%')
})
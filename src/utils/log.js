const fs = require('fs')
const path = require('path')

// 生成write Stream
function createWriteStream (fileName) {
  const fullFileName = path.join(__dirname, '../', '../', 'logs', fileName)
  const writeStream = fs.createWriteStream(fullFileName, {
    flags: 'a'
  })
  return writeStream
}

// 写入日志通用函数
function writeLog (writeStream, log) {
  writeStream.write(log + '\n')
}


// 写入访问日志
const accessWriteStream = createWriteStream('access.log')
function accessLog (log) {
  writeLog(accessWriteStream, log)
}

// 错误日志
const errorWriteStream = createWriteStream('error.log')
function errorLog (log) {
  writeLog(errorWriteStream, log)
}

// 事件日志
const eventWriteStream = createWriteStream('event.log')
function eventLog (log) {
  writeLog(eventWriteStream, log)
}

module.exports = {
  accessLog,
  errorLog,
  eventLog
}
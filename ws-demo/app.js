const ws = require('nodejs-websocket')

// 记录当前连接上来的总用户数量
let count = 0
const server = ws.createServer(conn => {
  console.log('新的连接')
  count++ // 记录用户连接
  conn.username = `用户${count}` // 用户名
  // 1.告诉所有用户有人加入了聊天室
  const enterTime = new Date().toLocaleTimeString()
  broadcast({
    type: 'enter',
    msg: `${conn.username}进入了聊天室 -- ${enterTime}`
  })

  // text
  conn.on('text', data => {
    const time = new Date().toLocaleTimeString()
    // 2.当我们接收到某个用户信息时，也要告诉所有人
    broadcast({
      msg: `${conn.username}：${data} -- ${time}`
    })
  })
  // close
  conn.on('close', () => {
    console.log('连接关闭')
    // count-- // 记录用户数减少
    const leaveTime = new Date().toLocaleTimeString()
    // 3.用户离开后，要告诉所有人谁离开了
    broadcast({
      type: 'leave',
      msg: `${conn.username}离开了聊天室 -- ${leaveTime}`
    })
  })
  // error
  conn.on('error', () => {
    console.log('连接异常')
  })

})

// 广播，给所有用户发送消息
function broadcast(obj) {
  server.connections.forEach((conn) => {
    conn.send(JSON.stringify(obj))
  });
}

server.listen(3000, ()=>{
  console.log('服务监听3000端口，请打开当前目录的test.html文件尝试一下本服务。')
})

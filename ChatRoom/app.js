const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)

server.listen('3000', () => console.log('3000端口'))

app.use('/', require('express').static(__dirname + '/public'))
app.get('/', (req, res) => {
  res.redirect('/index.html')
})


const users = [] // 记录已登录用户（为了用户名唯一...）

// connection
io.on('connection', socket => {
  console.log('新用户连接进来了')

  // login
  socket.on('login', data => {
    const user = users.find(item => item.username === data.username)
    if (user) { // 用户已存在
      socket.emit('loginError', { msg: '用户名重复' })
    } else { // 不存在
      users.push(data)
      socket.emit('loginSuccess', data)
      // 广播给所有用户有人进入了...
      io.emit('addUser', data)
      // 广播所有用户现在的群聊信息
      io.emit('userList', users)
      // 将当前用户的信息保存起来，用于在断开连接等情况时清除当前用户信息...
      socket.username = data.username
      socket.avatar = data.avatar
    }
  })

  // disconnect监听用户断开连接的事件
  socket.on('disconnect', () => {
    // 把当前用户的信息从users中删除
    // 广播所有人有人离开
    // 广播所有人现在的群聊信息
    let idx = users.findIndex(item => item.username === socket.username)
    users.splice(idx, 1)
    io.emit('deleteUser', {
      username: socket.username,
      avatar: socket.avatar
    })
    io.emit('userList', users)
  })

  // 监听聊天的消息
  socket.on('sendMsg', data => {
    // 广播给所有用户
    io.emit('receiveMsg', data)
  })

  // 监听 图片信息
  socket.on('sendImg', data => {
    io.emit('receiveImg', data)
  })

})

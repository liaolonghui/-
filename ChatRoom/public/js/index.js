const socket = io('http://localhost:3000')

let username, avatar

// 登录功能
$('#login_avatar li').on('click', function(){
  $(this).addClass('now').siblings().removeClass('now')
})
$('#loginBtn').on('click', function() {
  // 获取用户名和头像
  const username = $('#username').val().trim()
  if (!username) return alert('请输入用户名！')
  const avatar = $('#login_avatar li.now img').attr('src')
  // login
  socket.emit('login', {username, avatar})
})
socket.on('loginError', data => {
  alert(data.msg)
})
socket.on('loginSuccess', data => {
  // 显示聊天窗口，隐藏登录窗口
  $('.login_box').fadeOut()
  $('.container').fadeIn()
  // 设置用户信息
  $('.avatar_url').attr('src', data.avatar)
  $('.username').text(data.username)
  // 全局保存用户名，头像
  username = data.username
  avatar = data.avatar
})

// 新用户加入
socket.on('addUser', data => {
  // 添加一条系统信息
  $('.box-bd').append(`
    <div class="system">
      <p class="message_system">
        <span class="content">${data.username} 加入了群聊</span>
      </p>
    </div>
  `)
  // scrollView
  scrollView()
})
// 用户离开
socket.on('deleteUser', data => {
  // 添加一条系统信息
  $('.box-bd').append(`
    <div class="system">
      <p class="message_system">
        <span class="content">${data.username} 离开了群聊</span>
      </p>
    </div>
  `)
  // scrollView
  scrollView()
})

// 群聊信息 userList
socket.on('userList', data => {
  $('.user-list ul').html('')
  data.forEach((user) => {
    $('.user-list ul').append(`
      <li class="user">
        <div class="avatar"><img src="${user.avatar}" alt=""></div>
        <div class="name">${user.username}</div>
      </li>
    `)
  })
  // 群聊人数
  const count = data.length
  $('#chatName .userCount').text(count)
})


// 聊天功能
$('.btn-send').on('click', () => {
  // 获取聊天内容  （里面的内容其实时一个个标签元素）
  const content = $('#content').html().trim()
  $('#content').html('')
  if (!content) return alert('请输入内容')
  // 发送给服务器
  socket.emit('sendMsg', {
    msg: content,
    username,
    avatar
  })
})
// 接收聊天信息
socket.on('receiveMsg', data => {
  // 显示到聊天窗口
  if (data.username === username) {
    // 自己的消息
    $('.box-bd').append(`
      <div class="message-box">
        <div class="my message">
          <img src="${data.avatar}" alt="" class="avatar">
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">${data.msg}</div>
            </div>
          </div>
        </div>
      </div>
    `)
  } else {
    // 别人的消息
    $('.box-bd').append(`
      <div class="message-box">
        <div class="other message">
          <img src="${data.avatar}" alt="" class="avatar">
          <div class="nickname">${data.username}</div>
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">${data.msg}</div>
            </div>
          </div>
        </div>
      </div>
    `)
  }
  // 当前元素的底部要滚动到可视区
  scrollView()
})

function scrollView() {
  $('.box-bd').children(':last').get(0).scrollIntoView()
}


// 发送图片功能
$('#file').on('change', function() {
  const file = this.files[0]
  const fr = new FileReader()
  fr.readAsDataURL(file)
  fr.onload = function() {
    socket.emit('sendImg', {
      username,
      avatar,
      img: fr.result
    })
  }
})
// 监听图片聊天信息
socket.on('receiveImg', data => {
  // 显示到聊天窗口
  if (data.username === username) {
    // 自己的消息
    $('.box-bd').append(`
      <div class="message-box">
        <div class="my message">
          <img src="${data.avatar}" alt="" class="avatar">
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">
                <img src="${data.img}" />
              </div>
            </div>
          </div>
        </div>
      </div>
    `)
  } else {
    // 别人的消息
    $('.box-bd').append(`
      <div class="message-box">
        <div class="other message">
          <img src="${data.avatar}" alt="" class="avatar">
          <div class="nickname">${data.username}</div>
          <div class="content">
            <div class="bubble">
              <div class="bubble_cont">
                <img src="${data.img}" />
              </div>
            </div>
          </div>
        </div>
      </div>
    `)
  }
  // 当前元素的底部要滚动到可视区(要等待图片加载完成)
  $('.box-bd img:last').on('load', function() {
    scrollView()
  })
})


// 表情包功能
// 初始化jquery-emoji插件
$('.face').on('click', function() {
  $('#content').emoji({
    // 设置触发表情的按钮
    button: '.face',
    // 其他设置
    showTab: false,
    animation: 'slide',
    position: 'topRight',
    icons: [{
        name: "QQ表情",
        path: "lib/jquery-emoji/img/qq/",
        maxNum: 91,
        excludeNums: [41, 45, 54],
        file: ".gif"
    }]
  })
})

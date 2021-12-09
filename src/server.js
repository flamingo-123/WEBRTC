const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
app.use(express.static(path.join(__dirname, '../public/layout.html')));
let connectedUsers = [];
io.on('connection', socket => {
  connectedUsers.push(socket.id);
  socket.on('disconnect', () => {
    connectedUsers = connectedUsers.filter(user => user !== socket.id)      //这里这是我们去除的丢失连接的客户
    socket.broadcast.emit('update-user-list', { userIds: connectedUsers })  //我们进行更新
  })
  socket.on('mediaOffer', data => {
    socket.to(data.to).emit('mediaOffer', {
      from: data.from,
      offer: data.offer
    });
  });  //我们这里选择去哪个 用户
  socket.on('mediaAnswer', data => {
    socket.to(data.to).emit('mediaAnswer', {
      from: data.from,
      answer: data.answer
    });
  });

  socket.on('iceCandidate', data => {
    socket.to(data.to).emit('remotePeerIceCandidate', {
      candidate: data.candidate
    })
  })
  // socket.on('iceCandidate', data => {
  //   socket.broadcast.emit('remotePeerIceCandidate', {
  //     candidate: data.candidate
  //   })
  // }) 创建会议室，把特定的人加入频道。


  socket.on('requestUserList', () => {
    socket.emit('update-user-list', { userIds: connectedUsers });
    socket.broadcast.emit('update-user-list', { userIds: connectedUsers });
  });

// 聊天功能的实现

  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });
});


http.listen(3000, () => {
   console.log("连接成功！");
});

// const express = require('express');
// const app = express();

// const http = require('http').Server(app);

// const server = require('./../server');

const socketConnection = (io) => {
  //   const io = require('socket.io')(server);

  io.sockets.on('connection', (socket) => {
    //   socket.on('username', function (username) {
    //     socket.username = username;
    //     io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
    //   });

    // socket.on('disconnect', function (username) {
    //   io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
    // });

    socket.on('join_chat', (room_id) => {
      console.log('Join chat event. Romm_Id: ', room_id);
      socket.join(room_id);
      // socket.to(room).emit('is_online', socket.username + ' joined the chat...');
      // socket.emit('is_online', socket.username + ' joined the chat...');
    });

    socket.on('username', (username) => {
      console.log('Username event...');
      socket.username = username;
      // socket.to(room).emit('is_online', socket.username + ' joined the chat...');
      socket.emit('is_online', socket.username + ' joined the chat...');
    });

    socket.on('chat_message', (room_id, message) => {
      console.log('Sending message. Room_id: ' + room_id + ' Message: ' + message);
      // socket.emit('chat_message', socket.username + ': ' + message);
      io.to(room_id).emit('chat_message', message);
    });

    socket.on('disconnect', (username) => {
      // socket.to(room).emit('is_online', socket.username + ' left the chat...');
      socket.emit('is_online', socket.username + ' left the chat...');
    });
  });

  return io;
};

module.exports = socketConnection;
// app.get('/', function (req, res) {
//   res.send('hello world');
// });

// const server = http.listen(8080, function () {
//   console.log('listening on 8080...');
// });

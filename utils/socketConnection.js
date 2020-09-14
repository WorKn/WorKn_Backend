// const express = require('express');
// const app = express();

// const http = require('http').Server(app);

// const server = require('./../server');

const socketConnection = (io) => {
  //   const io = require('socket.io')(server);

  io.sockets.on('connection', function (socket) {
    //   socket.on('username', function (username) {
    //     socket.username = username;
    //     io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
    //   });

    // socket.on('disconnect', function (username) {
    //   io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
    // });

    socket.on('username', function (username) {
      console.log('Username event...');
      socket.username = username;
      io.emit('is_online', socket.username + ' joined the chat...');
    });

    socket.on('chat_message', function (message) {
      io.emit('chat_message', socket.username + ': ' + message);
    });

    socket.on('disconnect', function (username) {
      io.emit('is_online', socket.username + ' left the chat...');
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

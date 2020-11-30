const socketConnection = (io) => {
  io.sockets.on('connection', (socket) => {
    socket.on('join_chat', (room_id) => {
      console.log('Join chat event. Romm_Id: ', room_id);
      socket.join(room_id);
    });

    socket.on('chat_message', (room_id, message) => {
      console.log('Sending message. Room_id: ' + room_id + ' Message: ' + message);
      io.to(room_id).emit('chat_message', message);
    });

    socket.on('chat_typing', (room_id) => {
      console.log('Typing. Room_id: ' + room_id);
      io.to(room_id).emit('chat_typing');
    });
  });

  return io;
};

module.exports = socketConnection;

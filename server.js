const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express(); // initiate express
const server = http.createServer(app); // server 
const io = socketio(server); // socketio add server just through

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';

/*Please see this cheat sheet for a SOCKET IO emit cheatsheet - ie documents
what emit, broadcast, to etc means. The second links is good for rooms and namespaces */
// https://socket.io/docs/emit-cheatsheet/
// https://socket.io/docs/rooms-and-namespaces/

// Run when client connects
io.on('connection', socket => { // on connection
  socket.on('joinRoom', ({ username, room }) => { // on joinroom from client 
    const user = userJoin(socket.id, username, room); // get user object from userJoin - this is in utils

    socket.join(user.room);  // socket.join 
    // You can call join to subscribe the socket to a given channel: ie io.to('some room').emit('some event');


    // Welcome current user.  emit ==  sending to the client
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

    // Broadcast when a user connects (// sending to all clients except sender)
    socket.broadcast // broadcast to a channel
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info - emit user.room and users 
    // 
    io.to(user.room).emit('roomUsers', {
      room: user.room, 
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', { // this is to updates room/users info on sidebar
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utlis/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utlis/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server); // connect socketio to server

// set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "chatbot"; // use botname variable alot

io.on("connection", (socket) => { // on connection = socket is a parameter
    socket.on('joinRoom', ({ username, room }) => { // on joinroom - this is an event identified in main.js
        const user = userJoin(socket.id, username, room); // const user assigned to to a function which returns a user object
    
        socket.join(user.room); // socket join a room (join is a method associated with socket)
    
        // Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!')); // emit is a message that just goes to user. 
    
        // Broadcast when a user connects // this goes to all users bar the actual user that triggers event
        socket.broadcast
          .to(user.room) // to is a socket function - to people who are in socket room
          .emit( // emit message -broadcast goes to everyone but person who has triggered event
            'message',
            formatMessage(botName, `${user.username} has joined the chat`)
          );
  });

  //listen for chatmessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id); //use getcurrent user from  function - this return an object - including user.room
    io.to(user.room).emit('message', formatMessage(user.username, msg)); // io.to user.room - only send TO user room.

  });

  // when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id); // 
    if(user){
      io.emit("message", formatMessage(botName, `${user.username} has left the chat`)); // 
    }
    
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on ${PORT}`));

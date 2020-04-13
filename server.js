
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utlis/messages');


const app = express();
const server = http.createServer(app);
const io = socketio(server);



// set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botname = 'chatbot'

io.on('connection', socket => {

    socket.on('joinRoom', ({username, room})=> {

            // message to the user 
    socket.emit('message', formatMessage(botname, 'Welcome to chatcord!'))


    //broadcast whn a usr connects - but not to user
    socket.broadcast.emit('message', 'A user has joined the chat');

    })


      //listen for chatmessage

      socket.on('chatMessage', (msg) => {
        io.emit('message', formatMessage(botname,msg));
    })


    // when client disconnects
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the chat')
    })

  
});


const PORT = 3000 || process.env.PORT;

server.listen(PORT, ()=> console.log(`Server running on ${PORT}`))
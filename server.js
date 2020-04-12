
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');



const app = express();
const server = http.createServer(app);
const io = socketio(server);



// set static folder
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
    // message to the user 
    socket.emit('message', 'Welcome to chatcord!')


    //broadcast whn a usr connects - but not to user
    socket.broadcast.emit('message', 'A user has joined the chat');

    // when client disconnects
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the chat')
    })
});


const PORT = 3000 || process.env.PORT;

server.listen(PORT, ()=> console.log(`Server running on ${PORT}`));
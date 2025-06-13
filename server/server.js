const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Store connected users
const users = {};

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // Handle new user joining
    socket.on('new-user', (name) => {
        users[socket.id] = name;
        socket.broadcast.emit('user-connected', name);
        io.emit('update-users', users);
    });

    // Handle chat messages
    socket.on('send-chat-message', (message) => {
        socket.broadcast.emit('chat-message', {
            message,
            name: users[socket.id]
        });
    });

    // Handle typing indicator
    socket.on('typing', () => {
        socket.broadcast.emit('user-typing', users[socket.id]);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const disconnectedUser = users[socket.id];
        if (disconnectedUser) {
            socket.broadcast.emit('user-disconnected', disconnectedUser);
            delete users[socket.id];
            io.emit('update-users', users);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

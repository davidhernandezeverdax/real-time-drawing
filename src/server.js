const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let users = [];

app.use(express.static('public'));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

let lineHistory = [];

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    // Send history lines to new users
    lineHistory.forEach((line) => {
        socket.emit('draw_line', line);
    });

    // Event for drawing user
    socket.on('draw_line', (data) => {
        lineHistory.push(data);
        io.emit('draw_line', data);
    });

    // Evento for join new user
    socket.on('joinRoom', ({ username, userColor }) => {
        users.push({ id: socket.id, username, color: userColor });
        io.emit('updateUserList', users);
    });

    // Event for disconnect user
    socket.on('disconnect', () => {
        console.log('User disconnected');
        users = users.filter(user => user.id !== socket.id);
        io.emit('updateUserList', users);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

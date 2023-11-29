const socket = io();
let username = '';
let userColor = '';
let drawing = false;
let lastX = null;
let lastY = null;

const canvas = document.getElementById('drawingCanvas');
const context = canvas.getContext('2d');

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', () => stopDrawing(false));
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseout', () => stopDrawing(true));

socket.on('draw_line', data => {
    drawLine(data.x0, data.y0, data.x1, data.y1, data.color);
});

function startDrawing(e) {
    drawing = true;
    draw(e);
}

function stopDrawing(reset) {
    drawing = false;
    if (reset) {
        lastX = null;
        lastY = null;
    }
}

function draw(e) {
    if (!drawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (lastX !== null && lastY !== null) {
        socket.emit('draw_line', {
            x0: lastX, y0: lastY, x1: x, y1: y, color: userColor
        });
    }

    lastX = x;
    lastY = y;
}

function drawLine(x0, y0, x1, y1, color) {
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();
}

function joinRoom() {
    username = document.getElementById('username').value;
    console.log("sss", username)
    if (username) {
        userColor = getRandomColor();
        socket.emit('joinRoom', { username, userColor });
        document.getElementById('entryForm').style.display = 'none';
        document.getElementById('drawingArea').style.display = 'block';
    }
}
socket.on('updateUserList', users => {
    const usersPanel = document.getElementById('usersPanel');
    usersPanel.innerHTML = '';
    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.innerText = user.username;
        userDiv.style.color = user.color;
        usersPanel.appendChild(userDiv);
    });
});
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

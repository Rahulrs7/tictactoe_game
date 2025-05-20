import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const cors = require('cors');
const server = http.createServer(app);
const allowedOrigin = 'https://tictactoe-game-ppu3.vercel.app';

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST'],
  credentials: true
}));

let waitingPlayers = [];

io.on('connection', socket => {
  console.log(`Player connected: ${socket.id}`);

  // Matchmaking
  if (waitingPlayers.length > 0) {
    const opponent = waitingPlayers.shift();
    const room = `room-${opponent.id}-${socket.id}`;

    socket.join(room);
    opponent.join(room);

    const symbol = {
      [opponent.id]: 'X',
      [socket.id]: 'O',
    };

    io.to(room).emit('startGame', { room, symbol });
  } else {
    waitingPlayers.push(socket);
  }

  // Handle moves
  socket.on('makeMove', ({ room, squares }) => {
    socket.to(room).emit('opponentMove', squares);
  });

  // Reset game in the same room
  socket.on('resetGame', room => {
    io.to(room).emit('gameReset');
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);

    waitingPlayers = waitingPlayers.filter(p => p.id !== socket.id);

    // Notify all rooms this socket was in
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    rooms.forEach(room => {
      socket.to(room).emit('opponentLeft');
    });
  });
});

server.listen(3000, () => {
  console.log('Multiplayer server running on port 3000');
});

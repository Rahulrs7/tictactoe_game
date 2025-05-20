// src/socket.js
import { io } from 'socket.io-client';

const socket = io('https://tictactoe-game-hnsh.onrender.com');

export default socket;

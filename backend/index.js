const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const backendEnvPath = path.resolve(__dirname, '.env');
const rootEnvPath = path.resolve(__dirname, '../.env');

dotenv.config({
  path: fs.existsSync(backendEnvPath) ? backendEnvPath : rootEnvPath,
});
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { validateRequiredEnv } = require('./config/env');

validateRequiredEnv();

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Semi-Social API is running' });
});

// Socket.io connection
const onlineUserConnections = new Map(); // track number of connections per user ID

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('user_online', (userId) => {
    socket.data.userId = userId;
    const strId = String(userId);
    const count = onlineUserConnections.get(strId) || 0;
    onlineUserConnections.set(strId, count + 1);
    io.emit('online_users', Array.from(onlineUserConnections.keys()));
  });

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.data.userId) {
      const strId = String(socket.data.userId);
      const count = onlineUserConnections.get(strId) || 0;
      if (count <= 1) {
        onlineUserConnections.delete(strId);
      } else {
        onlineUserConnections.set(strId, count - 1);
      }
      io.emit('online_users', Array.from(onlineUserConnections.keys()));
    }
  });
});

server.listen(PORT, '0.0.0.0',() => {
  console.log(`Server running on port ${PORT}`);
});

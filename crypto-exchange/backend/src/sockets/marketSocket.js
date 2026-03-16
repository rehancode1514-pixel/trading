const { Server } = require('socket.io');
const { startBinanceWebSockets } = require('../services/binanceService');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // For dev, allow all. In prod, restrict to frontend domain.
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    // Clients can send a join room event to listen to a specific trading pair
    socket.on('subscribe_pair', (pair) => {
      socket.join(pair);
      console.log(`Socket ${socket.id} subscribed to ${pair}`);
    });

    socket.on('unsubscribe_pair', (pair) => {
      socket.leave(pair);
      console.log(`Socket ${socket.id} unsubscribed from ${pair}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected', socket.id);
    });
  });

  // Start binance web sockets that broadcast to io
  startBinanceWebSockets(io);

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initSocket,
  getIo,
};

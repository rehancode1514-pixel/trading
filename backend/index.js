const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./src/config/db');
const { initSocket } = require('./src/sockets/marketSocket');
const { startTradeWorker } = require('./src/services/tradeWorker');
const { seedLeaderboard } = require('./src/controllers/adminController');

// Connect to DB
connectDB();

// Connect Redis & RabbitMQ with graceful degradation
(async () => {
  try {
    const { createClient } = require('redis');
    const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    redisClient.on('error', () => {});
    await redisClient.connect().catch(() => console.log('Redis unavailable, skipping'));
    global.redisClient = redisClient;
  } catch (e) { console.log('Redis optional - skipping'); }

  try {
    const amqp = require('amqplib');
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    const conn = await amqp.connect(rabbitUrl).catch(() => null);
    if (conn) {
      const ch = await conn.createChannel();
      await ch.assertQueue('order_queue', { durable: true });
      global.rabbitChannel = ch;
      console.log('RabbitMQ connected');
    } else {
      console.log('RabbitMQ unavailable, skipping');
    }
  } catch (e) { console.log('RabbitMQ optional - skipping'); }

  // Seed mock data
  await seedLeaderboard().catch(() => {});
})();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start Trade Worker
startTradeWorker();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/m-data', require('./src/routes/marketRoutes'));
app.use('/api/trade', require('./src/routes/tradeRoutes'));
app.use('/api/wallet', require('./src/routes/walletRoutes'));
app.use('/api/futures', require('./src/routes/futuresRoutes'));
app.use('/api/social', require('./src/routes/socialRoutes'));

app.get('/', (req, res) => {
  res.send('Crypto Exchange API is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

let isConnected = false;

export const connectRedis = async () => {
  if (!isConnected) {
    try {
      await redisClient.connect();
      isConnected = true;
      console.log('Redis connected successfully');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
    }
  }
};

export default redisClient;

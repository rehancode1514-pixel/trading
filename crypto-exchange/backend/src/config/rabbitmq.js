import amqp from 'amqplib';

let connection = null;
let channel = null;

export const connectRabbitMQ = async () => {
  if (!connection) {
    try {
      const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      connection = await amqp.connect(rabbitUrl);
      channel = await connection.createChannel();
      
      const queue = 'order_queue';
      await channel.assertQueue(queue, { durable: true });
      
      console.log('RabbitMQ connected and queue initialized');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
    }
  }
};

export const publishOrderToQueue = async (orderData) => {
  if (!channel) return false;
  
  try {
    const queue = 'order_queue';
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(orderData)), {
      persistent: true
    });
    return true;
  } catch (err) {
    console.error('Failed to publish order', err);
    return false;
  }
};

export const consumeOrderQueue = async (callback) => {
  if (!channel) return;
  
  const queue = 'order_queue';
  await channel.consume(queue, (msg) => {
    if (msg !== null) {
      const order = JSON.parse(msg.content.toString());
      callback(order);
      channel.ack(msg);
    }
  });
};

export default { connectRabbitMQ, publishOrderToQueue, consumeOrderQueue };

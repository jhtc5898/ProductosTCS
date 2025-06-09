const amqp = require('amqplib');

let channel;

async function connectQueue() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await conn.createChannel();
  await channel.assertQueue('product_queue');
}

async function sendToQueue(message) {
  if (!channel) await connectQueue();
  if (!channel) {
    throw new Error("❌ No se pudo establecer conexión con RabbitMQ");
  }
  if (!message || typeof message !== 'object') {
    throw new Error("❌ El mensaje debe ser un objeto válido");
  }
  console.log("📤 Enviando mensaje a la cola product_queue:", message);
  
  channel.sendToQueue('product_queue', Buffer.from(JSON.stringify(message)));
}

module.exports = {
  sendToQueue
};

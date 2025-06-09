require('dotenv').config();
const amqp = require('amqplib');
const bd2 = require('../BD2/bd2'); // Asegúrate de que este archivo exista y esté configurado correctamente

async function connectWithRetry(retries = 20, delay = 5000) {
  while (retries > 0) {
    try {
      const conn = await amqp.connect(process.env.RABBITMQ_URL);
      console.log("✅ Conectado a RabbitMQ");
      return conn;
    } catch (err) {
      console.error(`❌ Error de conexión a RabbitMQ (${retries} intentos restantes)...`);
      retries--;
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error("❌ No se pudo conectar a RabbitMQ después de varios intentos");
}

async function startWorker() {
  const conn = await connectWithRetry();
  const channel = await conn.createChannel();
  await channel.assertQueue('product_queue');
  console.log("🎧 Escuchando cola product_queue");

  channel.consume('product_queue', (msg) => {
    const content = JSON.parse(msg.content.toString());
    console.log("📥 Producto recibido y procesado:", content);

    // Aquí puedes agregar la lógica para procesar el producto
    // Por ejemplo, guardar en la base de datos o realizar alguna acción
    bd2.saveProduct(content)
      .then(() => {
        console.log("✅ Producto guardado en la base de datos 2:", content);
      })
      .catch(err => {
        console.error("❌ Error al guardar el producto en la base de datos:", err);
      });

    channel.ack(msg);
  });
}

startWorker().catch(console.error);

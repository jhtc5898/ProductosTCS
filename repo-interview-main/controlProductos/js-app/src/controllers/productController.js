const { sendToQueue } = require('../queue/productQueue');

const assignProduct = async (req, res) => {
  const product = req.body;

  if (!product.id || !product.name) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  await sendToQueue(product);
  res.status(202).json({ message: 'Producto encolado correctamente' });
};

module.exports = { assignProduct };

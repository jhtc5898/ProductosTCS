const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

app.use('/auth', authRoutes);
app.use('/products', productRoutes); // Aquí tus rutas protegidas

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
});

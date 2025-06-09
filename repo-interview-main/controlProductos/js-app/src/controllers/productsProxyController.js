const axios = require("axios");
const { sendToQueue } = require("../queue/productQueue");
const redisClient = require("../config/redisClient");
const BASE_URL = "http://host.docker.internal:3002/bp/products/";
const db2 = require("../BD2/bd2");

//const BASE_URL = process.env.PRODUCTS_API_URL;
const CACHE_TTL = 60; // segundos

const proxyController = {
  getAll: async (req, res) => {
  try {
      const cacheKey = "products:all";

      const cached = await redisClient.get(cacheKey);

      if (cached) {
        console.log("Respuesta desde Redis");
        return res.json(JSON.parse(cached));
      }

      const response = await axios.get(BASE_URL);

      // Guardar en Redis
      await redisClient.set(cacheKey, JSON.stringify(response.data), {
        EX: CACHE_TTL, // Expira en 60 segundos
      });

      console.log("Respuesta desde API");
      res.json(response.data);
    } catch (err) {
      res.status(err.response?.status || 500).json({ error: err.message });
    }
  },
  getAllSecond: async (req, res) => {
  try {
      
      const response = await db2.getAllProducts();
         console.log("Respuesta desde API");
      res.json(response.data);
    } catch (err) {
      res.status(err.response?.status || 500).json({ error: err.message });
    }
  },

  getById: async (req, res) => {
    try {
       const cacheKey = "products:" + req.params.id;
        
       const cached = await redisClient.get(cacheKey);

        if (cached) {
          console.log("Respuesta desde Redis");
          return res.json(JSON.parse(cached));
        }

      const response = await axios.get(`${BASE_URL}${req.params.id}`);
      // Guardar en Redis
      await redisClient.set(cacheKey, JSON.stringify(response.data), {
        EX: CACHE_TTL, // Expira en 60 segundos
      });
      console.log("Respuesta desde API");
      res.json(response.data);
    } catch (err) {
      console.error("Error al obtener el producto:", err);
      res.status(err.response?.status || 500).json({ error: err.message });
    }
  },

  verifyId: async (req, res) => {
    try {
      // No se usa caché para verificación de ID
      const response = await axios.get(`${BASE_URL}verification/${req.params.id}`);
      res.json(response.data);
    } catch (err) {
      console.error("Error al obtener el producto:", err);
      res.status(err.response?.status || 500).json({ error: err.message });
    }
  },

  create: async (req, res) => {
    const product = req.body;

    if (!product.id || !product.name) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    try {
      const response = await axios.post(BASE_URL, product);
      
      // Enviar a la cola después de confirmar que el POST fue exitoso
      await sendToQueue(product);
      
      // Limpiar caché de productos
      await redisClient.del("products:all");
      res.status(202).json({
        message: "Producto encolado y creado correctamente",
        data: response.data,
      });
    } catch (err) {
      if (err.response && err.response.status === 400) {
        return res.status(409).json({ error: err.response.data || "Error al crear el producto" });
      }
     
      res.status(err.response?.status || 500).json({ error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const response = await axios.put(`${BASE_URL}${req.params.id}`, req.body);
        // Limpiar caché de productos
      await redisClient.del("products:all");
      await redisClient.del(`products:${req.params.id}`);

      //Actualizar el caché del producto específico
      await redisClient.set(`products:${req.params.id}`, JSON.stringify(response.data), {
        EX: CACHE_TTL, // Expira en 60 segundos
      });
      
      res.json(response.data);
    } catch (err) {
      console.error("Error al obtener el producto:", err);
      res.status(err.response?.status || 500).json({ error: err.message });
    }
  },

  remove: async (req, res) => {
    try {
      const response = await axios.delete(`${BASE_URL}${req.params.id}`);
       // Limpiar caché de productos
      await redisClient.del("products:all");
      await redisClient.del(`products:${req.params.id}`);

      res.json(response.data);
    } catch (err) {
      console.error("Error al obtener el producto:", err);
      res.status(err.response?.status || 500).json({ error: err.message });
    }
  },
};

module.exports = proxyController;

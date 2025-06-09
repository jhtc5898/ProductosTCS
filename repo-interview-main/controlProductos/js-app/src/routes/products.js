
const express = require("express");
const router = express.Router();
const proxyController = require("../controllers/productsProxyController");
const verifyToken = require("../middlewares/verifyToken");

//router.post('/assign', assignProduct);

// Agrega el middleware de JWT antes de cada ruta
router.get("/", verifyToken, proxyController.getAll);
router.get("/db2/", verifyToken, proxyController.getAllSecond);
router.get("/:id", verifyToken, proxyController.getById);
router.get("/verification/:id", verifyToken, proxyController.verifyId);
router.post("/", verifyToken, proxyController.create);
router.put("/:id", verifyToken, proxyController.update);
router.delete("/:id", verifyToken, proxyController.remove);

module.exports = router;
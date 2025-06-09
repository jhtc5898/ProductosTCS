//Generamos la base de datos de forma local como array de objetos
const products = [];

//Funcion para guardar un producto

async function saveProduct(product) {
  return new Promise((resolve, reject) => {
    if (!product || !product.id || !product.name) {
      return reject(new Error("Producto inválido"));
    }
    
    // Verificamos si el producto ya existe
    const existingProduct = products.find(p => p.id === product.id);
    if (existingProduct) {
      return reject(new Error("El producto ya existe"));
    }

    // Agregamos el producto al array
    products.push(product);
    resolve(product);
  });
}

//Obtener todos los productos
async function getAllProducts() {
  return new Promise((resolve) => {
    resolve(products);
  });
}

module.exports = {
  saveProduct,
  getAllProducts
};
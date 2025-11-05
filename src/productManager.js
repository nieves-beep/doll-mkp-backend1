import fs from "fs/promises";
import crypto from "crypto";

class ProductManager {
  constructor(pathFile) {
    this.pathFile = pathFile;
  }

  // ID UNICO
  generateNewId() {
    return crypto.randomUUID();
  }

  // NUEVO PRODUCTO
  async addProduct(newProduct) {
    try {
      // RECUPERA PRODUCTOS
      const fileData = await fs.readFile(this.pathFile, "utf-8");
      const products = JSON.parse(fileData);

      const newId = this.generateNewId();
      const product = { id: newId, ...newProduct };
      
      // AGREGA
      products.push(product);

      // VERIFICA SI SE CARGO BIEN ANTES DE GUARDAR
      console.log("Productos después de agregar el nuevo:", products);

      // GUARDA ACTUALIZADO EN JSON
      await fs.writeFile(this.pathFile, JSON.stringify(products, null, 2), "utf-8");

      return products;
    } catch (error) {
      throw new Error("Error al añadir el nuevo producto: " + error.message);
    }
  }

  // OBTIENE PRODUCTOS
  async getProducts() {
    try {
      // RECUPERA DESDE JSON
      const fileData = await fs.readFile(this.pathFile, "utf-8");
      const products = JSON.parse(fileData);

      return products;
    } catch (error) {
      throw new Error("Error al traer los productos: " + error.message);
    }
  }

  // ACTUALIZA POR ID
  async setProductById(pid, updates) {
    try {
      // RECUPERA DESDE JSON
      const fileData = await fs.readFile(this.pathFile, "utf-8");
      const products = JSON.parse(fileData);

      const indexProduct = products.findIndex((product) => product.id === pid);
      if (indexProduct === -1) throw new Error("Producto no encontrado");

      // ACTUALIZA EN EL ARRAY
      products[indexProduct] = { ...products[indexProduct], ...updates };

      // GUARDA ACTUALIZADO EN JSON
      await fs.writeFile(this.pathFile, JSON.stringify(products, null, 2), "utf-8");

      return products;
    } catch (error) {
      throw new Error("Error al actualizar un producto: " + error.message);
    }
  }

  // ELIMINA POR ID
  async deleteProductById(pid) {
    try {
      // RECUPERA DESDE JSON
      const fileData = await fs.readFile(this.pathFile, "utf-8");
      const products = JSON.parse(fileData);

      // FILTRA PRODUCTO PARA ELIMINAR
      const filteredProducts = products.filter((product) => product.id !== pid);

      // GUARDA ACTUALIZADO EN JSON
      await fs.writeFile(this.pathFile, JSON.stringify(filteredProducts, null, 2), "utf-8");

      return filteredProducts;
    } catch (error) {
      throw new Error("Error al borrar el producto: " + error.message);
    }
  }
}

export default ProductManager;

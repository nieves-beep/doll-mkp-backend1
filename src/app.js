import express from "express";
import ProductManager from "./productManager.js";
import CartManager from "./cartManager.js";

const cartManager = new CartManager("./src/carts.json");

const app = express();

app.use( express.json() );
const productManager = new ProductManager("./src/products.json");

//endpoints
app.get("/", (req, res)=> {
  res.json( { status: "success", message: "Hola Mundo!" } )
})

app.get("/api/products", async(req, res)=> {
  try {
    const products = await productManager.getProducts();
    res.status(200).json({ message: "Lista de productos", products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/products/:pid", async(req, res)=> {
  try {
    const pid = req.params.pid;
    const products = await productManager.deleteProductById(pid);
    res.status(200).json({ message: "Producto Eliminado", products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/products", async(req, res)=> {
  try {
    const newProduct = req.body;
    const products = await productManager.addProduct(newProduct);
    res.status(201).json({ message: "Producto agregado", products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/products/:pid", async(req, res)=> {
  try {
    const pid = req.params.pid;
    const updates = req.body;

    const products = await productManager.setProductById(pid, updates);
    res.status(200).json({ message: "Producto Actualizado", products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// carritos

// carrito vacío (POST /api/carts)

app.post("/api/carts", async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json({ message: "Carrito creado", newCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// obtiene productos del carrito por id (GET /api/carts/:cid)

app.get("/api/carts/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartManager.getCartById(cid);
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// agrega productos al carrito (POST /api/carts/:cid/product/:pid)

app.post("/api/carts/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.addProductToCart(cid, pid);
    res.status(200).json({ message: "Producto agregado al carrito", updatedCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//devuelve un producto buscado a traves de su id
app.get("/api/products/:pid", async(req, res)=> {});

// /api/carts

//crea carritos vacios
app.post("/api/carts", async(req, res)=> {});

//trae los productos de un carrito elegido por su id
app.get("/api/carts/:cid", async(req, res)=> {});


app.post("/api/carts/:cid/product/:pid", async(req, res)=> {});


app.listen(8080, ()=> {
  console.log("Servidor iniciado correctamente en el puerto 8080!");
});

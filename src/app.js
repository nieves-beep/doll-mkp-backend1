import express from "express";
import http from "http";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import viewsRouter from "./routes/views.router.js";
import ProductManager from "./productManager.js";

const app = express();
const server = http.createServer(app);

// WEBSOCKET
const io = new Server(server);

// RUTAS ESATATICAS
app.use(express.static("public"));

// HANDLEBARS
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

const productManager = new ProductManager("./src/products.json");

// RUTA REAL TIME PRODUCTS
app.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render("realTimeProducts", { products });
  } catch (error) {
    res.status(500).send("Error al obtener los productos");
  }
});

// WEBSOCKET MANEJO DE PRODUCTS
io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado! " + socket.id);

  try {
    const products = await productManager.getProducts();
    socket.emit("productList", products);
  } catch (error) {
    console.error("Error al obtener los productos para el cliente:", error.message);
  }

  // AGREGAR PRODUCTO
  socket.on("newProduct", async (product) => {
    try {
      await productManager.addProduct(product); 
      io.emit("productAdded", product);
    } catch (error) {
      console.error("Error al agregar el producto:", error.message);
    }
  });

  // ELIMINAR PRODUCTO
  socket.on("deleteProduct", async (productId) => {
    try {
      await productManager.deleteProductById(productId); 
      io.emit("productDeleted", productId);
    } catch (error) {
      console.error("Error al eliminar el producto:", error.message);
    }
  });
});

app.use("/", viewsRouter);

server.listen(8080, () => {
  console.log("Servidor iniciado correctamente en http://localhost:8080");
});

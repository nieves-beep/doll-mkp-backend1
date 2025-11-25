import express from "express";
import http from "http";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import viewsRouter from "./routes/views.router.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import connectMongoDB from "./config/db.js";
import { CartModel } from "./models/carts.model.js";
import dotenv from "dotenv";

dotenv.config();

await connectMongoDB();
console.log("MongoDB conectado:", process.env.STRING_MONGODB);

// CARRITO GLOBAL

let globalCartId = null;

const ensureGlobalCart = async () => {
  if (!globalCartId) {
    const cart = await CartModel.create({ products: [] });
    globalCartId = cart._id.toString();
    console.log("Carrito global creado:", globalCartId);
  }
};

await ensureGlobalCart();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.set("io", io);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


app.use((req, res, next) => {
  res.locals.cartId = globalCartId;
  next();
});

// HANDLEBARS

app.engine(
  "handlebars",
  engine({
    helpers: {
      reduce(products) {
        if (!products) return 0;
        let total = 0;
        products.forEach((item) => {
          if (item.product && item.product.price) {
            total += item.product.price * item.quantity;
          }
        });
        return total;
      },
    },
  })
);

app.set("view engine", "handlebars");
app.set("views", "./src/views");

// ROUTERS
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// SOCKET.IO
io.on("connection", () => {
  console.log("Cliente conectado");
});

// SERVER
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Servidor funcionando en puerto ${PORT}`);
});

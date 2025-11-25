import express from "express";
import http from "http";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import viewsRouter from "./routes/views.router.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import connectMongoDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.set("io", io);

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./src/public"));

// HANDLEBARS
app.engine("handlebars", engine());
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

const startServer = async () => {
    try {
        await connectMongoDB();
        console.log("MongoDB conectado, iniciando servidor...");

        const PORT = process.env.PORT || 8080;
        server.listen(PORT, () => {
            console.log(`Server funcionando en puerto ${PORT}`);
        });
    } catch (error) {
        console.error("No se pudo iniciar el servidor:", error);
    }
};

startServer();

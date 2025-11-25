import { Router } from "express";
import { ProductModel } from "../models/products.model.js";
import { CartModel } from "../models/carts.model.js";

const router = Router();

/* GET */

router.get("/", (req, res) => {
  res.redirect("/products");
});

/* GET */

router.get("/products", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    let filter = {};
    if (query) {
      if (query === "available") filter.stock = { $gt: 0 };
      else filter.category = query;
    }

    let sortOptions = {};
    if (sort === "asc") sortOptions.price = 1;
    if (sort === "desc") sortOptions.price = -1;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOptions,
      lean: true,
    };

    const result = await ProductModel.paginate(filter, options);

  res.render("products", {
  title: "Productos",
  style: "style.css",
  products: result.docs,
  hasPrevPage: result.hasPrevPage,
  hasNextPage: result.hasNextPage,
  prevPage: result.prevPage,
  nextPage: result.nextPage,
  page: result.page,
  cartId: res.locals.cartId
});


  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar productos");
  }
});

/* GET */

router.get("/products/:pid", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.pid).lean();

    if (!product) return res.status(404).send("Producto no encontrado");

    res.render("product", {
      title: product.title,
      style: "style.css",
      product,
      cartId: res.locals.cartId
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar detalle");
  }
});

/* GET */

router.get("/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await CartModel.findById(cid)
      .populate("products.product")
      .lean();

    if (!cart) {
      return res.status(404).send("Carrito no encontrado");
    }

    const total = cart.products.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);

    res.render("cart", {
      title: "Mi carrito",
      cart,
      total
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar carrito");
  }
});

/* POST */

router.post("/carts/:cid/add/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).send("Carrito no encontrado");

    const existing = cart.products.find(p => p.product.toString() === pid);

    if (existing) existing.quantity += 1;
    else cart.products.push({ product: pid, quantity: 1 });

    await cart.save();

    res.redirect("/products");

  } catch (error) {
    console.error(error);
    res.status(500).send("Error al agregar producto al carrito");
  }
});

/* GET */

router.get("/realtimeproducts", (req, res) => {
  res.render("real.time.products", {
    title: "Productos en tiempo real",
    style: "style.css"
  });
});

export default router;

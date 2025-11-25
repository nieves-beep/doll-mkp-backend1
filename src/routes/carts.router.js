import { Router } from "express";
import { CartModel } from "../models/carts.model.js";
import { ProductModel } from "../models/products.model.js";

const router = Router();

const isHtmlRequest = (req) => {
  const accept = req.get("accept") || "";
  return accept.includes("text/html");
};

/* POST */

router.post("/", async (req, res) => {
  try {
    const newCart = await CartModel.create({ products: [] });
    return res.status(201).send({ status: "success", payload: newCart });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ status: "error", error: "Error al crear carrito" });
  }
});

/* GET */

router.get("/:cid", async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.cid)
      .populate("products.product")
      .lean();

    if (!cart) {
      return res
        .status(404)
        .send({ status: "error", error: "Carrito no encontrado" });
    }

    return res.send({ status: "success", payload: cart });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ status: "error", error: "Error al obtener carrito" });
  }
});

/* POST */

router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await CartModel.findById(cid);
    if (!cart) {
      const err = { status: "error", error: "Carrito no encontrado" };
      return isHtmlRequest(req)
        ? res.status(404).send("Carrito no encontrado")
        : res.status(404).send(err);
    }

    const product = await ProductModel.findById(pid);
    if (!product) {
      const err = { status: "error", error: "Producto no encontrado" };
      return isHtmlRequest(req)
        ? res.status(404).send("Producto no encontrado")
        : res.status(404).send(err);
    }

    const existing = cart.products.find(
      (item) => item.product.toString() === pid
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();

    if (isHtmlRequest(req)) {
      return res.redirect("/products");
    }

    return res.send({ status: "success", payload: cart });
  } catch (error) {
    console.error(error);
    const err = {
      status: "error",
      error: "Error al agregar producto al carrito",
    };
    return isHtmlRequest(req)
      ? res.status(500).send(err.error)
      : res.status(500).send(err);
  }
});

/* DELETE */

router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await CartModel.findById(cid);
    if (!cart)
      return res
        .status(404)
        .send({ status: "error", error: "Carrito no encontrado" });

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== pid
    );
    await cart.save();

    if (isHtmlRequest(req)) {
      return res.redirect(`/carts/${cid}`);
    }

    return res.send({ status: "success", payload: cart });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      status: "error",
      error: "Error al eliminar producto del carrito",
    });
  }
});

/* PUT */

router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).send({
        status: "error",
        error: "Se espera un arreglo de productos en el body",
      });
    }

    const cart = await CartModel.findByIdAndUpdate(
      cid,
      { products },
      { new: true }
    );

    if (!cart)
      return res
        .status(404)
        .send({ status: "error", error: "Carrito no encontrado" });

    return res.send({ status: "success", payload: cart });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ status: "error", error: "Error al actualizar carrito" });
  }
});

/* PUT */

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (quantity == null || quantity < 1) {
      return res.status(400).send({
        status: "error",
        error: "quantity es obligatorio y debe ser mayor a 0",
      });
    }

    const cart = await CartModel.findById(cid);
    if (!cart)
      return res
        .status(404)
        .send({ status: "error", error: "Carrito no encontrado" });

    const item = cart.products.find(
      (p) => p.product.toString() === pid
    );
    if (!item) {
      return res.status(404).send({
        status: "error",
        error: "El producto no está en el carrito",
      });
    }

    item.quantity = quantity;
    await cart.save();

    return res.send({ status: "success", payload: cart });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      status: "error",
      error: "Error al actualizar cantidad del producto",
    });
  }
});

/* DELETE */

router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await CartModel.findById(cid);
    if (!cart)
      return res
        .status(404)
        .send({ status: "error", error: "Carrito no encontrado" });

    cart.products = [];
    await cart.save();

    if (isHtmlRequest(req)) {
      return res.redirect(`/carts/${cid}`);
    }

    return res.send({ status: "success", payload: cart });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ status: "error", error: "Error al vaciar carrito" });
  }
});

export default router;

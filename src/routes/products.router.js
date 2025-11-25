import { Router } from "express";
import { ProductModel } from "../models/products.model.js";

const router = Router();

/* GET */

router.get("/", async (req, res) => {
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

    const baseUrl = req.protocol + "://" + req.get("host") + req.baseUrl;

    res.send({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? `${baseUrl}?page=${result.prevPage}`
        : null,
      nextLink: result.hasNextPage
        ? `${baseUrl}?page=${result.nextPage}`
        : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "error", error: "Error interno" });
  }
});

/* GET */

router.get("/:pid", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.pid).lean();

    if (!product) {
      return res
        .status(404)
        .send({ status: "error", error: "Producto no encontrado" });
    }

    res.send({ status: "success", payload: product });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ status: "error", error: "Error al obtener producto" });
  }
});

/* POST */

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    } = req.body;

    if (!title || !description || !code || price == null || stock == null || !category) {
      return res.status(400).send({
        status: "error",
        error: "title, description, code, price, stock y category son obligatorios",
      });
    }

    const newProduct = await ProductModel.create({
      title,
      description,
      code,
      price,
      status: status ?? true,
      stock,
      category,
      thumbnails: Array.isArray(thumbnails) ? thumbnails : [],
    });

    res.status(201).send({ status: "success", payload: newProduct });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ status: "error", error: "Error al crear producto" });
  }
});

/* PUT */

router.put("/:pid", async (req, res) => {
  try {
    const updated = await ProductModel.findByIdAndUpdate(
      req.params.pid,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .send({ status: "error", error: "Producto no encontrado" });
    }

    res.send({ status: "success", payload: updated });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ status: "error", error: "Error al actualizar producto" });
  }
});

/* DELETE */

router.delete("/:pid", async (req, res) => {
  try {
    const deleted = await ProductModel.findByIdAndDelete(req.params.pid);

    if (!deleted) {
      return res
        .status(404)
        .send({ status: "error", error: "Producto no encontrado" });
    }

    res.send({ status: "success", payload: deleted });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ status: "error", error: "Error al eliminar producto" });
  }
});

export default router;

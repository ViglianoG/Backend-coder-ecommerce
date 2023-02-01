import { Router } from "express";
import productModel from "../dao/models/product.model.js";
import cartModel from "../dao/models/cart.model.js";

const router = Router();

// RUTA BASE
router.get("/", async (req, res) => {
  try {
    const products = await productModel.find().lean().exec();
    res.render("home", { products, style: "index.css" });
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
});

//VER PRODUCTOS AGREGADOS CON QUERY
router.get("/products", async (req, res) => {
  try {
    const category = req.query.category;
    const stock = req.query.stock;

    const query = {
      ...(category ? { categories: category } : null),
      ...(stock ? { stock: { $gt: 0 } } : null),
    };

    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const sort = req.query.sort;

    const products = await productModel.paginate(query, {
      page: page,
      limit: limit,
      sort: { price: sort } || null,
      lean: true,
    });

    products.prevLink = products.hasPrevPage
      ? `/products?page=${products.prevPage}&limit=${limit}${
          category ? `&category=${category}` : ""
        }${stock ? `&stock=${stock}` : ""}`
      : "";
    products.nextLink = products.hasNextPage
      ? `/products?page=${products.nextPage}&limit=${limit}${
          category ? `&category=${category}` : ""
        }${stock ? `&stock=${stock}` : ""}`
      : "";

    res.render("home", { products });
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
});

//VER PROD POR ID
router.get("/products/:pid", async (req, res) => {
  try {
    const pID = req.params.pid;
    const product = await productModel.findOne({ _id: pID }).lean().exec();

    res.render("oneProduct", { product });
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
});

//AGREGAR PROD
router.post("/products", async (req, res) => {
  try {
    const product = req.body;
    const newProduct = new productModel(product);
    await newProduct.save();

    res.redirect("/" + newProduct._id);
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
});

//ELIMINAR PROD
router.get("/products/delete/:pid", async (req, res) => {
  try {
    const pID = req.params.pid;
    await productModel.deleteOne({ _id: pID });

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
});

//FORMULARIO PARA CREAR PRODS
router.get("/products/create", async (req, res) => {
  res.render("create", {});
});

//MUESTRA EL CARRITO
router.get("/carts/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;

    const products = await cartModel
      .findOne({ _id: cid })
      .populate("products.product")
      .lean();

    res.render("cart", products);
  } catch (error) {
    console.log(error);
    res.json({ result: "error", error });
  }
});

//AGREGAR PRODUCTO AL CARRITO
router.post("/carts/:cid/products/:pid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;

    const cart = await cartModel.findOne({ _id: cid });
    if (!cart)
      return res.send({
        status: "ERROR",
        error: "No se ha encontrado el carrito especificado...",
      });

    const product = await productModel.findOne({ _id: pid });
    if (!product)
      return res.send({
        status: "ERROR",
        error: "No se ha encontrado el producto especificado...",
      });

    const productIndex = cart.products.findIndex((p) =>
      p.product.equals(product._id)
    );
    if (productIndex === -1) {
      cart.products.push({ product: product._id, quantity: 1 });
      await cart.save();
    } else {
      cart.products[productIndex].quantity++;
      await cartModel.updateOne({ _id: cid }, cart);
    }

    res.redirect("/carts/" + cid);
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
});

//FILTRO DE CATEGORIAS
router.post("/products/category", async (req, res) => {
  try {
    const category = req.body.category;
    res.redirect(`/products?category=${category}`);
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
});

export default router;

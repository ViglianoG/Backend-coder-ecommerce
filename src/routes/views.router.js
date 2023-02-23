import { Router } from "express";
import productModel from "../dao/models/product.model.js";
import cartModel from "../dao/models/cart.model.js";
import passport from "passport";
import { passportCall, viewsAuthorization } from "../utils.js";
//import userModel from "../dao/models/users.model.js";
//import { createHash, isValidPassword } from "../utils.js";

const router = Router();

//FUNCIONES
// function auth(req, res, next) {
//   if (req.session?.user) {
//     return next();
//   } else {
//     res.status(401).redirect("/sessions/login");
//     return next();
//   }
// }

// function logged(req, res, next) {
//   if (!req.session?.user) {
//     return next();
//   } else {
//     res.status(400).redirect("/products");
//     return next();
//   }
// }

// RUTA BASE ✔
router.get("/", (req, res) => {
  res.redirect("/sessions/login");
});

//VER PRODUCTOS AGREGADOS CON QUERY ✔
router.get(
  "/products",
  passportCall("current"),
  viewsAuthorization("user"),
  async (req, res) => {
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

      const user = req.user;

      res.render("products", { products, user });
    } catch (error) {
      console.log(error);
      res.json({ result: "Error...", error });
    }
  }
);

//FORMULARIO PARA CREAR PRODS ✔
router.get(
  "/products/create",
  passportCall("current"),
  viewsAuthorization("admin"),
  async (req, res) => {
    const user = req.user;
    res.render("create", { user });
  }
);

//AGREGAR PROD ✔
router.post("/products", async (req, res) => {
  try {
    const product = req.body;
    const newProduct = new productModel(product);
    await newProduct.save();

    res.redirect("/products/" + newProduct._id);
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
});

//VER PROD POR ID ✔
router.get(
  "/products/:pid",
  passportCall("current"),
  viewsAuthorization("user"),
  async (req, res) => {
    try {
      const pID = req.params.pid;
      const product = await productModel.findOne({ _id: pID }).lean().exec();
      const user = req.user;

      res.render("oneProduct", { product, user });
    } catch (error) {
      console.log(error);
      res.json({ result: "Error...", error });
    }
  }
);

//ELIMINAR PROD ✔
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

//MUESTRA EL CARRITO ✔
router.get(
  "/carts/:cid",
  passportCall("current"),
  viewsAuthorization("user"),
  async (req, res) => {
    try {
      const cid = req.params.cid;

      const products = await cartModel
        .findOne({ _id: cid })
        .populate("products.product")
        .lean();

      const user = req.user;

      res.render("cart", products, user);
    } catch (error) {
      console.log(error);
      res.json({ result: "error", error });
    }
  }
);

//AGREGAR PRODUCTO AL CARRITO ✔
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

//FILTRO DE CATEGORIAS ✔
router.post("/products/category", async (req, res) => {
  try {
    const category = req.body.category;
    res.redirect(`/products?category=${category}`);
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
});

// SESSIONS

//VISTA REGISTRO USERS ✔
router.get("/sessions/register", (req, res) => {
  res.render("sessions/register");
});

//CREAR USERS EN DB ✔
router.post(
  "/sessions/register",
  passportCall("register"),
  async (req, res) => {
    res.redirect("/sessions/login");
  }
);

//FAIL REGISTER ✔
router.get("/failregister", (req, res) => {
  res.status(400).render("errors/default", { error: "Failed to register" });
});

//VIEW DEL LOGIN ✔
router.get("/sessions/login", (req, res) => {
  res.render("sessions/login");
});

//LOGIN ✔
router.post("/sessions/login", passportCall("login"), async (req, res) => {
  const user = req.user;

  if (!user) {
    return res
      .status(400)
      .json({ status: "error", error: "Invalid credentials" });
  }

  res.cookie("cookieToken", user.token).redirect("/products");
});

//FAIL LOGIN ✔
router.get("/faillogin", (req, res) => {
  res.status(400).render("errors/default", { error: "Failed login" });
});

//LOGOUT ✔
router.get("/sessions/logout", (req, res) => {
  res.clearCookie("cookieToken").redirect("/sessions/login");
});

//PERFIL DEL USER ✔
router.get(
  "/sessions/user",
  passportCall("current"),
  viewsAuthorization("user"),
  (req, res) => {
    const user = req.user;

    if (!user) {
      return res.status(404).render("errors/default", {
        error: "User not found",
      });
    }

    res.render("sessions/user", { user });
  }
);

// GITHUB LOGIN ✔
router.get(
  "/api/sessions/githubcallback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async (req, res) => {
    return res.cookie("cookieToken", req.user.token).redirect("/products");
  }
);
export default router;

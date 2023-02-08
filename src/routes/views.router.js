import { Router } from "express";
import productModel from "../dao/models/product.model.js";
import cartModel from "../dao/models/cart.model.js";
import userModel from "../dao/models/users.model.js";

const router = Router();

//FUNCIONES
function auth(req, res, next) {
  if (req.session?.user) {
    return next();
  } else {
    res.status(401).redirect("/sessions/login");
    return next();
  }
}

function logged(req, res, next) {
  if (!req.session?.user) {
    return next();
  } else {
    res.status(400).redirect("/products");
    return next();
  }
}

// RUTA BASE
router.get("/", auth);

//VER PRODUCTOS AGREGADOS CON QUERY
router.get("/products", auth, async (req, res) => {
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

    const user = req.session.user;

    res.render("products", { products, user });
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
});

//FORMULARIO PARA CREAR PRODS
router.get("/products/create", async (req, res) => {
  const user = req.session.user;
  res.render("create", { user });
});

//AGREGAR PROD
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

//VER PROD POR ID
router.get("/products/:pid", async (req, res) => {
  try {
    const pID = req.params.pid;
    const product = await productModel.findOne({ _id: pID }).lean().exec();
    const user = req.session.user;

    res.render("oneProduct", { product, user });
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

//MUESTRA EL CARRITO
router.get("/carts/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;

    const products = await cartModel
      .findOne({ _id: cid })
      .populate("products.product")
      .lean();

    const user = req.session.user;

    res.render("cart", products, user);
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

// SESSIONS

//VISTA REGISTRO USERS
router.get("/sessions/register", logged, (req, res) => {
  res.render("sessions/register");
});

//CREAR USERS EN DB
router.post("/sessions/register", async (req, res) => {
  const newUser = req.body;

  const user = new userModel(newUser);
  await user.save();

  res.redirect("/sessions/login");
});

//LOGIN
router.post("/sessions/login", async (req, res) => {
  const { email, password } = req.body;

  if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
    const admin = {
      email,
      password,
      first_name: "Admin",
      last_name: "Coder",
      age: 26,
      role: "admin",
    };

    req.session.user = admin;
    res.redirect("/products");
  }

  const user = await userModel.findOne({ email, password }).lean().exec();
  if (!user) {
    return res.status(401).render("errors/default", {
      error: "Error en email y/o password",
    });
  }

  req.session.user = user;
  res.redirect("/products");
});

//VIEW DEL LOGIN
router.get("/sessions/login", logged, (req, res) => {
  res.render("sessions/login");
});

//LOGOUT
router.get("/sessions/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).render("errors/default", { error: err });
    } else res.redirect("/sessions/login");
  });
});

//PERFIL DEL USER
router.get("/sessions/user", auth, (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.status(404).render("errors/default", {
      error: "User not found",
    });
  }

  res.render("sessions/user", { user });
});

export default router;

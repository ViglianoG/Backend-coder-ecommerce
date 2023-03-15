import cartModel from "../dao/models/cart.model.js";
import productModel from "../dao/models/product.model.js";

///////////////////////// REDIRECT PARA LOGIN

export const redirect = (req, res) => {
  res.redirect("/sessions/login");
};

/////////////////////////VER PRODUCTOS AGREGADOS CON QUERY

export const getProducts = async (req, res) => {
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
};

/////////////////////////FORMULARIO PARA CREAR PRODS

export const renderForm = async (req, res) => {
  const user = req.user;
  res.render("create", { user });
};

/////////////////////////AGREGAR PROD

export const addProduct = async (req, res) => {
  try {
    const product = req.body;
    const newProduct = new productModel(product);
    await newProduct.save();

    res.redirect("/products/" + newProduct._id);
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
};

/////////////////////////VER PROD POR ID

export const getProduct = async (req, res) => {
  try {
    const pID = req.params.pid;
    const product = await productModel.findOne({ _id: pID }).lean().exec();
    const user = req.user;

    res.render("oneProduct", { product, user });
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
};

/////////////////////////ELIMINAR PROD

export const deleteProduct = async (req, res) => {
  try {
    const pID = req.params.pid;
    await productModel.deleteOne({ _id: pID });

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
};

/////////////////////////MUESTRA EL CARRITO

export const getCartProducts = async (req, res) => {
  try {
    const cid = req.params.cid;

    const products = await cartModel
      .findOne({ _id: cid })
      .populate("products.product")
      .lean();

    const user = req.user;

    res.render("cart", { products, user });
  } catch (error) {
    console.log(error);
    res.json({ result: "error", error });
  }
};

/////////////////////////AGREGAR PRODUCTO AL CARRITO

export const addToCart = async (req, res) => {
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
};

/////////////////////////FILTRO DE CATEGORIAS

export const filterByCategory = async (req, res) => {
  try {
    const category = req.body.category;
    res.redirect(`/products?category=${category}`);
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
};

// SESSIONS

/////////////////////////VISTA REGISTRO USERS

export const renderRegister = (req, res) => {
  res.render("sessions/register");
};

/////////////////////////REGISTRAR USERS EN DB

export const register = async (req, res) => {
  res.redirect("/sessions/login");
};

/////////////////////////FAIL REGISTER

export const failRegister = (req, res) => {
  res.status(400).render("errors/default", { error: "Failed to register" });
};

/////////////////////////VIEW DEL LOGIN

export const renderLogin = (req, res) => {
  res.render("sessions/login");
};

/////////////////////////LOGIN

export const login = async (req, res) => {
  const user = req.user;

  if (!user) {
    return res
      .status(400)
      .json({ status: "error", error: "Invalid credentials" });
  }

  res.cookie("cookieToken", user.token).redirect("/products");
};

/////////////////////////FAIL LOGIN

export const failLogin = (req, res) => {
  res.status(400).render("errors/default", { error: "Failed login" });
};

/////////////////////////LOGOUT

export const logout = (req, res) => {
  res.clearCookie("cookieToken").redirect("/sessions/login");
};

/////////////////////////PERFIL DEL USER

export const getUser = (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(404).render("errors/default", {
      error: "User not found",
    });
  }

  res.render("sessions/user", { user });
};

///////////////////////// GITHUB LOGIN

export const githubLogin = async (req, res) => {
  return res.cookie("cookieToken", req.user.token).redirect("/products");
};

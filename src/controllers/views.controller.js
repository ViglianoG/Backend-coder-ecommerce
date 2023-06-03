import {
  cartsService,
  productsService,
  usersService,
} from "../repository/index.js";
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";

///////////////////////// REDIRECT PARA LOGIN

export const redirect = (req, res) => {
  res.redirect("/sessions/login");
};

/////////////////////////VER PRODUCTOS AGREGADOS CON QUERY

export const getProducts = async (req, res) => {
  try {
    const {
      products,
      options: { limit, category, stock },
    } = await productsService.getPaginate(req);

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

    res.render("products", {
      products,
      user,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.render("errors/default", { error });
  }
};

/////////////////////////FORMULARIO PARA CREAR PRODS

export const renderForm = async (req, res) => {
  const user = req.user;
  res.render("create", {
    user,
  });
};

/////////////////////////AGREGAR PROD

export const addProduct = async (req, res) => {
  try {
    const { role, email } = req.user;
    const data = req.body;

    const documents = await usersService.saveDocuments(req.user, req.files);
    data.thumbnails = documents.map((file) => file.reference);
    const category = data.category.split(",").map((c) => c.trim());
    data.category = Array.isArray(category) ? category : [category];
    if (role === "premium") data.owner = email;

    const product = await productsService.createProduct(data);

    res.redirect("/products/" + product._id);
  } catch (error) {
    req.logger.error(error.toString());
    res.render("errors/default", { error });
  }
};

/////////////////////////VER PROD POR ID

export const getProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productsService.getProduct(pid);
    const user = req.user;

    res.render("oneProduct", {
      product,
      user,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.render("errors/default", { error });
  }
};

/////////////////////////ELIMINAR PROD

export const deleteProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const user = req.user;
    const product = await productsService.getProduct(pid);

    if (user.role === "premium" && user.email !== product.owner) {
      const error = "You can't modify a product owned by another user";
      req.logger.error(error);
      return res.status(403).json({ status: "error", error });
    }

    await productsService.deleteProduct(pid);
    res.redirect("/products");
  } catch (error) {
    req.logger.error(error.toString());
    res.render("errors/default", { error });
  }
};

/////////////////////////MUESTRA EL CARRITO

export const getCartProducts = async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartsService.getCart(cid);
    const products = cart.toObject();

    const user = req.user;

    res.render("cart", {
      cid,
      products,
      user,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.render("errors/default", { error });
  }
};

/////////////////////////AGREGAR PRODUCTO AL CARRITO

export const addToCart = async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const user = req.user;

    const cart = await cartsService.getCart(cid);
    if (!cart)
      CustomError.createError({
        name: "Cart error",
        cause: generateNullError("Cart"),
        message: "Error trying to find cart",
        code: EErrors.NULL_ERROR,
      });

    const product = await productsService.getProduct(pid);
    if (!product)
      CustomError.createError({
        name: "Product error",
        cause: generateNullError("Product"),
        message: "Error trying to find product",
        code: EErrors.NULL_ERROR,
      });

    if (user.role === "premium" && cart.owner === user.id) {
      const error = "You can't add your own product to your cart.";
      req.logger.error(error);
      return res.status(403).json({ status: "error", error });
    }

    cartsService.addProductToCart(user, cart, product);

    res.redirect("/carts/" + cid);
  } catch (error) {
    req.logger.error(error.toString());
    res.render("errors/default", { error });
  }
};

/////////////////////////DELETE PRODUCT DEL CART

export const deleteCartProducts = async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartsService.updateCart(cid, {
      products: [],
    });
    const user = req.user;
    res.render("cart", {
      cid,
      products: cart,
      user,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.render("errors/default", { error });
  }
};

/////////////////////////COMPRA

export const purchase = async (req, res) => {
  try {
    const cid = req.params.cid;
    const purchaser = req.user.email;
    const { outOfStock, ticket } = await cartsService.purchase(cid, purchaser);

    if (outOfStock.length > 0) {
      const ids = outOfStock.map((p) => p.product);
      return res.render("purchase", {
        ids,
        ticket,
        cid,
      });
    }

    res.render("purchase", {
      ticket,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.render("errors/default", { error });
  }
};

/////////////////////////FILTRO DE CATEGORIAS

export const filterByCategory = async (req, res) => {
  try {
    const category = req.body.category;
    res.redirect(`/products?category=${category}`);
  } catch (error) {
    req.logger.error(error.toString());
    res.render("errors/default", { error });
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
  res.status(400).render("errors/default", {
    error: "Failed to register",
  });
};

/////////////////////////VIEW DEL LOGIN

export const renderLogin = (req, res) => {
  res.render("sessions/login");
};

/////////////////////////LOGIN

export const login = async (req, res) => {
  const user = req.user;

  if (!user)
    return res
      .status(400)
      .render("errors/default", { error: "Invalid credentials", user });

  res.cookie("cookieToken", user.token).redirect("/products");
};

/////////////////////////FAIL LOGIN

export const failLogin = (req, res) => {
  res.status(400).render("errors/default", {
    error: "Failed login",
  });
};

/////////////////////////LOGOUT

export const logout = async (req, res) => {
  const user = req.user;
  user.last_connection = new Date().toLocaleString();
  await usersService.updateUser(user.id, user);
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

  res.render("sessions/user", {
    user,
  });
};

///////////////////////// GITHUB LOGIN

export const githubLogin = async (req, res) => {
  return res.cookie("cookieToken", req.user.token).redirect("/products");
};

/////////////////////////RENDER ENVIAR EMAIL

export const renderForgotPassword = async (req, res) => {
  res.render("sessions/forgotPassword");
};

export const sendRecoveryMail = async (req, res) => {
  try {
    const { email } = req.body;
    await usersService.sendMail(email);
    res.render("sessions/message", {
      message: `Enviamos un email al correo ${email}. Ingresá al link para restablecer la contraseña.`,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.render("errors/default", { error });
  }
};

export const renderChangePassword = async (req, res) => {
  const { uid, token } = req.params;
  res.render("sessions/changePassword", { uid, token });
};

// import cartModel from "../dao/models/cart.model.js";
// import productModel from "../dao/models/product.model.js";

import {
  cartsService,
  productsService
} from "../repository/index.js";

///////////////////////// REDIRECT PARA LOGIN

export const redirect = (req, res) => {
  res.redirect("/sessions/login");
};

/////////////////////////VER PRODUCTOS AGREGADOS CON QUERY

export const getProducts = async (req, res) => {
  try {
    const {
      products,
      options: {
        limit,
        category,
        stock
      }
    } = await productsService.getPaginate(req)

    products.prevLink = products.hasPrevPage ?
      `/products?page=${products.prevPage}&limit=${limit}${
          category ? `&category=${category}` : ""
        }${stock ? `&stock=${stock}` : ""}` :
      "";
    products.nextLink = products.hasNextPage ?
      `/products?page=${products.nextPage}&limit=${limit}${
          category ? `&category=${category}` : ""
        }${stock ? `&stock=${stock}` : ""}` :
      "";

    const user = req.user;

    res.render("products", {
      products,
      user
    });
  } catch (error) {
    console.log(error);
    res.json({
      result: "Error...",
      error
    });
  }
};

/////////////////////////FORMULARIO PARA CREAR PRODS

export const renderForm = async (req, res) => {
  const user = req.user;
  res.render("create", {
    user
  });
};

/////////////////////////AGREGAR PROD

export const addProduct = async (req, res) => {
  try {
    const product = req.body;
    const newProduct = await productsService.createProduct(product);

    res.redirect("/products/" + newProduct._id);
  } catch (error) {
    console.log(error);
    res.json({
      result: "Error...",
      error
    });
  }
};

/////////////////////////VER PROD POR ID

export const getProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productsService.getProduct(pid)
    const user = req.user;

    res.render("oneProduct", {
      product,
      user
    });
  } catch (error) {
    console.log(error);
    res.json({
      result: "Error...",
      error
    });
  }
};

/////////////////////////ELIMINAR PROD

export const deleteProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    await productsService.deleteProduct({
      id
    });

    res.redirect("/products");
  } catch (error) {
    console.log(error);
    res.json({
      result: "Error...",
      error
    });
  }
};

/////////////////////////MUESTRA EL CARRITO

export const getCartProducts = async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = cartsService.getCart(cid)
    const products = cart.toObject()

    const user = req.user;

    res.render("cart", {
      cid,
      products,
      user
    });
  } catch (error) {
    console.log(error);
    res.json({
      result: "error",
      error
    });
  }
};

/////////////////////////AGREGAR PRODUCTO AL CARRITO

export const addToCart = async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;

    const cart = await cartsService.getCart(cid);
    if (!cart)
      return res.send({
        status: "ERROR",
        error: "No se ha encontrado el carrito especificado...",
      });

    const product = await productsService.getProduct(pid);
    if (!product)
      return res.send({
        status: "ERROR",
        error: "No se ha encontrado el producto especificado...",
      });

    cartsService.addProductToCart(cart, product)

    res.redirect("/carts/" + cid);
  } catch (error) {
    console.log(error);
    res.json({
      result: "Error...",
      error
    });
  }
};

/////////////////////////DELETE PRODUCT DEL CART

export const deleteCartProducts = async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartsService.updateCart(cid, {
      products: []
    })
    const user = req.user;
    res.render("cart", {
      cid,
      products: cart,
      user
    })
  } catch (error) {
    console.log(error);
    res.json({
      result: "Error...",
      error
    });
  }
}

/////////////////////////COMPRA

export const purchase = async (req, res) => {
  try {
    const cid = req.params.cid
    const purchaser = req.user.email
    const {
      outOfStock,
      ticket
    } = await cartsService.purchase(cid, purchaser)

    if (outOfStock.length > 0) {
      const ids = outOfStock.map(p => p.product)
      return res.render("purchase", {
        ids,
        ticket,
        cid
      })
    }

    res.render("purchase", {
      ticket
    })
  } catch (error) {
    console.log(error);
    res.json({
      result: "Error...",
      error
    });
  }
}

/////////////////////////FILTRO DE CATEGORIAS

export const filterByCategory = async (req, res) => {
  try {
    const category = req.body.category;
    res.redirect(`/products?category=${category}`);
  } catch (error) {
    console.log(error);
    res.json({
      result: "Error...",
      error
    });
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
    error: "Failed to register"
  });
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
      .json({
        status: "error",
        error: "Invalid credentials"
      });
  }

  res.cookie("cookieToken", user.token).redirect("/products");
};

/////////////////////////FAIL LOGIN

export const failLogin = (req, res) => {
  res.status(400).render("errors/default", {
    error: "Failed login"
  });
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

  res.render("sessions/user", {
    user
  });
};

///////////////////////// GITHUB LOGIN

export const githubLogin = async (req, res) => {
  return res.cookie("cookieToken", req.user.token).redirect("/products");
};
import { Router } from "express";
import passport from "passport";
import { passportCall, viewsAuthorization } from "../utils.js";
import {
  redirect,
  getProducts,
  renderForm,
  deleteProduct,
  getProduct,
  addProduct,
  filterByCategory,
  getCartProducts,
  addToCart,
  renderRegister,
  register,
  failRegister,
  renderLogin,
  login,
  failLogin,
  logout,
  getUser,
  githubLogin,
} from "../controllers/views.controller.js";

const router = Router();

// REDIRECT PARA LOGIN
router.get("/", redirect);

//VER PRODUCTOS AGREGADOS CON QUERY
router.get(
  "/products",
  passportCall("current"),
  viewsAuthorization("user"),
  getProducts
);

//FORMULARIO PARA CREAR PRODS
router.get(
  "/products/create",
  passportCall("current"),
  viewsAuthorization("admin"),
  renderForm
);

//AGREGAR PROD
router.post("/products", addProduct);

//VER PROD POR ID
router.get(
  "/products/:pid",
  passportCall("current"),
  viewsAuthorization("user"),
  getProduct
);

//ELIMINAR PROD
router.get("/products/delete/:pid", deleteProduct);

//MUESTRA EL CARRITO
router.get(
  "/carts/:cid",
  passportCall("current"),
  viewsAuthorization("user"),
  getCartProducts
);

//AGREGAR PRODUCTO AL CARRITO
router.post("/carts/:cid/products/:pid", addToCart);

//FILTRO DE CATEGORIAS
router.post("/products/category", filterByCategory);

// SESSIONS

//VISTA REGISTRO USERS
router.get("/sessions/register", renderRegister);

//REGISTRAR USERS EN DB
router.post("/sessions/register", passportCall("register"), register);

//FAIL REGISTER
router.get("/failregister", failRegister);

//VIEW DEL LOGIN
router.get("/sessions/login", renderLogin);

//LOGIN
router.post("/sessions/login", passportCall("login"), login);

//FAIL LOGIN
router.get("/faillogin", failLogin);

//LOGOUT
router.get("/sessions/logout", logout);

//PERFIL DEL USER
router.get(
  "/sessions/user",
  passportCall("current"),
  viewsAuthorization("user"),
  getUser
);

// GITHUB LOGIN
router.get(
  "/api/sessions/githubcallback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  githubLogin
);
export default router;

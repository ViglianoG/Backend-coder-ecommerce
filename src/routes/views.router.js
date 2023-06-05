import { Router } from "express";
import passport from "passport";
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
  deleteCartProducts,
  purchase,
  renderForgotPassword,
  sendRecoveryMail,
  renderChangePassword,
} from "../controllers/views.controller.js";
import { changePassword } from "../controllers/sessions.controller.js";
import { viewsAuthorization, viewsPassportCall } from "../middleware/auth.js";
import { uploader } from "../services/multer.js";

const router = Router();

// REDIRECT PARA LOGIN
router.get("/", redirect);

//VER PRODUCTOS AGREGADOS CON QUERY
router.get("/products", viewsPassportCall("current"), getProducts);

//FORMULARIO PARA CREAR PRODS
router.get(
  "/products/create",
  viewsPassportCall("current"),
  viewsAuthorization(["premium", "admin"]),
  renderForm
);

//AGREGAR PROD
router.post(
  "/products",
  viewsPassportCall("current"),
  viewsAuthorization(["premium", "admin"]),
  uploader.array("file", 1),
  addProduct
);

//VER PROD POR ID
router.get("/products/:pid", viewsPassportCall("current"), getProduct);

//ELIMINAR PROD
router.get(
  "/products/delete/:pid",
  viewsPassportCall("current"),
  viewsAuthorization(["premium", "admin"]),
  deleteProduct
);

//MUESTRA EL CARRITO
router.get(
  "/carts/:cid",
  viewsPassportCall("current"),
  viewsAuthorization(["user", "premium"]),
  getCartProducts
);

//AGREGAR PRODUCTO AL CARRITO
router.post(
  "/carts/:cid/products/:pid",
  viewsPassportCall("current"),
  viewsAuthorization(["user", "premium"]),
  addToCart
);

//VACIAR CARRITO
router.post(
  "/carts/:cid",
  viewsPassportCall("current"),
  viewsAuthorization(["user", "premium"]),
  deleteCartProducts
);

//FILTRO DE CATEGORIAS
router.post(
  "/products/category",
  viewsPassportCall("current"),
  filterByCategory
);

//COMPRA
router.post(
  "/carts/:cid/purchase",
  viewsPassportCall("current"),
  viewsAuthorization(["user", "premium"]),
  purchase
);

// SESSIONS

//VISTA REGISTRO USERS
router.get("/sessions/register", renderRegister);

//REGISTRAR USERS EN DB
router.post("/sessions/register", viewsPassportCall("register"), register);

//FAIL REGISTER
router.get("/failregister", failRegister);

//VIEW DEL LOGIN
router.get("/sessions/login", renderLogin);

//LOGIN
router.post("/sessions/login", viewsPassportCall("login"), login);

//FAIL LOGIN
router.get("/faillogin", failLogin);

//LOGOUT
router.get("/sessions/logout", viewsPassportCall("current"), logout);

//PERFIL DEL USER
router.get("/sessions/user", viewsPassportCall("current"), getUser);

// GITHUB LOGIN
router.get(
  "/api/sessions/githubcallback",
  passport.authenticate("github", {
    failureRedirect: "/login",
  }),
  githubLogin
);

//RENDER FORGOT PASS
router.get("/sessions/password_reset", renderForgotPassword);

//RECOVERY EMAIL
router.post("/sessions/password_reset", sendRecoveryMail);

//RENDER CHANGE PASS
router.get("/sessions/password_reset/:uid/:token", renderChangePassword);

//CAMBIAR PASS
router.post("/sessions/password_reset/:uid/:token", changePassword);

export default router;

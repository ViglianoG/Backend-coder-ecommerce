import {
  Router
} from "express";
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
  purchase
} from "../controllers/views.controller.js";
import {
  viewsPassportCall,
  viewsAuthorization
} from "../middleware/auth.js";

const router = Router();

// REDIRECT PARA LOGIN
router.get("/", redirect);

//VER PRODUCTOS AGREGADOS CON QUERY
router.get(
  "/products",
  viewsPassportCall("current"),
  getProducts
);

//FORMULARIO PARA CREAR PRODS
router.get(
  "/products/create",
  viewsPassportCall("current"),
  viewsAuthorization("admin"),
  renderForm
);

//AGREGAR PROD
router.post("/products", viewsPassportCall("current"), viewsAuthorization("admin"), addProduct);

//VER PROD POR ID
router.get(
  "/products/:pid",
  viewsPassportCall("current"),
  getProduct
);

//ELIMINAR PROD
router.get("/products/delete/:pid", viewsPassportCall("current"), viewsAuthorization("admin"), deleteProduct);

//MUESTRA EL CARRITO
router.get(
  "/carts/:cid",
  viewsPassportCall("current"),
  viewsAuthorization("user"),
  getCartProducts
);

//AGREGAR PRODUCTO AL CARRITO
router.post("/carts/:cid/products/:pid", viewsPassportCall("current"), viewsAuthorization("user"), addToCart);

//ELIMINAR PRODUCTO DEL CARRITO
router.post("/carts/:cid", viewsPassportCall("current"), viewsAuthorization("user"), deleteCartProducts);

//FILTRO DE CATEGORIAS
router.post("/products/category", viewsPassportCall("current"), filterByCategory);

//COMPRA
router.post("/carts/:cid/purchase", viewsPassportCall("current"), viewsAuthorization("user"), purchase);

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
router.get(
  "/sessions/user",
  viewsPassportCall("current"),
  getUser
);

// GITHUB LOGIN
router.get(
  "/api/sessions/githubcallback",
  passport.authenticate("github", {
    failureRedirect: "/login"
  }),
  githubLogin
);
export default router;
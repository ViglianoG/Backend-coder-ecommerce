import { Router } from "express";
import { passportCall } from "../utils.js";
import passport from "passport";
import {
  register,
  failRegister,
  login,
  failLogin,
  logout,
  getUser,
} from "../controllers/sessions.controller.js";

const router = Router();
//CREAR USERS EN DB ✔
router.post("/register", passportCall("register"), register);

//FAIL REGISTER ✔
router.get("/failregister", failRegister);

//LOGIN ✔
router.post("/login", passportCall("login"), login);

//FAIL LOGIN ✔
router.get("/faillogin", failLogin);

//CERRAR SESSION ✔
router.get("/logout", logout);

//PERFIL DEL USER ✔
router.get("/current", passportCall("current"), getUser);

//GITHUB LOGIN ✔
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

export default router;

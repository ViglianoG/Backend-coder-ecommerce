import { Router } from "express";
import passport from "passport";
import {
  register,
  failRegister,
  login,
  failLogin,
  logout,
  getUser,
  sendRecoveryMail,
  changePassword,
} from "../controllers/sessions.controller.js";
import { passportCall } from "../middleware/auth.js";

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
router.get("/logout", passportCall("current"), logout);

//PERFIL DEL USER ✔
router.get("/current", passportCall("current"), getUser);

//GITHUB LOGIN ✔
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
  }),
  async (req, res) => {}
);
//PASSWORD RESET ✔
router.post("/password_reset", sendRecoveryMail);
router.put("/password_reset/:uid/:token", changePassword);

export default router;

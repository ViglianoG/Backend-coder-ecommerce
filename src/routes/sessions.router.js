import { Router } from "express";
import { passportCall } from "../utils.js";
import passport from "passport";
//import userModel from "../dao/models/users.model.js";

const router = Router();

//FUNCIONES MIDDLEWARE
// function logged(req, res, next) {
//   if (!req.session?.user) {
//     return next();
//   } else {
//     return res
//       .status(400)
//       .json({ status: "ERROR", payload: "Already logged in!" });
//   }
// }
// function auth(req, res, next) {
//   if (req.session?.user) {
//     return next();
//   } else {
//     return res
//       .status(401)
//       .json({ status: "ERROR", payload: "Not authenticated!" });
//   }
// }

//CREAR USERS EN DB ✔
router.post("/register", passportCall("register"), async (req, res) => {
  res.json({ status: "success", payload: req.user });
});

//FAIL REGISTER ✔
router.get("/failregister", async (req, res) => {
  res.json({ status: "error", error: "Failed to register" });
});

//LOGIN ✔
router.post("/login", passportCall("login"), async (req, res) => {
  const user = req.user;

  if (!user)
    return res
      .status(400)
      .json({ status: "error", error: "Invalid credentials" });

  res
    .cookie("cookieToken", req.user.token)
    .json({ status: "success", payload: user });
});

//FAIL LOGIN ✔
router.get("/faillogin", (req, res) => {
  res.json({ status: "error", error: "Failed login" });
});

//CERRAR SESSION ✔
router.get("/logout", (req, res) => {
  res
    .clearCookie("cookieToken")
    .send({ status: "success", payload: "Logged out..." });
});

//PERFIL DEL USER ✔
router.get("/current", passportCall("current"), (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.status(404).render("errors/default", {
      error: "User not found",
    });
  }

  res.json({ status: "success", payload: user });
});

//GITHUB LOGIN ✔
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

export default router;

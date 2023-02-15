import { Router } from "express";
import userModel from "../dao/models/users.model.js";
import { createHash, isValidPassword } from "../utils.js";
import passport from "passport";

const router = Router();

//FUNCIONES MIDDLEWARE
function logged(req, res, next) {
  if (!req.session?.user) {
    return next();
  } else {
    return res
      .status(400)
      .json({ status: "ERROR", payload: "Already logged in!" });
  }
}
function auth(req, res, next) {
  if (req.session?.user) {
    return next();
  } else {
    return res
      .status(401)
      .json({ status: "ERROR", payload: "Not authenticated!" });
  }
}

//CREAR USERS EN DB
router.post(
  "/register",
  logged,
  passport.authenticate("register", {
    failureRedirect: "/failregister",
  }),
  async (req, res) => {
    res.json({ status: "success", payload: req.user });
  }
);

//FAIL REGISTER
router.get("/failregister", async (req, res) => {
  res.json({ status: "error", error: "Failed to register" });
});

//LOGIN
router.post(
  "/login",
  logged,
  passport.authenticate("login", {
    failureRedirect: "/faillogin",
  }),
  async (req, res) => {
    const user = req.user;

    if (!user)
      return res
        .status(400)
        .json({ status: "error", error: "Invalid credentials" });

    req.session.user = {
      first_name: user.first_name,
      last_name: user.last_name,
      age: user.age,
      email: user.email,
      role: user.role,
    };

    res.json({ status: "success", payload: user });
  }
);

//FAIL LOGIN
router.get("/faillogin", (req, res) => {
  res.json({ status: "error", error: "Failed login" });
});

//CERRAR SESSION
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ status: "error", payload: err });
    } else res.json({ status: "success", payload: "Logged out..." });
  });
});

//PERFIL DEL USER
router.get("/user", auth, (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.status(404).render("errors/default", {
      error: "User not found",
    });
  }

  res.json({ status: "success", payload: user });
});

//GITHUB LOGIN
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

export default router;

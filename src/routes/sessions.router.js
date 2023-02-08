import { Router } from "express";
import userModel from "../dao/models/users.model.js";

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

//REGISTAR USERS EN LA DB
router.post("/register", logged, async (req, res) => {
  const newUser = req.body;

  const user = new userModel(newUser);
  await user.save();

  res.json({ status: "Success...", payload: "Register successful..." });
});

//LOGIN
router.post("/login", logged, async (req, res) => {
  const { email, password } = req.body;

  if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
    const admin = {
      email,
      password,
      first_name: "Admin",
      last_name: "Coder",
      age: 26,
      role: "admin",
    };
    req.session.user = admin;
    res.json({ status: "success", payload: admin });
  } else {
    const user = await userModel.findOne({ email, password }).lean().exec();
    if (!user) {
      return res
        .status(401)
        .json({ status: "error", payload: "Error en usuario o contraseña" });
    }

    req.session.user = user;
    res.json({ status: "success", payload: "Login successful!" });
  }
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

export default router;

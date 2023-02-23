import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcrypt";
import passport from "passport";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default __dirname;

//GEN/AUTH TOKEN
const PRIVATE_KEY = "secret321secret321";
export const generateToken = (user) => {
  const token = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: "24h" });
  return token;
};

// export const authToken = (req, res, next) => {
//   const token = req.headers.auth;
//   if (!token) return res.status(401).send({ error: "Not Auth" });
//   jwt.verify(token, PRIVATE_KEY, (error, credentials) => {
//     if (error) return res.status(403).send({ error: "Not Authorized" });
//     req.user = credentials.user;
//     next();
//   });
// };

export const passportCall = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (error, user, info) {
      if (error) return next(error);
      if (!user) {
        return res
          .status(401)
          .json({ error: info?.messages ? info.messages : info?.toString() });
      }

      req.user = user;
      next();
    })(req, res, next);
  };
};

export const authorization = (role) => {
  return async (req, res, next) => {
    const user = req.user || null;

    if (!user)
      return res.status(401).json({ status: "error", error: "Not Auth" });
    if (user.role !== role)
      return res.status(403).json({ status: "error", error: "Not Authorized" });
    next();
  };
};

export const viewsAuthorization = (role) => {
  return async (req, res, next) => {
    const user = req.user || null;

    if (!user) return res.status(401).redirect("/login");
    if (user.role !== role)
      return res
        .status(403)
        .render("errors/default", { error: "Not Authorized" });
    next();
  };
};

//HASH
export const createHash = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};
export const isValidPassword = (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

//solo funciona con el "type": "module" en el package.json

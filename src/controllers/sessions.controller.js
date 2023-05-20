import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import { generateAuthenticationError } from "../services/errors/info.js";
import {
  validateToken,
  isValidPassword as comparePasswords,
  createHash,
} from "../utils.js";
import { usersService } from "../repository/index.js";
import config from "../config/config.js";

const { COOKIE_NAME } = config;

/////////////////////////CREAR USERS EN DB

export const register = async (req, res) => {
  res.json({ status: "success", payload: req.user });
};

/////////////////////////FAIL REGISTER

export const failRegister = async (req, res) => {
  res.json({ status: "error", error: "Failed to register" });
};

/////////////////////////LOGIN

export const login = async (req, res) => {
  const user = req.user;

  if (!user)
    return res
      .status(400)
      .json({ status: "error", error: "Invalid credentials" });

  res
    .cookie(COOKIE_NAME, req.user.token)
    .json({ status: "success", payload: user });
};

/////////////////////////FAIL LOGIN

export const failLogin = (req, res) => {
  res.json({ status: "error", error: "Failed login" });
};

/////////////////////////CERRAR SESSION

export const logout = async (req, res) => {
  const user = req.user;
  user.last_connection = new Date();
  await usersService.updateUser(user.id, user);
  res
    .clearCookie(COOKIE_NAME)
    .send({ status: "success", payload: "Logged out..." });
};

/////////////////////////PERFIL DEL USER

export const getUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user)
      CustomError.createError({
        name: "Authentication error",
        cause: generateAuthenticationError(),
        message: "Error trying to find user.",
        code: EErrors.AUTHENTICATION_ERROR,
      });

    res.json({ status: "success", payload: user });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ status: "Error...", error });
  }
};

/////////////////////////ENVIAR CORREO DE RECU

export const sendRecoveryMail = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await usersService.sendMail(email);

    res.json({ status: "success", payload: result });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ status: error, error });
  }
};

/////////////////////////CAMBIAR PASS

export const changePassword = async (req, res) => {
  try {
    const { uid, token } = req.params;
    const { newPassword, confirmation } = req.body;
    const { err } = validateToken(token);
    const user = await usersService.getUserByID(uid);

    if (err?.name === "TokenExpiredError")
      return res
        .status(403)
        .json({ status: "error", error: "El token expiró.." });
    else if (err) return res.json({ status: "error", error: err });

    if (!newPassword || !confirmation)
      return res.status(400).json({
        status: "error",
        error: "Escriba y confirme la nueva contraseña",
      });

    if (comparePasswords(user, newPassword))
      return res.json({
        status: "error",
        error: "La contraseña no puede ser igual a la anterior.",
      });
    if (newPassword != confirmation)
      return res.json({
        status: "error",
        error: "Las contraseñas no coinciden.",
      });

    const userData = {
      ...user,
      password: createHash(newPassword),
    };

    const newUser = await usersService.updateUser(uid, userData);
    res.json({ status: "success", payload: newUser });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ status: "error", error });
  }
};

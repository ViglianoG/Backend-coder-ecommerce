import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import { generateAuthenticationError } from "../services/errors/info.js";

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
    .cookie("cookieToken", req.user.token)
    .json({ status: "success", payload: user });
};

/////////////////////////FAIL LOGIN

export const failLogin = (req, res) => {
  res.json({ status: "error", error: "Failed login" });
};

/////////////////////////CERRAR SESSION

export const logout = (req, res) => {
  res
    .clearCookie("cookieToken")
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
    req.logger.error(error);
    res.json({ status: "Error...", error });
  }
};

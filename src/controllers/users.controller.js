import { usersService } from "../repository/index.js";
import config from "../config/config.js";
import CustomError from "../services/errors/CustomError.js";
import { generateAuthenticationError } from "../services/errors/info.js";
import EErrors from "../services/errors/enums.js";

const { COOKIE_NAME } = config;

/////////////////////////CAMBIR ROL
export const updateRole = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await usersService.getUserByID(uid);
    const { documents } = user;

    const cb = (str) => (document) => document.name === str;

    if (
      user.role === "user" &&
      (!documents.find(cb("identification")) ||
        !documents.find(cb("address")) ||
        !documents.find(cb("account_status")))
    ) {
      const error = `Debes subir los siguientes documentos para poder pasarte a Premium:
      - Identificación
      - Comprobante de domicilio
      - Comprobante de estado de cuenta`;
      req.logger.error(error);
      return res.status(403).json({ status: "error", error });
    }

    const newRole = user.role === "user" ? "premium" : "user";
    await usersService.updateUser(uid, { ...user, role: newRole });

    res.clearCookie(COOKIE_NAME).json({
      status: "success",
      message: `Role updated to ${newRole}. Log in again.`,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ status: "error", error });
  }
};

/////////////////////////DELETE USER ID
export const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const result = await usersService.deleteUser(uid);
    res.json({ status: "success", result });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ status: "error", error });
  }
};

/////////////////////////DELETE USER BY EMAIL
export const deleteUserByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await usersService.getUserByEmail(email);
    if (!user)
      CustomError.createError({
        name: "Authentication error",
        cause: generateAuthenticationError(),
        message: "Error trying to find user.",
        code: EErrors.AUTHENTICATION_ERROR,
      });
    const result = await usersService.deleteUser(user._id || user.id);
    res.json({ status: "success", result });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ status: "error", error });
  }
};

/////////////////////////UPLOAD DOCUMENTS
export const uploadDocuments = async (req, res) => {
  try {
    const user = await usersService.getUserDataByID(req.user.id);
    const documents = await usersService.saveDocuments(user, req.files);
    res.json({ status: "success", payload: documents });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ status: "error", error });
  }
};
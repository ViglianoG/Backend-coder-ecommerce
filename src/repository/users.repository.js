import UserDTO from "../dao/DTO/user.dto.js";
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import { generateAuthenticationError } from "../services/errors/info.js";
import Mail from "../services/mail.js";
import config from "../config/config.js";
import { generateToken } from "../utils.js";
import __dirname from "../utils.js";

export default class UsersRepository {
  constructor(dao) {
    this.dao = dao;
    this.mail = new Mail();
  }

  getUsers = async () => {
    return await this.dao.get();
  };

  getUserByID = async (id) => {
    return await this.dao.getById(id);
  };

  getUserDataByID = async (id) => {
    const user = await this.dao.getById(id);
    return new UserDTO(user);
  };

  getUserByEmail = async (email) => {
    return await this.dao.getByEmail(email);
  };

  createUser = async (data) => {
    return await this.dao.create(data);
  };

  updateUser = async (id, data) => {
    const user = await this.dao.update(id, data);
    return new UserDTO(user);
  };

  deleteUser = async (id) => {
    return await this.dao.delete(id);
  };

  deleteManyUsers = async (ids) => {
    return await this.dao.deleteMany(ids);
  };

  sendMail = async (email) => {
    const user = await this.getUserByEmail(email);
    if (!user)
      CustomError.createError({
        name: "Authentication error",
        cause: generateAuthenticationError(),
        message: "Invalid Credentials.",
        code: EErrors.AUTHENTICATION_ERROR,
      });

    const token = generateToken({ valid: true }, 1);

    const html = `
      <h1>Restauración de contraseña</h1>
      <br>
      <p>Hola 👋</p>
      <p>Recibiste este mensaje porque se solicitó un restablecimiento de contraseña para la cuenta relacionada a este correo electrónico.</p>
      <br>
      <p>Podés hacerlo haciendo click en el siguiente link:</p>
      <a href=${config.FRONTEND_BASE_URL}sessions/password_reset/${
      user._id || user.id
    }/${token}>Restablecer contraseña</a>
      <br>
      <p>¡Saludos!</p>`;

    return await this.mail.send(email, "Restauración de contraseña.", html);
  };

  sendRegistrationMail = async (email) => {
    const html = `
    <h1>¡Tu registro en "Coder-eCommerce" ha sido exitoso!</h1>
    <br>
    <p>Gracias por registrarte..</p>
    <br>
    <p>¡Saludos!👋</p>`;

    return await this.mail.send(email, "Registro exitoso", html);
  };

  saveDocuments = async (user, files) => {
    const newDocuments = files.map((file) => ({
      name: file.document_type,
      reference: `${file.destination.replace(`${__dirname}/public`, "")}/${
        file.filename
      }`,
    }));

    const updatedUser = {
      ...user,
      documents: user.documents.concat(newDocuments),
    };

    await this.updateUser(user.id, updatedUser);
    return newDocuments;
  };

  sendDeletedAccountMail = async (email) => {
    const html = `<h1>Cuenta eliminada</h1>
    <p>Su cuenta ha sido eliminada por inactividad</p>
    <p>Muchas gracias por utilizar Backend coder ecommerce</p>`;

    return await this.mail.send(email, "Registro exitoso", html);
  };
}

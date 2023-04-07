import ProductsRepository from "./products.repository.js";
import CartsRepository from "./carts.repository.js";
import MessagesRepository from "./messages.repository.js";
import UsersRepository from "./users.repository.js";
import TicketsRepository from "./tickets.repository.js";

import Products from "../dao/mongo/products.mongo.js";
import Carts from "../dao/mongo/carts.mongo.js";
import Messages from "../dao/mongo/messages.mongo.js";
import Users from "../dao/mongo/users.mongo.js";
import Tickets from "../dao/mongo/tickets.mongo.js";

export const productsService = new ProductsRepository(new Products());
export const cartsService = new CartsRepository(new Carts());
export const messagesService = new MessagesRepository(new Messages());
export const usersService = new UsersRepository(new Users());
export const ticketsService = new TicketsRepository(new Tickets());

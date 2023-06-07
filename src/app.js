import express from "express";
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import initPassport from "./config/passport.config.js";
import cookieParser from "cookie-parser";
import config from "./config/config.js";
import { passportCall, authorization } from "./middleware/auth.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import chatRouter from "./routes/chat.router.js";
import viewsRouter from "./routes/views.router.js";
import sessionRouter from "./routes/sessions.router.js";
import { createMessage } from "./controllers/chat.controller.js";
import http from "http";
import mockingProducts from "./routes/testing/mocking/products.mocking.js";
import errorHandler from "./middleware/errors/index.js";
import { logger, addLogger } from "./middleware/logger.js";
import loggerRouter from "./routes/logger.router.js";
import { serve, setup } from "swagger-ui-express";
import specs from "./config/swagger.config.js";
import cors from "cors";
import usersRouter from "./routes/users.router.js";
import createMemoryStore from "memorystore";
import ticketsRouter from "./routes/tickets.router.js";

const MemoryStore = createMemoryStore(session);

const { SESSION_SECRET, COOKIE_SECRET, MONGO_URI, DB_NAME, PORT } = config;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.engine("handlebars", handlebars.engine());
app.use(express.static(__dirname + "/public"));
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use(cookieParser(COOKIE_SECRET));
app.use(
  session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, sameSite: "none", secure: true },
  })
);
initPassport();
app.use(passport.initialize());
app.use(passport.session());
app.use(addLogger);
app.use(cors());

//RUTAS
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use(
  "/api/carts",
  passportCall("current"),
  authorization(["user", "premium"]),
  cartsRouter
);
app.use(
  "/chat",
  passportCall("current"),
  authorization(["user", "premium"]),
  chatRouter
);
app.use("/api/sessions", sessionRouter);
app.use("/api/users", passportCall("current"), usersRouter);
app.use("/api/purchases", ticketsRouter);
app.use("/mockingproducts", mockingProducts);
app.use(errorHandler);
app.use("/loggertest", loggerRouter);
app.use("/apidocs", serve, setup(specs));

// MONGO
mongoose.set("strictQuery", false);
mongoose.connect(
  MONGO_URI,
  {
    dbName: DB_NAME,
  },
  (error) => {
    if (error) {
      logger.error("Can't connect to the DB");
      return;
    }

    logger.info("DB connected");
    server.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
    server.on("error", (e) => logger.error(e));
  }
);

//CHAT
io.on("connection", createMessage(io));

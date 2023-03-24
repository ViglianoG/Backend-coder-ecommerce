import express from "express";
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import {
  Server
} from "socket.io";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import initPassport from "./config/passport.config.js";
import cookieParser from "cookie-parser";
import config from "./config/config.js";
import {
  passportCall,
  authorization
} from "./middleware/auth.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import chatRouter from "./routes/chat.router.js";
import viewsRouter from "./routes/views.router.js";
import sessionRouter from "./routes/sessions.router.js";
import {
  createMessage
} from "./controllers/chat.controller.js";
import http from "http";

const {
  SESSION_SECRET,
  COOKIE_SECRET,
  MONGO_URI,
  DB_NAME
} = config;



const app = express();
const server = http.createServer(app)
const io = new Server(server)
const port = 8080;


app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.engine("handlebars", handlebars.engine());
app.use(express.static(__dirname + "/public"));
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");


app.use(cookieParser(COOKIE_SECRET));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
initPassport();
app.use(passport.initialize());
app.use(passport.session());

//RUTAS
app.use("/", viewsRouter);
app.use(
  "/api/products",
  productsRouter
);
app.use("/api/carts", passportCall("current"), authorization("user"), cartsRouter);
app.use("/chat",
  passportCall("current"),
  authorization("user"), chatRouter);
app.use("/api/sessions", sessionRouter);


//
mongoose.set("strictQuery", false);
mongoose.connect(
  MONGO_URI, {
    dbName: DB_NAME,
  },
  (error) => {
    if (error) {
      console.log("Can't connect to the DB");
      return;
    }

    console.log("DB connected");
    server.listen(port, () => console.log(`Listening on port ${port}`));
    server.on("error", (e) => console.log(e));
  });


//CHAT
io.on("connection", createMessage(io));
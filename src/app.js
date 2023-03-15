import express from "express";
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import mongoose from "mongoose";
import run from "./run.js";
import session from "express-session";
import passport from "passport";
import initPassport from "./config/passport.config.js";
import cookieParser from "cookie-parser";
import config from "./config/config.js";

const { SESSION_SECRET, COOKIE_SECRET, MONGO_URI, DB_NAME } = config;

const port = 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

mongoose.set("strictQuery", false);
mongoose.connect(
  MONGO_URI,
  {
    dbName: DB_NAME,
  },
  (error) => {
    if (!error) {
      console.log("DB Connected..");
      const httpServer = app.listen(port, () =>
        console.log(`Listening on port: ${port}`)
      );
      const socketServer = new Server(httpServer);
      httpServer.on("error", (e) => console.log("ERROR: " + e));

      run(socketServer, app);
    } else {
      console.log("Can't connect to db..");
    }
  }
);

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import chatRouter from "./routes/chat.router.js";
import messagesModel from "./dao/models/message.model.js";
import viewsRouter from "./routes/views.router.js";
import sessionRouter from "./routes/sessions.router.js";
import { passportCall, authorization } from "./utils.js";

const run = (socketServer, app) => {
  app.use((req, res, next) => {
    req.io = socketServer;
    next();
  });

  app.use("/", viewsRouter);
  app.use(
    "/api/products",
    passportCall("current"),
    authorization("user"),
    productsRouter
  );
  app.use("/api/carts", cartsRouter);
  app.use("/chat", chatRouter);
  app.use("/api/sessions", sessionRouter);

  socketServer.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("message", async (data) => {
      await messagesModel.create(data);
      let messages = await messagesModel.find().lean().exec();
      socketServer.emit("logs", messages);
    });
  });
};

export default run;

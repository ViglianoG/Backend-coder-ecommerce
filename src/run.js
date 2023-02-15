import productsRouter from "./routes/productsRouter.js";
import cartsRouter from "./routes/cartsRouter.js";
import chatRouter from "./routes/chat.router.js";
import messagesModel from "./dao/models/message.model.js";
import viewsRouter from "./routes/views.router.js";
import sessionRouter from "./routes/sessions.router.js";

const run = (socketServer, app) => {
  app.use((req, res, next) => {
    req.io = socketServer;
    next();
  });

  //MIDDLEWARE AUTH
  function auth(req, res, next) {
    if (req.session?.user) {
      return next();
    } else {
      return res
        .status(401)
        .json({ status: "ERROR", payload: "Not authenticated!" });
    }
  }

  app.use("/", viewsRouter);
  app.use("/api/products", auth, productsRouter);
  app.use("/api/carts", auth, cartsRouter);
  app.use("/chat", auth, chatRouter);
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

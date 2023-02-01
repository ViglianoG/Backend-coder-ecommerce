import productsRouter from "./routes/productsRouter.js";
import cartsRouter from "./routes/cartsRouter.js";
import chatRouter from "./routes/chat.router.js";
import messagesModel from "./dao/models/message.model.js";
import viewsRouter from "./routes/views.router.js";

const run = (socketServer, app) => {
  app.use((req, res, next) => {
    req.io = socketServer;
    next();
  });

  app.use("/products", viewsRouter);

  app.use("/api/products", productsRouter);
  app.use("/api/carts", cartsRouter);
  app.use("/chat", chatRouter);

  socketServer.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("message", async (data) => {
      await messagesModel.create(data);
      let messages = await messagesModel.find().lean().exec();
      socketServer.emit("logs", messages);
    });
  });

  app.use("/", viewsRouter);
};

export default run;

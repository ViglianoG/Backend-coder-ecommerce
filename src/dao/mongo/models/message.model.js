import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  user: String,
  message: String,
});

mongoose.set("strictQuery", false);
const MessageModel = mongoose.model("messages", messageSchema);

export default MessageModel;

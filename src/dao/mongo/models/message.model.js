import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    user: String,
    message: String
});

const MessageModel = mongoose.model("messages", messageSchema);

export default MessageModel;

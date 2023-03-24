import {
    messagesService
} from "../repository/index.js";

export const renderChat = (req, res) => {
    const user = req.user;
    res.render("chat", {
        user
    });
};

export const createMessage = (io) => (socket) => {
    socket.on("chatMessage", async ({
        user,
        msg
    }) => {
        io.emit("message", {
            user,
            msg
        });
        await messagesService.createMessage(user, msg);
    });
};
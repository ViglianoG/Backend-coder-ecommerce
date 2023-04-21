import { Router } from "express";
import { renderChat } from "../controllers/chat.controller.js";
import { passportCall, authorization } from "../middleware/auth.js";
const router = Router();

router.get(
  "/",
  passportCall("current"),
  authorization(["user", "premium"]),
  renderChat
);

export default router;

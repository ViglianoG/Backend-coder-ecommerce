import { Router } from "express";
import {
  updateRole,
  deleteUser,
  deleteUserByEmail,
  uploadDocuments,
} from "../controllers/users.controller.js";
import { passportCall, authorization } from "../middleware/auth.js";
import { uploader } from "../services/multer.js";

const router = Router();

//UPGRADE ROLE ✔
router.put(
  "/premium/:uid",
  passportCall("current"),
  authorization(["user", "premium"]),
  updateRole
);

//DELETE USER BY EMAIL ✔
router.delete("/email/:email", deleteUserByEmail);

//DELETE USER BY ID ✔
router.delete("/:uid", deleteUser);

//UPLOAD ✔
router.post(
  "/:uid/documents",
  passportCall("current"),
  authorization(["user", "premium"]),
  uploader.array("file"),
  uploadDocuments
);

export default router;

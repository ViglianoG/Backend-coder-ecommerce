import { Router } from "express";
import {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  addProductWithoutFile,
} from "../controllers/products.controller.js";
import { passportCall, authorization } from "../middleware/auth.js";
import { uploader } from "../services/multer.js";

const router = Router();

//GET CON QUERY LIMITS
router.get("/", passportCall("current"), getProducts);

//GET PRODUCT POR EL ID
router.get("/:pid", passportCall("current"), getProduct);

//AGREGAR PRODUCTO
router.post(
  "/",
  passportCall("current"),
  authorization(["premium", "admin"]),
  uploader.array("file", 1),
  addProduct
);

//AGREGAR PROD SIN FILE
router.post(
  "/no_file",
  passportCall("current"),
  authorization(["premium", "admin"]),
  uploader.array("file", 1),
  addProductWithoutFile
);

//BORRAR PRODUCTO
router.delete(
  "/:pid",
  passportCall("current"),
  authorization(["admin", "premium"]),
  deleteProduct
);

//MODIFICAR PRODUCTO
router.put(
  "/:pid",
  passportCall("current"),
  authorization(["admin", "premium"]),
  updateProduct
);

export default router;

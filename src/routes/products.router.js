import { Router } from "express";
import {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";
import { passportCall, authorization } from "../middleware/auth.js";

const router = Router();

//GET CON QUERY LIMITS
router.get("/", passportCall("current"), getProducts);

//GET PRODUCT POR EL ID
router.get("/:pid", passportCall("current"), getProduct);

//AGREGAR PRODUCTO
router.post(
  "/",
  passportCall("current"),
  authorization(["admin", "premium"]),
  addProduct
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

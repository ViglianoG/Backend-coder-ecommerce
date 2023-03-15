import { Router } from "express";
import {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";

const router = Router();

//GET CON QUERY LIMITS
router.get("/", getProducts);

//GET PRODUCT POR EL ID
router.get("/:pid", getProduct);

//AGREGAR PRODUCTO
router.post("/", addProduct);

//BORRAR PRODUCTO
router.delete("/:pid", deleteProduct);

//MODIFICAR PRODUCTO
router.put("/:pid", updateProduct);

export default router;

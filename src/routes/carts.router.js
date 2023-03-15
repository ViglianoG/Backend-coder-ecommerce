import { Router } from "express";
import {
  createCart,
  getProducts,
  addProduct,
  deleteProduct,
  updateCart,
  updateQuantity,
  emptyCart,
} from "../controllers/carts.controller.js";

const router = Router();

//RUTA POST CREA UN NUEVO CARRITO
router.post("/", createCart);

//MUESTRA EL CARRITO
router.get("/:cid", getProducts);

//AGREGA UN PROD AL CARRITO
router.post("/:cid/products/:pid", addProduct);

//ELIMINAR PROD DE CARRO
router.delete("/:cid/products/:pid", deleteProduct);

//AGREGAR VARIOS PROD AL CARRITO
router.put("/:cid", updateCart);

//MODIFICAR LA CANTIDAD DE LOS PROD DEL CARRITO
router.put("/:cid/products/:pid", updateQuantity);

//VACIAR CARRO
router.delete("/:cid", emptyCart);

export default router;

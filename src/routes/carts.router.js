import { Router } from "express";
import {
  createCart,
  getProducts,
  addProduct,
  deleteProduct,
  updateCart,
  updateQuantity,
  emptyCart,
  purchase,
  prepareCheckout,
  finishCheckout,
} from "../controllers/carts.controller.js";

const router = Router();

//RUTA POST CREA UN NUEVO CARRITO
router.post("/", createCart);

//MUESTRA EL CARRITO
router.get("/:cid", getProducts);

//AGREGAR VARIOS PROD AL CARRITO
router.put("/:cid", updateCart);

//VACIAR CARRO
router.delete("/:cid", emptyCart);

//AGREGA UN PROD AL CARRITO
router.post("/:cid/products/:pid", addProduct);

//MODIFICAR LA CANTIDAD DE LOS PROD DEL CARRITO
router.put("/:cid/products/:pid", updateQuantity);

//ELIMINAR PROD DE CARRO
router.delete("/:cid/products/:pid", deleteProduct);

//COMPRAR
router.post("/:cid/purchase", purchase);

//CHECKOUT
router.post("/:cid/checkout", prepareCheckout);
router.post("/:cid/finish_checkout", finishCheckout);

export default router;

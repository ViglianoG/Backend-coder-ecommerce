import CartModel from "../dao/mongo/models/cart.model.js";
import ProductModel from "../dao/mongo/models/product.model.js";
import { cartsService, productsService } from "../repository/index.js";
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import {
  generateNullError,
  generateAuthorizationError,
} from "../services/errors/info.js";
import mercadopago from "mercadopago";

/////////////////////////CREA UN NUEVO CARRITO

export const createCart = async (req, res) => {
  try {
    const cart = await cartsService.createCart();
    res.json({
      result: "success",
      payload: cart,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "error",
      error,
    });
  }
};

/////////////////////////MUESTRA EL CARRITO

export const getProducts = async (req, res) => {
  try {
    const cid = req.params.cid;
    const userCart = req.user.cart.toString();

    if (cid !== userCart)
      CustomError.createError({
        name: "Authorization error",
        cause: generateAuthorizationError(),
        message: "Solo tienes acceso a tu propio carrito.",
        code: EErrors.AUTHORIZATION_ERROR,
      });
    const cart = await cartsService.getCart(cid);
    res.json({
      result: "success",
      payload: cart,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "error",
      error,
    });
  }
};

/////////////////////////AGREGA UN PROD AL CARRITO

export const addProduct = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const user = req.user;
    const userCart = user.cart.toString();
    const quantity = req.body.quantity || 1;

    if (cid !== userCart)
      CustomError.createError({
        name: "Authorization error",
        cause: generateAuthorizationError(),
        message: "Solo tienes acceso a tu propio carrito.",
        code: EErrors.AUTHORIZATION_ERROR,
      });

    const cart = await cartsService.getCart(cid);
    const product = await productsService.getProduct(pid);

    const updatedCart = await cartsService.addProductToCart(
      user,
      cart,
      product,
      quantity
    );

    res.json({
      result: "success",
      payload: updatedCart,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "error",
      error,
    });
  }
};

/////////////////////////ELIMINAR PROD DE CARRO

export const deleteProduct = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const userCart = req.user.cart.toString();

    if (cid !== userCart)
      CustomError.createError({
        name: "Authorization error",
        cause: generateAuthorizationError(),
        message: "Solamente tienes acceso a tu propio carrito.",
        code: EErrors.AUTHORIZATION_ERROR,
      });

    const cart = await CartModel.findOne({
      _id: cid,
    });
    const product = await ProductModel.findOne({
      _id: pid,
    });

    if (!cart)
      CustomError.createError({
        name: "Cart error",
        cause: generateNullError("Cart"),
        message: "Error al intentar encontrar el carrito.",
        code: EErrors.NULL_ERROR,
      });

    if (!product)
      CustomError.createError({
        name: "Product error",
        cause: generateNullError("Product"),
        message: "Error al intentar encontrar el producto.",
        code: EErrors.NULL_ERROR,
      });

    const productIndex = cart.products.findIndex((p) =>
      p.product.equals(product._id)
    );

    const products = [...cart.products];
    products.splice(productIndex, 1);

    const updatedCart = await cartsService.updateCart(cid, {
      products,
    });

    res.json({
      result: "success",
      payload: updatedCart,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "error",
      error,
    });
  }
};

/////////////////////////AGREGAR VARIOS PROD AL CARRITO

export const updateCart = async (req, res) => {
  try {
    const cid = req.params.cid;
    const products = req.body;
    const userCart = req.user.cart.toString();

    if (cid !== userCart)
      CustomError.createError({
        name: "Authorization error",
        cause: generateAuthorizationError(),
        message: "Solamente tienes acceso a tu propio carrito.",
        code: EErrors.AUTHORIZATION_ERROR,
      });

    const prod = await Promise.all(
      products.map(async (p) => await productsService.getProduct(p.product))
    );

    if (prod.some((p) => p === null))
      CustomError.createError({
        name: "Product error",
        cause: generateNullError("Product"),
        message: "Uno o mas productos no se encontraron.",
        code: EErrors.NULL_ERROR,
      });

    const cart = await cartsService.updateCart(cid, {
      products,
    });

    res.json({
      result: "success",
      payload: cart,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "error",
      error,
    });
  }
};

/////////////////////////MODIFICAR LA CANTIDAD DE LOS PROD DEL CARRITO

export const updateQuantity = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const quantity = req.body;
    const userCart = req.user.cart.toString();

    if (cid !== userCart)
      CustomError.createError({
        name: "Authorization error",
        cause: generateAuthorizationError(),
        message: "Solamente tienes acceso a tu propio carrito.",
        code: EErrors.AUTHORIZATION_ERROR,
      });

    const cart = await cartsService.getCart(cid);
    const product = await productsService.getProduct(pid);

    if (!cart)
      CustomError.createError({
        name: "Find cart error",
        cause: generateNullError("Cart"),
        message: "Error al intentar encontrar el carrito.",
        code: EErrors.NULL_ERROR,
      });

    if (!product)
      CustomError.createError({
        name: "Find product error",
        cause: generateNullError("Product"),
        message: "Error al intentar encontrar el producto.",
        code: EErrors.NULL_ERROR,
      });

    const productIndex = cart.products.findIndex((p) =>
      p.product.equals(product._id)
    );
    cart.products[productIndex].quantity = parseInt(quantity);

    const updatedCart = await cartsService.updateCart(cid, cart);

    res.json({
      result: "success",
      payload: updatedCart,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "error",
      error,
    });
  }
};

/////////////////////////VACIAR CARRO

export const emptyCart = async (req, res) => {
  try {
    const cid = req.params.cid;
    const userCart = req.user.cart.toString();

    if (cid !== userCart)
      CustomError.createError({
        name: "Authorization error",
        cause: generateAuthorizationError(),
        message: "Solamente tienes acceso a tu propio carrito.",
        code: EErrors.AUTHORIZATION_ERROR,
      });

    const cart = await cartsService.updateCart(cid, {
      products: [],
    });

    res.json({
      result: "success",
      payload: cart,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "error",
      error,
    });
  }
};

/////////////////////////COMPLETAR COMPRA

export const purchase = async (req, res) => {
  try {
    const { cid } = req.params;
    const purchaser = req.user.email;
    const { ticket, outOfStock } = await cartsService.purchase(cid, purchaser);

    if (outOfStock.length > 0) {
      const ids = outOfStock.map((p) => p._id);
      req.logger.info("Uno o mas productos están fuera de stock.");
      return res.json({ status: "error", payload: { outOfStock: ids } });
    }

    res.json({
      result: "success",
      payload: ticket,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "error",
      error,
    });
  }
};

////////////////////////PREPARE CHECKOUT

export const prepareCheckout = async (req, res) => {
  try {
    const { cid } = req.params;
    const purchaser = req.user.email;
    const { outOfStock, available, preferenceId } =
      await cartsService.prepareCheckout(cid, purchaser);

    if (outOfStock.length > 0) {
      req.logger.info("Uno o mas productos están fuera de stock.");
      return res.json({ status: "error", payload: { outOfStock } });
    }

    res.json({
      status: "success",
      payload: { items: available, preferenceId },
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ status: "error", error });
  }
};

/////////////////FINISH CHECKOUT

export const finishCheckout = async (req, res) => {
  try {
    const { cid } = req.params;
    const { purchaser, ...payment } = req.query;

    if (payment.type !== "payment") return;
    const data = await mercadopago.payment.findById(payment["data.id"]);
    const ticket = await cartsService.finishCheckout(cid, data.body, purchaser);

    if (!ticket)
      return res.json({ status: "error", error: "Error durante el pago." });
    res.json({ status: "success", payload: ticket });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ status: "error", error });
  }
};

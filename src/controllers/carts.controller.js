import CartModel from "../dao/mongo/models/cart.model.js";
import ProductModel from "../dao/mongo/models/product.model.js";
import { cartsService, productsService } from "../repository/index.js";
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import {
  generateNullError,
  generateAuthorizationError,
} from "../services/errors/info.js";

/////////////////////////CREA UN NUEVO CARRITO

export const createCart = async (req, res) => {
  try {
    const result = await cartsService.createCart();
    res.json({
      result: "Success",
      payload: result,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "Error...",
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
      result: "Success",
      payload: cart,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "Error...",
      error,
    });
  }
};

/////////////////////////AGREGA UN PROD AL CARRITO

export const addProduct = async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const user = req.user;
    const userCart = user.cart.toString();

    if (cid !== userCart)
      CustomError.createError({
        name: "Authorization error",
        cause: generateAuthorizationError(),
        message: "Solo tienes acceso a tu propio carrito.",
        code: EErrors.AUTHORIZATION_ERROR,
      });

    const cart = await cartsService.getCart(cid);
    if (!cart)
      res.send({
        status: "ERROR",
        error: "No se ha encontrado el carrito especificado.",
      });

    const product = await productsService.getProduct(pid);
    if (!product)
      res.send({
        status: "ERROR",
        error: "No se ha encontrado el producto especificado.",
      });

    const updatedCart = await cartsService.addProductToCart(
      user,
      cart,
      product
    );

    res.json({
      result: "Success",
      payload: updatedCart,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "Error...",
      error,
    });
  }
};

/////////////////////////ELIMINAR PROD DE CARRO

export const deleteProduct = async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
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
    if (!cart)
      CustomError.createError({
        name: "Cart error",
        cause: generateNullError("Cart"),
        message: "Error al intentar encontrar el carrito.",
        code: EErrors.NULL_ERROR,
      });

    const product = await ProductModel.findOne({
      _id: pid,
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
    const updateCart = await cartsService.updateCart(cid, {
      products,
    });

    res.json({
      result: "Success",
      payload: updateCart,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "Error...",
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
      result: "Success",
      payload: cart,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "Error...",
      error,
    });
  }
};

/////////////////////////MODIFICAR LA CANTIDAD DE LOS PROD DEL CARRITO

export const updateQuantity = async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body.quantity;
    const userCart = req.user.cart.toString();

    if (cid !== userCart)
      CustomError.createError({
        name: "Authorization error",
        cause: generateAuthorizationError(),
        message: "Solamente tienes acceso a tu propio carrito.",
        code: EErrors.AUTHORIZATION_ERROR,
      });

    const cart = await cartsService.getCart(cid);

    if (!cart)
      CustomError.createError({
        name: "Find cart error",
        cause: generateNullError("Cart"),
        message: "Error al intentar encontrar el carrito.",
        code: EErrors.NULL_ERROR,
      });

    const product = await productsService.getProduct(pid);
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

    const updateCart = await cartsService.updateCart(cid, cart);

    res.json({
      result: "Success",
      payload: updateCart,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "Error...",
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
      result: "Success",
      payload: cart,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "Error...",
      error,
    });
  }
};

/////////////////////////COMPLETAR COMPRA

export const purchase = async (req, res) => {
  try {
    const cid = req.params.cid;
    const purchaser = req.user.email;
    const { outOfStock, ticket } = await cartsService.purchase(cid, purchaser);

    if (outOfStock.length > 0) {
      const ids = outOfStock.map((p) => p._id);
      return res.json({
        result: "Success",
        payload: ids,
      });
    }

    res.json({
      result: "Success",
      payload: ticket,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "Error...",
      error,
    });
  }
};

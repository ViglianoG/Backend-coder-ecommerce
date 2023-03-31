import CartModel from "../dao/mongo/models/cart.model.js";
import ProductModel from "../dao/mongo/models/product.model.js";
import {
  cartsService,
  productsService
} from "../repository/index.js"

/////////////////////////CREA UN NUEVO CARRITO

export const createCart = async (req, res) => {
  try {
    const result = await cartsService.createCart();
    res.json({
      result: "Success",
      payload: result
    });
  } catch (error) {
    console.log(error);
    res.json({
      result: "Error...",
      error
    });
  }
};

/////////////////////////MUESTRA EL CARRITO

export const getProducts = async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartsService
      .getCart(cid)
    res.json({
      result: "Success",
      payload: cart
    });
  } catch (error) {
    console.log(error);
    res.json({
      result: "Error...",
      error
    });
  }
};

/////////////////////////AGREGA UN PROD AL CARRITO

export const addProduct = async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;

    const cart = await cartsService.getCart(cid);
    if (!cart)
      res.send({
        status: "ERROR",
        error: "No se ha encontrado el carrito especificado...",
      });

    const product = await productsService.getProduct(pid);
    if (!product)
      res.send({
        status: "ERROR",
        error: "No se ha encontrado el producto especificado...",
      });

    const updateCart = await cartsService.addProductToCart(cart, product)

    res.json({
      result: "Success",
      payload: updateCart
    });

  } catch (error) {
    console.log(error);
    res.json({
      result: "Error...",
      error
    });
  }
};

/////////////////////////ELIMINAR PROD DE CARRO

export const deleteProduct = async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;

    const cart = await CartModel.findOne({
      _id: cid
    });
    if (!cart)
      return res.send({
        status: "ERROR",
        error: "No se ha encontrado el carrito especificado...",
      });

    const product = await ProductModel.findOne({
      _id: pid
    });
    if (!product)
      return res.send({
        status: "ERROR",
        error: "No se ha encontrado el producto especificado...",
      });

    const productIndex = cart.products.findIndex((p) =>
      p.product.equals(product._id)
    );
    const products = [...cart.products]
    products.splice(productIndex, 1)
    const updateCart = await cartsService.updateCart(cid, {
      products
    })

    res.json({
      result: "Success",
      payload: updateCart
    });
  } catch (error) {
    console.log(error);
    res.json({
      result: "Error...",
      error
    });
  }
};

/////////////////////////AGREGAR VARIOS PROD AL CARRITO

export const updateCart = async (req, res) => {
  try {
    const cid = req.params.cid;
    const products = req.body;
    const prod = await Promise.all(products.map(async p => await productsService.getProduct(p.product)))
    if (prod.some(p => p === null)) return res.json({
      result: "Error...",
      error: "Alguno de los productos no existe..."
    })


    const cart = await cartsService.updateCart(cid, {
      products
    });

    res.json({
      result: "Success",
      payload: cart
    });
  } catch (error) {
    console.log(error);
    res.json({
      result: "Error...",
      error
    });
  }
};

/////////////////////////MODIFICAR LA CANTIDAD DE LOS PROD DEL CARRITO

export const updateQuantity = async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body.quantity;

    const cart = await cartsService.getCart(cid);
    // if (!cart)
    //   return res.send({
    //     status: "ERROR",
    //     error: "No se ha encontrado el carrito especificado...",
    //   });
    if (!cart) CustomError.createError({
      name: "Find cart error",
      cause: generateNullError("Cart"),
      message: "Error trying to find cart",
      code: EErrors.NULL_ERROR
    });

    const product = await productsService.getProduct(pid);
    if (!product) CustomError.createError({
      name: "Find product error",
      cause: generateNullError("Product"),
      message: "Error trying to find product",
      code: EErrors.NULL_ERROR
    });
    // if (!product)
    //   return res.send({
    //     status: "ERROR",
    //     error: "No se ha encontrado el producto especificado...",
    //   });

    const productIndex = cart.products.findIndex((p) =>
      p.product.equals(product._id)
    );
    cart.products[productIndex].quantity = parseInt(quantity);

    const updateCart = await cartsService.updateCart(cid, cart)

    res.json({
      result: "Success",
      payload: updateCart
    });
  } catch (error) {
    console.log(error);
    res.json({
      result: "Error...",
      error
    });
  }
};

/////////////////////////VACIAR CARRO

export const emptyCart = async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartsService.updateCart(cid, {
      products: []
    });

    res.json({
      result: "Success",
      payload: cart
    });
  } catch (error) {
    console.log(error);
    res.json({
      result: "Error...",
      error
    });
  }
};

/////////////////////////COMPLETAR COMPRA

export const purchase = async (req, res) => {
  try {
    const cid = req.params.cid
    const purchaser = req.user.email
    const {
      outOfStock,
      ticket
    } = await cartsService.purchase(cid, purchaser)

    if (outOfStock.length > 0) {
      const ids = outOfStock.map(p => p._id)
      return res.json({
        result: "Success",
        payload: ids
      });
    }

    res.json({
      result: "Success",
      payload: ticket
    });
  } catch (error) {
    console.log(error);
    res.json({
      result: "Error...",
      error
    });
  }
}
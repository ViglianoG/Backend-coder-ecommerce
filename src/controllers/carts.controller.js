import cartModel from "../dao/models/cart.model.js";
import productModel from "../dao/models/product.model.js";

/////////////////////////CREA UN NUEVO CARRITO

export const createCart = async (req, res) => {
  try {
    const result = await cartModel.create([]);
    res.json({ result: "Success", payload: result });
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
};

/////////////////////////MUESTRA EL CARRITO

export const getProducts = async (req, res) => {
  try {
    const cid = req.params.cid;
    const products = await cartModel
      .findOne({ _id: cid })
      .populate("products.product");
    res.json({ result: "Success", payload: products });
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
};

/////////////////////////AGREGA UN PROD AL CARRITO

export const addProduct = async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;

    const cart = await cartModel.findOne({ _id: cid });
    if (!cart)
      res.send({
        status: "ERROR",
        error: "No se ha encontrado el carrito especificado...",
      });

    const product = await productModel.findOne({ _id: pid });
    if (!product)
      res.send({
        status: "ERROR",
        error: "No se ha encontrado el producto especificado...",
      });

    const productIndex = cart.products.findIndex((p) =>
      p.product.equals(product._id)
    );
    if (productIndex === -1) {
      cart.products.push({ product: product._id, quantity: 1 });
      await cart.save();
    } else {
      cart.products[productIndex].quantity++;
      await cartModel.updateOne({ _id: cid }, cart);
    }

    res.json({ result: "success", payload: cart });
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
};

/////////////////////////ELIMINAR PROD DE CARRO

export const deleteProduct = async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;

    const cart = await cartModel.findOne({ _id: cid });
    if (!cart)
      return res.send({
        status: "ERROR",
        error: "No se ha encontrado el carrito especificado...",
      });

    const product = await productModel.findOne({ _id: pid });
    if (!product)
      return res.send({
        status: "ERROR",
        error: "No se ha encontrado el producto especificado...",
      });

    const productIndex = cart.products.findIndex((p) =>
      p.product.equals(product._id)
    );
    cart.products.splice(productIndex, 1);
    await cart.save();

    res.json({ result: "Success", payload: cart });
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
};

/////////////////////////AGREGAR VARIOS PROD AL CARRITO

export const updateCart = async (req, res) => {
  try {
    const cid = req.params.cid;
    const products = req.body;
    const cart = await cartModel.findOne({ _id: cid });

    cart.products = products;
    await cart.save();

    res.json({ result: "Success", payload: cart });
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
};

/////////////////////////MODIFICAR LA CANTIDAD DE LOS PROD DEL CARRITO

export const updateQuantity = async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body.quantity;

    const cart = await cartModel.findOne({ _id: cid });
    if (!cart)
      return res.send({
        status: "ERROR",
        error: "No se ha encontrado el carrito especificado...",
      });

    const product = await productModel.findOne({ _id: pid });
    if (!product)
      return res.send({
        status: "ERROR",
        error: "No se ha encontrado el producto especificado...",
      });

    const productIndex = cart.products.findIndex((p) =>
      p.product.equals(product._id)
    );
    cart.products[productIndex].quantity = parseInt(quantity);
    await cart.save();

    res.json({ result: "Success", payload: cart });
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
};

/////////////////////////VACIAR CARRO

export const emptyCart = async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartModel.findOne({ _id: cid });
    cart.products = [];
    await cart.save();

    res.json({ result: "Success", payload: cart });
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
};

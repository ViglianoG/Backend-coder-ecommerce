import { productsService } from "../repository/index.js";

/////////////////////////GET CON QUERY LIMITS

export const getProducts = async (req, res) => {
  try {
    const products = await productsService.getProducts();
    res.json({
      status: "Success",
      payload: products,
    });
  } catch (error) {
    req.logger.error(error);
    res.json({
      result: "Error...",
      error,
    });
  }
};

/////////////////////////GET PRODUCT POR EL ID

export const getProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productsService.getProduct(pid);
    res.json({
      status: "Success",
      payload: product,
    });
  } catch (error) {
    req.logger.error(error);
    res.json({
      result: "Error...",
      error,
    });
  }
};

/////////////////////////AGREGAR PRODUCTO

export const addProduct = async (req, res) => {
  try {
    const product = req.body;
    const addProd = await productsService.createProduct(product);
    res.json({
      status: "Success",
      payload: addProd,
    });
  } catch (error) {
    req.logger.error(error);
    res.json({
      result: "Error...",
      error,
    });
  }
};

/////////////////////////BORRAR PRODUCTO

export const deleteProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const result = await productsService.deleteProduct(pid);

    res.json({
      status: "Success",
      payload: result,
    });
  } catch (error) {
    req.logger.error(error);
    res.json({
      result: "Error...",
      error,
    });
  }
};

/////////////////////////MODIFICAR PRODUCTO

export const updateProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productsService.getProduct(pid);
    const updatedProd = {
      ...product,
      ...req.body,
    };
    const result = await productsService.updateProduct(pid, updatedProd);

    res.json({
      status: "Success",
      payload: result,
    });
  } catch (error) {
    req.logger.error(error);
    res.json({
      result: "Error...",
      error,
    });
  }
};

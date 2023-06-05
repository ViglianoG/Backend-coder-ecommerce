import { productsService, usersService } from "../repository/index.js";
import Mail from "../services/mail.js";

/////////////////////////GET CON QUERY LIMITS

export const getProducts = async (req, res) => {
  try {
    const {
      products,
      options: { limit, category, stock },
    } = await productsService.getPaginate(req);
    res.json({
      status: "Success",
      payload: products,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "error",
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
    req.logger.error(error.toString());
    res.json({
      result: "error",
      error,
    });
  }
};

/////////////////////////AGREGAR PRODUCTO

export const addProduct = async (req, res) => {
  try {
    const { role, email } = req.user;
    const product = req.body;
    const documents = await usersService.saveDocuments(req.user, req.files);

    product.thumbnails = documents.map((file) => file.reference);
    product.category = Array.isArray(product.category)
      ? product.category
      : product.category.split(",").map((c) => c.trim());

    if (role === "premium") product.owner = email;

    const result = await productsService.createProduct(product);
    res.json({
      status: "Success",
      payload: result,
    });
  } catch (error) {
    console.log(error);
    req.logger.error(error.toString());
    res.json({
      result: "error",
      error,
    });
  }
};

////////////////////////AGREGAR PROD SIN FILE

export const addProductWithoutFile = async (req, res) => {
  try {
    const { role, email } = req.user;
    const product = req.body;
    product.category = Array.isArray(product.category)
      ? product.category
      : product.category.split(",").map((c) => c.trim());

    if (role === "premium") product.owner = email;

    const result = await productsService.createProduct(product);
    res.json({ status: "success", payload: result });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({ status: "error", error });
  }
};

/////////////////////////BORRAR PRODUCTO

export const deleteProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productsService.getProduct(pid);
    const user = req.user;
    const userEmail = user.email;

    if (user.role === "premium" && userEmail !== product.owner) {
      const error = "You can't modify a product owned by another user";
      req.logger.error(error);
      return res.status(403).json({ status: "error", error });
    }

    const result = await productsService.deleteProduct(pid);

    const owner = await usersService.getUserByEmail(product.owner);
    const mail = new Mail();
    const html = `<h1>Su producto fue eliminado</h1>
    <p>Hola, ${owner.first_name}. Su producto '${product.title}' (ID: ${pid}) ha sido eliminado.</p>`;

    if (owner.role === "premium") {
      mail.send(owner.email, "Producto eliminado", html);
    }

    res.json({ status: "success", payload: result });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "error",
      error,
    });
  }
};

/////////////////////////MODIFICAR PRODUCTO

export const updateProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productsService.getProduct(pid);
    const user = req.user;

    const userEmail = user.email;
    const owner = product.owner;

    if (user.role === "premium" && userEmail !== owner) {
      const error = "You can't modify a product owned by another user";
      req.logger.error(error);
      return res.status(403).json({ status: "error", error });
    }

    const updatedProduct = {
      ...product,
      ...req.body,
    };
    const result = await productsService.updateProduct(pid, updatedProduct);

    res.json({
      status: "Success",
      payload: result,
    });
  } catch (error) {
    req.logger.error(error.toString());
    res.json({
      result: "error",
      error,
    });
  }
};

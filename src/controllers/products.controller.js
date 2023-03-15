import productModel from "../dao/models/product.model.js";

/////////////////////////GET CON QUERY LIMITS

export const getProducts = async (req, res) => {
  try {
    const category = req.query.category;
    const stock = req.query.stock;

    const query = {
      ...(category ? { categories: category } : null),
      ...(stock ? { stock: { $gt: 0 } } : null),
    };

    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const sort = req.query.sort;

    const products = await productModel.paginate(query, {
      page: page,
      limit: limit,
      sort: { price: sort } || null,
    });

    res.json({ status: "Success", payload: products });
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
};

/////////////////////////GET PRODUCT POR EL ID

export const getProduct = async (req, res) => {
  try {
    const pID = req.params.pid;
    const product = await productModel.findOne({ _id: pID }).lean().exec();
    res.json({ status: "Success", payload: product });
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
};

/////////////////////////AGREGAR PRODUCTO

export const addProduct = async (req, res) => {
  try {
    const product = req.body;
    const addedProduct = new productModel(product);
    await addedProduct.save();
    res.json({ status: "Success", payload: addedProduct });
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
};

/////////////////////////BORRAR PRODUCTO

export const deleteProduct = async (req, res) => {
  try {
    const pID = req.params.pid;
    const result = await productModel.deleteOne({ _id: pID });

    res.json({ status: "Success", payload: result });
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
};

/////////////////////////MODIFICAR PRODUCTO

export const updateProduct = async (req, res) => {
  try {
    const pID = req.params.pid;
    const updateFields = req.body;
    const result = await productModel.updateOne({ _id: pID }, updateFields);

    res.json({ status: "Success", payload: result });
  } catch (error) {
    console.log(error);
    res.json({ result: "Error...", error });
  }
};

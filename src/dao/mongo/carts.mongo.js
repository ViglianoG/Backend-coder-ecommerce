import CartModel from "./models/cart.model.js";
import ProductModel from "./models/product.model.js";

export default class Cart {
  constructor() {}

  create = async () => {
    const cart = await CartModel.create({
      products: [],
    });
    return cart;
  };

  getById = async (id) => {
    return await CartModel.findById(id).populate({
      path: "products.product",
      model: ProductModel,
    });
  };

  update = async (id, data) => {
    return await CartModel.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          products: data.products,
          quantity: data.quantity,
        },
      }
    );
  };
}

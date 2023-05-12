import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  code: {
    type: String,
    unique: true,
  },
  price: Number,
  status: {
    type: Boolean,
    default: true,
  },
  stock: Number,
  category: [String],
  thumbnails: [String],
  owner: {
    type: String,
    default: "admin",
  },
});

productSchema.plugin(mongoosePaginate);

mongoose.set("strictQuery", false);
const ProductModel = mongoose.model("products", productSchema);

export default ProductModel;

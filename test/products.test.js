import mongoose from "mongoose";
import chai from "chai";
import Product from "../src/dao/mongo/products.mongo.js";
import config from "../src/config/config.js";
const { TEST_MONGO_URI } = config;

mongoose.connect(TEST_MONGO_URI);
const expect = chai.expect;

describe("Testing Products DAO", () => {
  before(function () {
    this.productsDao = new Product();
  });

  beforeEach(function () {
    mongoose.connection.collections.products.drop();
    this.timeout(5000);
  });

  //GET PROD
  it("El DAO debe obtener todos los productos en formato de array.", async function () {
    const result = await this.productsDao.get();
    expect(result).to.be.an("array");
  });

  //GET PAGINATE
  it("El DAO debe obtener los productos con paginación, utilizando las opciones que se mandan por parámetros.", async function () {
    const result = await this.productsDao.getPaginate(
      { category: "comida" },
      { limit: 3, page: 1, sort: {}, lean: true }
    );
    expect(result.docs).to.be.an("array");
    expect(result.limit).to.be.eql(3);
    expect(result.page).to.be.eql(1);
  });

  //ADD PROD
  it("El DAO debe poder crear un nuevo producto.", async function () {
    const product = {
      title: "Alfajor grandote",
      description: "Doble y triple sabor",
      code: "DG561F4R",
      price: 300,
      stock: 96,
      category: ["comida"],
      thumbnails: [],
    };

    const result = await this.productsDao.create(product);
    expect(result._id).to.be.ok;
  });

  //GET PROD ID
  it("El DAO debe poder obtener un solo producto mediante el ID.", async function () {
    const data = {
      title: "Alfajor grandote",
      description: "Doble y triple sabor",
      code: "DG561F4R",
      price: 300,
      stock: 96,
      category: ["comida"],
      thumbnails: [],
    };

    const product = await this.productsDao.create(data);
    const result = await this.productsDao.getById(product._id);

    expect(result).to.be.ok.and.an("object");
    expect(result._id).to.be.ok;
  });

  //MOD PROD
  it("El DAO debe poder modificar un producto.", async function () {
    const data = {
      title: "Alfajor grandote",
      description: "Doble y triple sabor",
      code: "DG561F4R",
      price: 300,
      stock: 96,
      category: ["comida"],
      thumbnails: [],
    };

    const newData = {
      title: "Producto actualizado",
      stock: 120,
    };

    const product = await this.productsDao.create(data);
    const result = await this.productsDao.update(product._id, newData);
    const updatedProduct = await this.productsDao.getById(product._id);

    expect(result.modifiedCount).to.be.eql(1);
    expect(updatedProduct.title).to.be.eql(newData.title);
    expect(updatedProduct.stock).to.be.eql(newData.stock);
  });

  //DEL PROD
  it("El DAO debe poder eliminar un producto.", async function () {
    const data = {
      title: "Alfajor grandote",
      description: "Doble y triple sabor",
      code: "DG561F4R",
      price: 300,
      stock: 96,
      category: ["comida"],
      thumbnails: [],
    };

    const product = await this.productsDao.create(data);
    const result = await this.productsDao.delete(product._id);
    const deleted = await this.productsDao.getById(product._id);

    expect(result.deletedCount).to.be.eql(1);
    expect(deleted).to.be.eql(null);
  });
});

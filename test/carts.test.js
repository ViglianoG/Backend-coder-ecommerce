import mongoose from "mongoose";
import chai from "chai";
import Cart from "../src/dao/mongo/carts.mongo.js";
import config from "../src/config/config.js";
const { TEST_MONGO_URI } = config;

mongoose.connect(TEST_MONGO_URI);
const expect = chai.expect;

describe("Testing Carts DAO", () => {
  before(function () {
    this.cartsDao = new Cart();
  });

  beforeEach(function () {
    mongoose.connection.collections.carts.drop();
    this.timeout(0);
  });

  //CREATE CART
  it("El DAO debe poder crear un carrito con una propiedad products que por defecto es un array vacío.", async function () {
    const cart = await this.cartsDao.create();

    expect(cart._id).to.be.ok;
    expect(cart.products).to.be.deep.equal([]);
  });

  //GET CART
  it("El DAO debe poder obtener un carrito mediante su ID.", async function () {
    const cart = await this.cartsDao.create();
    const foundCart = await this.cartsDao.getById(cart._id);

    expect(foundCart._id).to.be.ok;
    expect(foundCart.products).to.be.an("array");
  });

  //MOD CART
  it("El DAO debe poder modificar un carrito.", async function () {
    const cart = await this.cartsDao.create();
    const data = [
      { product: "63d927a518a0be60fbf003a4", quantity: 5 },
      { product: "63d927ff18a0be60fbf003a8", quantity: 2 },
    ];

    const result = await this.cartsDao.update(cart._id, data);

    expect(result.modifiedCount).to.be.ok.and.eql(1);
  });
});

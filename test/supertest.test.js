import chai from "chai";
import supertest from "supertest";
import config from "../src/config/config.js";

const { COOKIE_NAME, BASE_URL } = config;

const expect = chai.expect;
const requester = supertest(BASE_URL);

describe("Testing Coder eCommerce", function () {
  let cookie;
  this.timeout(0);

  after(function () {
    requester
      .delete("api/users/email/usuariodeprueba@usuariodeprueba.com")
      .set("Cookie", [`${cookie.name}=${cookie.value}`])
      .then((result) => console.log("Delete test user.", result.body));
  });

  //SESSIONS
  describe("Test de sessions (Register, Login y Current)", () => {
    const mockUser = {
      first_name: "Usuario",
      last_name: "DePrueba",
      email: "usuariodeprueba@usuariodeprueba.com",
      password: "secretsecret",
      age: "26",
      role: "premium",
    };

    // before(async function () {
    //   await requester.delete(`api/sessions/email/${mockUser.email}`);
    // });

    //REGISTER
    it("El endpoint POST api/sessions/register debe registrar un usuario.", async () => {
      const { _body } = await requester
        .post("api/sessions/register")
        .send(mockUser);
      expect(_body.payload).to.have.property("_id");
    });

    //LOGIN
    it("El endpoint POST api/sessions/login debe loguear al usuario y devolver una cookie.", async () => {
      const data = {
        email: mockUser.email,
        password: mockUser.password,
      };

      const result = await requester.post("api/sessions/login").send(data);
      const cookieResult = result.headers["set-cookie"][0];
      expect(cookieResult).to.be.ok;
      cookie = {
        name: cookieResult.split("=")[0],
        value: cookieResult.split("=")[1],
      };
      expect(cookie.name).to.be.ok.and.eql(COOKIE_NAME);
      expect(cookie.value).to.be.ok;
    });

    //CURRENT
    it("El endpoint GET api/sessions/current debe devolver la información del usuario desde la cookie.", async () => {
      const { _body } = await requester
        .get("api/sessions/current")
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(_body.payload.email).to.be.eql(mockUser.email);
      expect(_body.payload.password).to.be.eql(undefined);
    });
  });

  //PRODUCTS
  describe("Test de productos.", () => {
    const mockProduct = {
      title: "Alfajor grandote",
      description: "Doble y triple sabor",
      code: "DG561F4R",
      price: 300,
      stock: 96,
      category: ["comida"],
      thumbnails: [],
    };

    before(async function () {
      const { _body } = await requester
        .get("api/sessions/current")
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      mockProduct.owner = _body.payload.email;
    });

    //GET PRODUCTS
    it("El endpoint GET api/products debe devolver los productos con paginación.", async () => {
      const { _body } = await requester
        .get("api/products")
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);

      expect(_body.payload).to.have.property("docs");
      expect(_body.payload.docs).to.be.an("array");
    });

    //GET ONE PRODUCT
    it("El endpoint GET api/products/:pid debe devolver un solo producto.", async () => {
      const { _body } = await requester
        .get("api/products/63d927a518a0be60fbf003a4")
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(_body.payload._id).to.be.ok;
    });

    //ADD PROD
    it("El endpoint POST api/products debe poder crear un producto.", async () => {
      const { _body } = await requester
        .post("api/products")
        .send(mockProduct)
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(_body.payload._id).to.be.ok;
      expect(_body.payload.title).to.be.eql(mockProduct.title);

      mockProduct._id = _body.payload._id;
    });

    //MOD A PROD
    it("El endpoint PUT api/products/:pid debe modificar un producto existente.", async () => {
      const data = {
        description: "Descripción modificada.",
        stock: 65,
      };

      const { _body } = await requester
        .put(`api/products/${mockProduct._id}`)
        .send(data)
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(_body.payload.modifiedCount).to.be.ok.and.eql(1);
    });

    //DEL A PROD
    it("El endpoint DELETE api/products/:pid debe eliminar un producto.", async () => {
      const { _body } = await requester
        .delete(`api/products/${mockProduct._id}`)
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(_body.payload.deletedCount).to.be.ok.and.eql(1);
    });
  });

  //CARTS
  describe("Test de carts.", () => {
    let mockCart;
    const data = [
      { product: "63d927a518a0be60fbf003a4", quantity: 2 },
      { product: "63d927ff18a0be60fbf003a8", quantity: 2 },
    ];
    const pid = data[0].product;

    before(async function () {
      const { _body } = await requester
        .get("api/sessions/current")
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      mockCart = { _id: _body.payload.cart, products: [] };
    });

    //CREATE CART
    it("El endpoint POST api/carts debe crear un carrito con un arreglo de productos vacío.", async () => {
      const { _body } = await requester
        .post("api/carts")
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(_body.payload._id).to.be.ok;
      expect(_body.payload.products).to.be.deep.equal([]);
    });

    //MOD CART
    it("El endpoint PUT api/carts/:cid debe actualizar un carrito con un arreglo de productos.", async () => {
      const { _body } = await requester
        .put(`api/carts/${mockCart._id}`)
        .set("Cookie", [`${cookie.name}=${cookie.value}`])
        .send(data);
      expect(_body.payload.id).to.be.ok;
      expect(_body.payload.products).to.be.deep.equal(data);
    });

    //GET CART
    it("El endpoint GET api/carts/:cid debe obtener un carrito con sus productos.", async () => {
      const { _body } = await requester
        .get(`api/carts/${mockCart._id}`)
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(_body.payload._id).to.be.ok;
      expect(_body.payload.products).to.be.ok.and.an("array");
    });

    //DEL CART
    it("El endpoint DELETE api/carts/:cid debe vaciar el carrito.", async () => {
      const { _body } = await requester
        .delete(`api/carts/${mockCart._id}/`)
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(_body.payload.products).to.be.deep.equal([]);
    });

    //ADD PROD TO CART
    it("El endpoint POST api/carts/:cid/products/:pid debe agregar un producto a un carrito.", async () => {
      const { _body } = await requester
        .post(`api/carts/${mockCart._id}/products/${pid}`)
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(_body.payload.products[0].product).to.be.ok.and.deep.equal(pid);
    });

    //MOD QUANTITY
    it("El endpoint PUT api/carts/:cid/products/:pid debe actualizar la cantidad de un producto.", async () => {
      const { _body } = await requester
        .put(`api/carts/${mockCart._id}/products/${pid}`)
        .send({ quantity: 5 })
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(_body.payload.products[0].quantity).to.be.ok.and.deep.equal(5);
    });

    //DELL PROD FROM CART
    it("El endpoint DELETE api/carts/:cid/products/:pid debe eliminar un producto de un carrito.", async () => {
      const { _body } = await requester
        .delete(`api/carts/${mockCart._id}/products/${pid}`)
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(_body.payload.products).to.be.deep.equal([]);
    });

    //TICKET GEN
    it("El endpoint POST api/carts/:cid/purchase debe generar un ticket de compra.", async () => {
      await requester
        .post(`api/carts/${mockCart._id}/products/${pid}`)
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);

      const { _body } = await requester
        .post(`api/carts/${mockCart._id}/purchase`)
        .set("Cookie", [`${cookie.name}=${cookie.value}`]);
      expect(_body.payload._id).to.be.ok;
      expect(_body.payload.purchaser).to.be.eql(
        "usuariodeprueba@usuariodeprueba.com"
      );
    });
  });
});

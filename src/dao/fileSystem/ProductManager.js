import fs from "fs";

class ProductManager {
  constructor(filename) {
    this.filename = filename;
    this.format = "utf-8";
  }

  check = async (product) => {
    const empty = [];
    const products = await this.getProducts();

    const repeated = products.some((prod) => prod.code === product.code);

    if (repeated) {
      console.error(`${product.code} ya está en uso`);
      return false;
    }

    const prodFields = Object.entries(product);
    prodFields.forEach((value) => {
      if (!value[1]) empty.push(value[0]);
    });

    if (empty.length !== 0) {
      console.error("Por favor especificar los siguientes campos: ", empty);
      return false;
    }
    return true;
  };

  addProduct = async (obj) => {
    const id = await this.getNextID();
    const product = {
      id,
      ...obj,
      status: true,
    };

    if (await this.check(product)) {
      const products = await this.getProducts();

      products.push(product);

      this.saveProducts(products);

      return product;
    }
  };

  getProducts = async () => {
    return fs.promises
      .readFile(this.filename, this.format)
      .then((res) => {
        if (res) {
          const products = JSON.parse(res);
          return products;
        } else return [];
      })
      .catch((error) => {
        console.log("Error: ", error);
        return [];
      });
  };

  getNextID = async () => {
    const products = await this.getProducts();
    const count = products.length;
    if (count > 0) {
      const lastproduct = products[count - 1];
      const id = lastproduct.id + 1;
      return id;
    } else {
      return 1;
    }
  };

  getProductByID = async (id) => {
    const products = await this.getProducts();
    const prodFound = products.find((product) => product.id == id);
    if (prodFound == undefined) {
      console.log("Not Found");
    } else {
      return prodFound;
    }
  };

  saveProducts = (products) => {
    const prodToString = JSON.stringify(products);
    fs.promises.writeFile(this.filename, prodToString);
  };

  deleteProduct = async (id) => {
    const products = await this.getProducts();

    const prodID = () => products.some((prod) => prod.id === id);
    if (!prodID()) return console.log("Error el producto no existe.");

    const updatedProducts = products.filter((prod) => prod.id !== id);

    this.saveProducts(updatedProducts);
  };

  updateProduct = async (id, obj) => {
    const products = await this.getProducts();
    const prodToUpdate = products.findIndex((prod) => prod.id === id);

    products[prodToUpdate] = {
      ...products[prodToUpdate],
      ...obj,
      id: id,
    };

    this.saveProducts(products);
  };
}

export default ProductManager;

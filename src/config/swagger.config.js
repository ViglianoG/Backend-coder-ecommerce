import __dirname from "../utils.js";
import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Coder Ecommerce",
      description: "Backend coder e-commerce project.",
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`],
};

const specs = swaggerJSDoc(swaggerOptions);
export default specs;

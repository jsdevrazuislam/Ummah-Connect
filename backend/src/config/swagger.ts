import { Application } from "express";
import swaggerJsDoc, { Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";


const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Muslim Social API",
      version: "1.0.0",
      description: "API documentation for Muslim Social app",
    },
    servers: [
      {
        url: "http://localhost:8000/api/v1",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/docs/**/*.yaml"],
};


const swaggerSpec = swaggerJsDoc(options);

export default function swagger(app: Application) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true}));
}

require("dotenv").config();
const swaggerJsDoc = require("swagger-jsdoc");
const path = require("path");

const PORT = process.env.PORT || 8000;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation Zaporka project",
      version: "1.0.0",
      description: "Documentation for the backend APIs",
    },
    basePath: "/api/v1",
    servers: [
      // {
      //   url: ""
      // },
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, "../routes/*.js")],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;

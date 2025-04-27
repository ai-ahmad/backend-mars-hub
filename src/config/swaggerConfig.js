require("dotenv").config();
const swaggerJsDoc = require("swagger-jsdoc");
const path = require("path");

const PORT = process.env.PORT || 8000;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation Mars Hub",
      version: "1.0.1",
      description: "Documentation for the backend API",
    },
    basePath: "/api/v1",
    servers: [
      {
        url: "https://backend-mars-hub.onrender.com"
      },
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, "../routes/*.js")],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;

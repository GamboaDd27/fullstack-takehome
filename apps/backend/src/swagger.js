const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Morphy API",
      version: "1.0.0",
      description: "API documentation for Morphy's educational platform"
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local server"
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token in the format: Bearer YOUR_TOKEN"
        }
      }
    },
    security: [{ BearerAuth: [] }] // Apply security globally
  },
  apis: [path.join(__dirname, "routes/*.js")] // Ensure the correct path
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app) => {
  app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

  console.log("Swagger Docs available at http://localhost:5000/api/docs");
};

module.exports = swaggerDocs;

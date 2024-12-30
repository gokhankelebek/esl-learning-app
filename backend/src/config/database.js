const mongoose = require("mongoose");
const config = require("./config");
const { logger } = require("../middleware/logger");

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose
      .connect(config.mongodb.uri, config.mongodb.options)
      .then(() => {
        logger.info("Successfully connected to MongoDB");
      })
      .catch((error) => {
        logger.error("Error connecting to MongoDB:", error);
        process.exit(1);
      });

    mongoose.connection.on("error", (error) => {
      logger.error("MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Attempting to reconnect...");
      this.connect();
    });
  }

  disconnect() {
    mongoose.connection.close(() => {
      logger.info("MongoDB connection closed");
    });
  }
}

module.exports = new Database();

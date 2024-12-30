// Create a centralized error handler
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const error = {
    message: err.message || "Internal Server Error",
    status: err.status || 500,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(error.status).json({ error });
};

module.exports = errorHandler;

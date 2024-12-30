const responseHandler = (req, res, next) => {
  res.success = (data, message = "Success", statusCode = 200) => {
    res.status(statusCode).json({
      status: "success",
      message,
      data,
    });
  };

  res.error = (message, statusCode = 500, errors = null) => {
    const response = {
      status: "error",
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    res.status(statusCode).json(response);
  };

  next();
};

module.exports = responseHandler;

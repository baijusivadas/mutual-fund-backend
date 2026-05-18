const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data
  });
};

const sendError = (res, message = "Error", statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    status: "error",
    message,
    error: error?.message || error
  });
};

module.exports = {
  sendSuccess,
  sendError
};

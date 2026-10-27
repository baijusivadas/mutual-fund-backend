const injectModel = (modelName) => {
  return (req, res, next) => {
    req.model = modelName;
    next();
  };
};

module.exports = injectModel;

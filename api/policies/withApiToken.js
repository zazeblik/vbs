module.exports = function (req, res, next) {
  if (req.headers['x-api-token'] == sails.config.apiToken) {
    return next();
  } else {
    return res.forbidden();
  }
};

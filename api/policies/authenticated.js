module.exports = function (req, res, next) {
  if (req.session.User) {
    return next();
  } else {
    return res.forbidden();
  }
};

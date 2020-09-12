module.exports = function (req, res, next) {
  if (req.session.User.person) {
    return next();
  } else {
    return res.forbidden();
  }
};

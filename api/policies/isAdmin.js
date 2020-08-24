const Role = require("../../enums").Role;
module.exports = function (req, res, next) {
  if (req.session.User.role == Role.LocalAdmin) {
    return next();
  } else {
    return res.forbidden();
  }
};

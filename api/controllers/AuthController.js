module.exports = {
  login: function(req, res) {
    if (!req.param("login") || !req.param("password")) {
      return res.status(400).send("Необходимо указать логин и пароль!");
    }
    const login = req.param("login");
    const password = req.param("password");
    Users.findOne({ login: login }).populate('person').decrypt().exec(function(err, user) {
      if (err) {
        return res.status(500).send(err);
      } 
      if (!user) {
        return res
          .status(400)
          .send("Пользователь с такими логином не найден");
      }
      if (user.password != password) {
        return res
          .status(400)
          .send("Неверный пароль");
      }
      req.session.User = user;
      delete user.password;
      return res
        .status(200)
        .send(user);
    })
  },
  logout: function(req, res) {
    delete req.session.User
    return res.redirect('/')
  }
};

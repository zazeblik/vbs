const Role = require('../../enums').Role;
const cyrillicToTranslit = require('cyrillic-to-translit-js');

module.exports = {
  settings: async function (req, res){
    try {
      const instructors = await Instructors.find({provider: req.session.User.provider}).sort('name ASC');
      return res.send({ instructors });
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  authenticated: async (req, res) => {
    const user = await Users.findOne(req.session.User.id);
    if (!user) {
      return res.status(400).send("Авторизованный пользователь не найден");
    }
    return res.status(200).send(user);
  },
  edit: async function (req, res) {
    try {
      req.body.id = req.param("id");
      req.body.provider = req.session.User.provider;
      if (!req.body.instructor) {
        req.body.instructor = null;
      }
      await Users.update({id: req.param("id"), provider: req.session.User.provider}).set(req.body).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  create: async function (req, res) {
    try {
      req.body.provider = req.session.User.provider;
      await Users.create(req.body).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  delete: async function (req, res) {
    try {
      await Users.destroy({id: req.param("id"), provider: req.session.User.provider}).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  getPassword: async function (req, res) {
    try {
      const id = req.param("id");
      const user = await Users.findOne({ id: id, provider: req.session.User.provider }).decrypt();
      return res.send({
        data: user.password
      })
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  list: async function (req, res) {
    try {
      const sort = req.query.sort || "updatedAt DESC";
      const perPage = Number(req.query.perPage) || 10;
      let currentPage = Number(req.query.page) || 1;
      let query = {
        where: {
          login: { "contains": req.query.search || "" },
          provider: req.session.User.provider
        }
      };
      const total = await Users.count(query);
      const skip = (currentPage - 1) * perPage;
      query.skip = skip > total ? 0 : skip;
      currentPage = skip > total ? 1 : currentPage;
      let totalPages = Math.ceil(total / perPage);
      query.limit = perPage;
      query.sort = sort;
      
      let data = await Users.find(query).populate("instructor");
      // Делаю так чтобы избавиться от ненужных полей и инициализировать пароль заглушкой
      const dataJson = JSON.stringify(data);
      data = JSON.parse(dataJson);
      data.forEach(x => x.password = '***');

      return res.send({
        total: total,
        totalPages: totalPages,
        perPage: perPage,
        page: currentPage,
        data: data
      })
    } catch (err) {
      return res.badRequest(err.message);
    }
  }
};


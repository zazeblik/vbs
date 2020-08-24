module.exports = {
  settings: async function (req, res){
    try {
      const persons = await Persons.find();
      return res.send({ persons });
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
      await Users.update(req.param("id"), req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  create: async function (req, res) {
    try {
      await Users.create(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  delete: async function (req, res) {
    try {
      if (!req.param("id"))
        return res.badRequest();
      await Users.destroy(req.body).fetch();
      return res.ok();
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
          login: { "contains": req.query.search || "" }
        }
      };
      const total = await Users.count(query);
      const skip = (currentPage - 1) * perPage;
      query.skip = skip > total ? 0 : skip;
      currentPage = skip > total ? 1 : currentPage;
      let totalPages = Math.ceil(total / perPage);
      query.limit = perPage;
      query.sort = sort;
      const data = await Users.find(query).populate("person");
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


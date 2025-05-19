const GroupType = require('../../enums').GroupType
module.exports = {
  edit: async function (req, res) {
    try {
      req.body.id = req.param("id");
      req.body.provider = req.session.User.provider;
      await Instructors.update({id: req.param("id"), provider: req.session.User.provider}).set(req.body).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  create: async function (req, res) {
    try {
      req.body.provider = req.session.User.provider;
      await Instructors.create(req.body).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  delete: async function (req, res) {
    try {
      await Instructors.destroy({id: req.param("id"), provider: req.session.User.provider}).fetch();
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
          name: { "contains": req.query.search || "" },
          provider: req.session.User.provider
        }
      };
      const total = await Instructors.count(query);
      const skip = (currentPage - 1) * perPage;
      query.skip = skip > total ? 0 : skip;
      currentPage = skip > total ? 1 : currentPage;
      let totalPages = Math.ceil(total / perPage);
      query.limit = perPage;
      query.sort = sort;
      const data = await Instructors.find(query);
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


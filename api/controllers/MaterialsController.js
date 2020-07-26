module.exports = {
  edit: async function (req, res) {
    try {
      req.body.id = req.param("id");
      await Materials.update(req.param("id"), req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  create: async function (req, res) {
    try {
      await Materials.create(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  delete: async function (req, res) {
    try {
      if (!req.param("id"))
        return res.badRequest();
      await Materials.destroy(req.body).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  list: async function (req, res) {
    try {
      const sort = req.query.sort || "updatedAt DESC";
      const perPage = Number(req.query.perPage) || 10;
      let currentPage = Number(req.query.page) || 1;
      let query = {
        where: {
          name: { "contains": req.query.search || "" }
        }
      };
      const total = await Materials.count(query);
      const skip = (currentPage - 1) * perPage;
      query.skip = skip > total ? 0 : skip;
      currentPage = skip > total ? 1 : currentPage;
      let totalPages = Math.ceil(total / perPage);
      query.limit = perPage;
      query.sort = sort;
      const data = await Materials.find(query);
      return res.send({
        total: total,
        totalPages: totalPages,
        perPage: perPage,
        page: currentPage,
        data: data
      })
    } catch (err) {
      return res.badRequest();
    }
  }
};


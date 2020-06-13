module.exports = {
  settings: async function (req, res){
    try {
      const persons = await Persons.find();
      const groups = await Groups.find();
      return res.send({ persons, groups });
    } catch (error) {
      return res.badRequest();
    }
  },
  edit: async function (req, res){
    try {
      req.body.id = req.param("id");
      await ArchivePersons.update(req.param("id"), req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  create: async function (req, res){
    try {
      await ArchivePersons.create(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  delete: async function (req, res) {
    try {
      if (!req.param("id"))
        return res.badRequest();
      await ArchivePersons.destroy(req.body).fetch();
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
      const searchQuery = {
        name: { "contains": req.query.search || "" }
      };
      const persons = await Persons.find(searchQuery);
      let query = {
        where: {
          person: persons.map(p => p.id)
        }
      };
      const total = await ArchivePersons.count(query);
      const skip = (currentPage - 1) * perPage;
      query.skip = skip > total ? 0 : skip;
      currentPage = skip > total ? 1 : currentPage;
      let totalPages = Math.ceil(total / perPage);
      query.limit = perPage;
      query.sort = sort;
      const data = await ArchivePersons.find(query).populate('person').populate('group');
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


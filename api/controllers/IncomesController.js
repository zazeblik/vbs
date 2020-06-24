module.exports = {
  create: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      await Incomes.create(req.body);
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  delete: async function (req, res) {
    try {
      await Incomes.destroy(req.param("id")).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  edit: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      req.body.id = req.param("id");
      await Incomes.update(req.param("id"), req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
};


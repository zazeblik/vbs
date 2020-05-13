module.exports = {
  delete: async function (req, res) {
    try {
      await Events.destroy(req.param("id"))
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  edit: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      await Events.update(req.param("id"), req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  create: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      await Events.create(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  addVisitor: async function (req, res) {
    if (!req.param("id")) return res.status(400).send({
      message: "id не указан",
      success: false
    });
    if (!req.param("visitors")) return res.status(400).send({
      message: "visitors не указан",
      success: false
    });
    try {
      const id = Number(req.param("id"));
      const visitors = req.param("visitors");
      await Events.addToCollection(id, "visitors").members(visitors);
      await Events.update(id, { updater: req.session.User.id })
      return res.send({
        success: true
      });
    } catch (error) {
      return res.badRequest();
    }
  },
  removeVisitor: async function (req, res) {
    if (!req.param("id")) return res.status(400).send({
      message: "id не указан",
      success: false
    });
    if (!req.param("visitors")) return res.status(400).send({
      message: "visitors не указан",
      success: false
    });
    try {
      const id = Number(req.param("id"));
      const visitors = req.param("visitors");
      await Events.removeFromCollection(id, "visitors").members(visitors);
      await Events.update(id, { updater: req.session.User.id })
      return res.send({
        success: true
      });
    } catch (error) {
      return res.badRequest();
    }
  },
};


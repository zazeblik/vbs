module.exports = {
  settings: async function (req, res){
    try {
      const persons = await Persons.find();
      const groups = await Groups.find().populate("members", {select: ["id"]});
      groups.forEach(group => {
        group.members = group.members.map(m => m.id);  
      });
      
      return res.send({ persons, groups });
    } catch (error) {
      return res.badRequest();
    }
  },
  delete: async function (req, res) {
    try {
      await Payments.destroy(req.param("id"))
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  edit: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      await Payments.update(req.param("id"), req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  create: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      await Payments.create(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
};


module.exports = {
  get: async function (req, res){
    const settings = await Settings.findOne({provider: req.session.User.provider});
    return res.send(settings);
  },
  update: async function (req, res){
    try {
      await Settings.update({provider: req.session.User.provider}).set(req.body).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
};


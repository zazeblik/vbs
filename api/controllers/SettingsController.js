module.exports = {
  get: async function (req, res){
    const settings = await Settings.findOne(1);
    return res.send(settings);
  },
  update: async function (req, res){
    try {
      await Settings.update(1, req.body);
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
};


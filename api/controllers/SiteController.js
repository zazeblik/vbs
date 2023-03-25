const path = require('path');
const fs = require('fs');
const PersonsController = require('./PersonsController');

module.exports = {
  uploads: async function (req, res) {
    let filename = req.params[0];
    if (!filename) return res.notFound();
    const file = path.resolve(sails.config.appPath, 'uploads'  + filename);
    if (fs.existsSync(file)) {
      let filestream = fs.createReadStream(file);
      return filestream.pipe(res);
    } else {
      return res.notFound();
    }
  },
  update: async function (req, res) {
    try {
      await Settings.update({provider: req.session.User.provider}).set(req.body);
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  settings: async function (req, res) {
    const settings = await Settings.findOne({provider: req.session.User.provider});
    return res.send(settings);
  },
};


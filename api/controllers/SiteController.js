const path = require('path');
const fs = require('fs');

module.exports = {
  upload: function (req, res) {
    try {
      const filename = new Date().getTime() + '_' + req.param('name');
      const file = req.file('file');
      if (req.method == "POST" && file && filename) {
        file.upload({
          saveAs: filename,
          dirname: path.resolve(sails.config.appPath, 'uploads')
        }, function whenDone(err, uploadedFiles) {
          if (err) {
            return res.negotiate(err);
          }
          if (uploadedFiles.length === 0) {
            return res.badRequest('No file was uploaded');
          }
          return res.ok({
            result: 'success',
            url: '/site/uploads/' + filename
          })
        })
      } else {
        return res.badRequest("Need POST with file and name parameters")
      }
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
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
      await Settings.update(1, req.body);
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  settings: async function (req, res) {
    const settings = await Settings.findOne(1);
    return res.send(settings);
  }
};


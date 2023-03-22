const path = require('path');

module.exports = {
  upload: function (req, res) {
    try {
      const file = req.file('file');
      let pathToSave = req.param('pathToSave') || 'uploads';
      const name = req.param('name');
      const filename = `${new Date().getTime()}_${name}`;
      if (req.method == "POST" && file && filename) {
        file.upload({
          saveAs: pathToSave != 'uploads' ? name : filename,
          dirname: path.resolve(sails.config.appPath, pathToSave)
        }, function whenDone(err, uploadedFiles) {
          if (err) {
            return res.negotiate(err);
          }
          if (uploadedFiles.length === 0) {
            return res.badRequest('No file was uploaded');
          }
          return res.ok({
            result: 'success'
          })
        })
      } else {
        return res.badRequest("Need POST with file and name parameters")
      }
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
};


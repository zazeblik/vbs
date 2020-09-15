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
  edit: async function (req, res) {
    try {
      req.body.id = req.param("id");
      await Files.update(req.param("id"), req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  create: async function (req, res) {
    try {
      await Files.create(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  delete: async function (req, res) {
    try {
      if (!req.param("id"))
        return res.badRequest();
      await Files.destroy(req.body).fetch();
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
      const total = await Files.count(query);
      const skip = (currentPage - 1) * perPage;
      query.skip = skip > total ? 0 : skip;
      currentPage = skip > total ? 1 : currentPage;
      let totalPages = Math.ceil(total / perPage);
      query.limit = perPage;
      query.sort = sort;
      const data = await Files.find(query);
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


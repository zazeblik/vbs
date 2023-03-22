const cyrillicToTranslit = require('cyrillic-to-translit-js');
const customValuesResolver =  require('../services/PersonCustomValuesResolver'); 
const ExcelService = require('../services/ExcelService');

module.exports = {
  import: async function(req, res) {
    if (!req.file('file')){
      return res.badRequest('file not found');
    }
    req.file('file').upload({
      saveAs: 'import.xlsx',
      dirname: require('path').resolve(sails.config.appPath, 'uploads')
    }, 
    async function (err, uploadedFiles) {
      if (err) {
        return res.negotiate(err);
      }
      if (uploadedFiles.length === 0) {
        return res.badRequest('No file was uploaded');
      }
      try {
        const persons = await ExcelService.parsePersons(uploadedFiles[0].fd, req.session.User.id)
        await Persons.createEach(persons);
        return res.ok();
      } catch (err) {
        return res.badRequest(err.message);
      }
    })
  },
  export: async function(req, res) {
    try {
      const wbbuf = await ExcelService.getPersons();
      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
      return res.end( wbbuf );
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  fields: async function (req, res){
    try {
      const fields = await PersonCustomFields.find();
      return res.send(fields);
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  setFields: async function (req, res){
    try {
      const rawFields = req.body;
      if (!rawFields.length) {
        return res.badRequest("Не указан массив полей");
      }
      const newFields = rawFields.map(x => {
        return {
          id: x.id,
          label: x.label,
          name: cyrillicToTranslit().transform(x.label, "_")
        }
      });
      const newFieldsIds = newFields.filter(x => x.id).map(x => x.id); 
      const fieldsToCreate = newFields.filter(x => !x.id);
      const currentFields = await PersonCustomFields.find();
      const currentFieldsIds = currentFields.map(x => x.id);
      const idsToDelete = currentFieldsIds.filter(x => !newFieldsIds.includes(x));
      const idsToUpdate = currentFieldsIds.filter(x => newFieldsIds.includes(x));
      const fieldsToUpdate = newFields.filter(x => idsToUpdate.includes(x.id));
      await PersonCustomFields.createEach(fieldsToCreate);
      if (idsToDelete.length) await PersonCustomFields.destroy(idsToDelete).fetch();
      fieldsToUpdate.forEach(async x => {
        await PersonCustomFields.update({id: x.id}).set({id: x.id, label: x.label, name: x.name})
      });
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  edit: async function (req, res){
    try {
      req.body.updater = req.session.User.id;
      const id = req.param("id");
      req.body.id = id;
      const personToResolve = { ...req.body };
      await Persons.update(id, req.body);
      await customValuesResolver.resolve(personToResolve);
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  create: async function (req, res){
    try {
      req.body.updater = req.session.User.id;
      const personToResolve = { ...req.body };
      const person = await Persons.create(req.body).fetch();
      personToResolve.id = person.id;
      await customValuesResolver.resolve(personToResolve);
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  delete: async function (req, res) {
    try {
      if (!req.param("id"))
        return res.badRequest();
      await Persons.destroy(req.body);
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
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
      const total = await Persons.count(query);
      const skip = (currentPage - 1) * perPage;
      query.skip = skip > total ? 0 : skip;
      currentPage = skip > total ? 1 : currentPage;
      let totalPages = Math.ceil(total / perPage);
      query.limit = perPage;
      query.sort = sort;
      const data = await Persons.find(query).populate('updater');
      const fields = await PersonCustomFields.find();
      const customValues = await PersonCustomValues.find({person: data.map(x => x.id)});
      data.forEach(person => {
        fields.forEach(field => {
          const customValue = customValues.find(x => x.person == person.id && x.field == field.id);
          person[field.name] = customValue ? customValue.value : null;
        });
      });
      return res.send({
        total: total,
        totalPages: totalPages,
        perPage: perPage,
        page: currentPage,
        data: data
      })
    } catch (err) {
      return res.badRequest(err.message);
    }
  }
};


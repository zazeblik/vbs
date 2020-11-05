const cyrillicToTranslit = require('cyrillic-to-translit-js');

module.exports = {
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
      if (idsToDelete.length) await PersonCustomFields.destroy(idsToDelete);
      fieldsToUpdate.forEach(async x => {
        await PersonCustomFields.update({id: x.id}).set({label: x.label, name: x.name})
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
      const valuesToCreate = [];
      const valuesToUpdate = [];
      const fields = await PersonCustomFields.find();
      const currentValues = await PersonCustomValues.find({person: id});
      fields.forEach(x => {
        const currentValue = currentValues.find(cv => cv.field == x.id);
        if (currentValue){
          valuesToUpdate.push({
            id: currentValue.id,
            value: req.body[x.name]
          })
        } else {
          valuesToCreate.push({
            field: x.id,
            person: id,
            value: req.body[x.name]
          })
        }
      });
      await Persons.update(id, req.body);
      await PersonCustomValues.createEach(valuesToCreate);
      valuesToUpdate.forEach(async x => {
        await PersonCustomValues.update({id: x.id}).set({value: x.value})
      });
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  create: async function (req, res){
    try {
      req.body.updater = req.session.User.id;
      const fields = await PersonCustomFields.find();
      const customValues = [];
      var data = req.body;
      fields.forEach(field => {
        if (data[field.name]) {
          customValues.push({
            field: field.id,
            value: data[field.name]
          });
          delete data[field.name];
        }
      });
      const person = await Persons.create(data).fetch();
      await PersonCustomValues.createEach(customValues.map(x => {return { field: x.field, value: x.value, person: person.id}}));
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  delete: async function (req, res) {
    try {
      if (!req.param("id"))
        return res.badRequest();
      await Persons.destroy(req.body).fetch();
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
      return res.badRequest();
    }
  }
};


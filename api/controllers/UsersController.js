const Role = require('../../enums').Role;
const cyrillicToTranslit = require('cyrillic-to-translit-js');

module.exports = {
  settings: async function (req, res){
    try {
      const persons = await Persons.find().sort('name ASC');
      return res.send({ persons });
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  authenticated: async (req, res) => {
    const user = await Users.findOne(req.session.User.id);
    if (!user) {
      return res.status(400).send("Авторизованный пользователь не найден");
    }
    return res.status(200).send(user);
  },
  edit: async function (req, res) {
    try {
      req.body.id = req.param("id");
      await Users.update(req.param("id"), req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  create: async function (req, res) {
    try {
      await Users.create(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  delete: async function (req, res) {
    try {
      if (!req.param("id"))
        return res.badRequest();
      await Users.destroy(req.body).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  getPassword: async function (req, res) {
    try {
      const id = req.param("id");
      const user = await Users.findOne({ id: id }).decrypt();
      return res.send({
        data: user.password
      })
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
          login: { "contains": req.query.search || "" }
        }
      };
      const total = await Users.count(query);
      const skip = (currentPage - 1) * perPage;
      query.skip = skip > total ? 0 : skip;
      currentPage = skip > total ? 1 : currentPage;
      let totalPages = Math.ceil(total / perPage);
      query.limit = perPage;
      query.sort = sort;
      
      let data = await Users.find(query).populate("person");
      // Делаю так чтобы избавиться от ненужных полей и инициализировать пароль заглушкой
      const dataJson = JSON.stringify(data);
      data = JSON.parse(dataJson);
      data.forEach(x => x.password = '***');

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
  },
  generate: async function( req, res ) {
    try {
      const filledUsers = await Users.find({person: {'!=': null }})
      const usedPersonIds = [...new Set(filledUsers.map(x => x.person))];
      const notFilledPersons = await Persons.find({id: {'!=': usedPersonIds}})
      const accounts = [];
      for (const person of notFilledPersons) {
        const personName = person.name.toLowerCase().replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '');
        const login = cyrillicToTranslit().transform(`${personName} ${person.id}`, "_");
        const password =  login.length < 8
          ? `${login}_${Date.now()}`
          : login;
        accounts.push( {
          role: Role.User,
          login: login,
          password: password,
          person: person.id
        } )
      }
      await Users.createEach(accounts);
      return res.ok();
    }  catch (err) {
      return res.badRequest(err.message);
    }
  }
};


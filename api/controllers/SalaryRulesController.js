const DateRangeHelper =  require('../utils/DateRangeHelper');
const SalaryCalculationService = require('../services/SalaryCalculationService');


module.exports = {
  settings: async function (req, res) {
    try {
      const persons = await Persons.find({ select: ["id", "name"] });
      const groups = await Groups.find({ hidden: false });
      const instructorIdsRaw = await Events
        .getDatastore()
        .sendNativeQuery(`select distinct instructor from vbs.events as e 
                        where e.group in (select id from vbs.groups where hidden=false)`);
      const instructorIds = instructorIdsRaw.rows.map(r => r.instructor);
      const defaultInstructorIds = [...new Set(groups.map(g => g.defaultInstructor))];
      const instructors = persons.filter(p => instructorIds.includes(p.id));
      defaultInstructorIds.forEach(id => {
        if (!instructorIds.includes(id)) {
          instructors.push(persons.find(p => p.id == id));
        }
      });
      return res.send({ groups, instructors });
    } catch (error) {
      return res.badRequest();
    }
  },
  edit: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      req.body.id = req.param("id");
      await SalaryRules.update(req.param("id"), req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  create: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      await SalaryRules.create(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  delete: async function (req, res) {
    try {
      if (!req.param("id"))
        return res
          .status(400)
          .send(err);
      await SalaryRules.destroy(req.body).fetch();
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
      let query = {};
      const total = await SalaryRules.count(query);
      const skip = (currentPage - 1) * perPage;
      query.skip = skip > total ? 0 : skip;
      currentPage = skip > total ? 1 : currentPage;
      let totalPages = Math.ceil(total / perPage);
      query.limit = perPage;
      query.sort = sort;
      const data = await SalaryRules.find(query)
        .populate("instructor")
        .populate("group")
        .populate("updater");
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
  },
  calculations: async function (req, res) {
    try {
      const serviceResult = [{
        instructor: "Николаев Роман",
        types: [
          {
            name: "Общие",
            groups: [
              {
                name: "Дети 4 года",
                eventsCount: 7,
                ruleDescription: "100 рублей за занятие",
                sum: 700
              },
              {
                name: "Дети 5 лет",
                eventsCount: 6,
                ruleDescription: "50% за месяц",
                sum: 750
              }
            ],
            totalSum: 1450
          },
          {
            name: "Индивидуальные",
            groups: [
              {
                name: "Егошин - Карманова",
                eventsCount: 4,
                ruleDescription: "50% за занятие",
                sum: 1000
              },
              {
                name: "Таланов - Таланова",
                eventsCount: 3,
                ruleDescription: "40% за занятие",
                sum: 1200
              }
            ],
            totalSum: 2200
          }
        ],
        totalSum: 3650
      }];
      return res.ok(serviceResult);
    } catch (err) {
      return res.badRequest();
    }
  }
};


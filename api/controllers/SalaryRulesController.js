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
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  edit: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      req.body.id = req.param("id");
      await SalaryRules.update(req.param("id"), req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  create: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      await SalaryRules.create(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  delete: async function (req, res) {
    try {
      await SalaryRules.destroy(req.body)
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
      return res.badRequest(err.message);
    }
  },
  calculations: async function (req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (!req.param("month")) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = DateRangeHelper.GetMonthDateRange(year, month);
      const serviceResult = await SalaryCalculationService.calculateSalaries(monthDateRange);
      return res.ok(serviceResult);
    } catch (err) {
      return res.badRequest(err.message);
    }
  }
};


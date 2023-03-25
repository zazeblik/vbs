const DateRangeHelper =  require('../utils/DateRangeHelper');
const SalaryCalculationService = require('../services/SalaryCalculationService');
const GroupType = require('../../enums').GroupType;
const Excel = require('exceljs');

module.exports = {
  settings: async function (req, res) {
    try {
      const persons = await Persons.find({ select: ["id", "name"], where: { provider: req.session.User.provider } });
      const groups = await Groups.find({ hidden: false, provider: req.session.User.provider });
      const instructorIdsRaw = await Events
        .getDatastore()
        .sendNativeQuery(`
          select distinct instructor from vbs.events as e 
          where e.group in (select id from vbs.groups where hidden=false and provider=${req.session.User.provider})
        `);
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
      req.body.provider = req.session.User.provider;
      req.body.id = req.param("id");
      await SalaryRules.update({id: req.param("id"), provider: req.session.User.provider}).set(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  create: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      req.body.provider = req.session.User.provider;
      await SalaryRules.create(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  delete: async function (req, res) {
    try {
      await SalaryRules.destroy({id: req.param("id"), provider: req.session.User.provider});
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
        where: { provider: req.session.User.provider }
      };
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
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = DateRangeHelper.GetMonthDateRange(year, month);
      const serviceResult = await SalaryCalculationService.calculateSalaries(monthDateRange, req.session.User.provider);
      return res.ok(serviceResult);
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  exportData: async function(req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    try {
      const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile('api/templates/salaries.xlsx');
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = DateRangeHelper.GetMonthDateRange(year, month);
      let sheet = workbook.worksheets[0];
      const serviceResults = await SalaryCalculationService.calculateSalaries(monthDateRange, req.session.User.provider);
      const results = [];
      let totalSum = 0;
      serviceResults.forEach(r => {
        r.types.forEach((t, ti) => {
          t.groups.forEach((g, gi) => {
            results.push({
              name: r.instructor,
              type: t.groupType == GroupType.General ? "Общие" : "Индивидуальные",
              group: g.name,
              eventsCount: g.eventsCount,
              rule: SalaryCalculationService.getRule(g),
              groupSum: g.sum,
              typeSum: gi == 0 ? t.totalSum : null,
              totalSum: ti == 0 && gi == 0 ? r.totalSum : null
            })
          })
        })
        totalSum += r.totalSum;
      });
      results.forEach((r, i) => {
        sheet.getRow(i+3).values = [r.name, r.type, r.group, r.eventsCount, r.rule, r.groupSum, r.typeSum, r.totalSum];
      })
      var totalCell =sheet.getCell(`H${results.length+3}`); 
      totalCell.value = { 'richText': [{'font': {'bold': true}, 'text': 'Итого: '+totalSum}]};
      totalCell.alignment = { horizontal: 'right' };
      const wbbuf = await workbook.xlsx.writeBuffer();
      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
      return res.end( wbbuf );
    } catch (err) {
      return res.badRequest(err.message);
    }
  }
};


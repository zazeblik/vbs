const ExcelService = require('../services/ExcelService');
module.exports = {
  export: async function(req, res) {
    if (!req.param("fromDate")) return res.status(400).send("fromDate не указан");
    if (!req.param("toDate")) return res.status(400).send("toDate не указан");
    try {
      const fromDate = Number(req.param("fromDate"));
      const toDate = Number(req.param("toDate"));
      const wbbuf = await ExcelService.getIncomes(fromDate, toDate);
      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
      return res.end( wbbuf );
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  report: async function (req, res) {
    if (!req.param("fromDate")) return res.status(400).send("fromDate не указан");
    if (!req.param("toDate")) return res.status(400).send("toDate не указан");
    try {
      const fromDate = Number(req.param("fromDate"));
      const toDate = Number(req.param("toDate"));
      const incomes = await Incomes.find({createdAt: {">=": fromDate, "<=": toDate}}).populate('person');
      return res.send(incomes);
    } catch (err) {
      return res.badRequest();
    }
  },
  create: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      await Incomes.create(req.body);
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  delete: async function (req, res) {
    try {
      await Incomes.destroy(req.param("id")).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  edit: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      req.body.id = req.param("id");
      await Incomes.update(req.param("id"), req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
};


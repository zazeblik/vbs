const DateRangeHelper =  require('../utils/DateRangeHelper');
const DashboardService = require('../services/DashboardService');
const Excel = require('exceljs');

module.exports = {
  exportVisits: async function(req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (!req.param("month")) return res.status(400).send("month не указан");
    try {
      const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile('api/templates/visits.xlsx');
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = DateRangeHelper.GetMonthDateRange(year, month);
      let sheet = workbook.worksheets[0];
      const groups = await Groups.find({ hidden: false });
      const groupIds = groups.map(g => g.id);
      const events = await Events
        .find({ group: groupIds, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
        .sort("startsAt ASC")
        .populate("visitors")
        .populate("group");
      let visits = DashboardService.getVisits(events);
      visits.forEach((v, i) => {
        sheet.getCell(`A${i+2}`).value = v.name;
        sheet.getCell(`B${i+2}`).value = v.generalsCount;
        sheet.getCell(`C${i+2}`).value = v.personalsCount;
        sheet.getCell(`D${i+2}`).value = v.total;
      });
      const wbbuf = await workbook.xlsx.writeBuffer();
      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
      return res.end( wbbuf );
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  exportInstructors: async function(req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (!req.param("month")) return res.status(400).send("month не указан");
    try {
      const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile('api/templates/instructors.xlsx');
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = DateRangeHelper.GetMonthDateRange(year, month);
      let sheet = workbook.worksheets[0];
      const groups = await Groups.find({ hidden: false });
      const groupIds = groups.map(g => g.id);
      const events = await Events
        .find({ group: groupIds, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
        .sort("startsAt ASC")
        .populate("instructor")
        .populate("group");
      let results = DashboardService.getInstructors(events);
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        sheet.getCell(`A${i+2}`).value = r.name;
        sheet.getCell(`B${i+2}`).value = r.generalsCount;
        sheet.getCell(`C${i+2}`).value = r.personalsCount;
        sheet.getCell(`D${i+2}`).value = r.total;
      }
      const wbbuf = await workbook.xlsx.writeBuffer();
      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
      return res.end( wbbuf );
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  exportPayments: async function(req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (!req.param("month")) return res.status(400).send("month не указан");
    try {
      const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile('api/templates/payments.xlsx');
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = DateRangeHelper.GetMonthDateRange(year, month);
      let sheet = workbook.worksheets[0];
      const groups = await Groups.find({ hidden: false });
      const groupIds = groups.map(g => g.id);
      const events = await Events
        .find({ group: groupIds, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
        .sort("startsAt ASC")
        .populate("payments");
      let paymentIds = [];
      events.forEach(e => {
        e.payments.forEach(p => {
          if (paymentIds.includes(p.id)) return;
          paymentIds.push(p.id);
        })
      })
      const payments = await Payments.find({id: paymentIds}).populate('person');
      const incomes = await Incomes
        .find({ updatedAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() }})
        .populate('person');
      let results = DashboardService.getTransactionSums(payments, incomes);
      results.forEach((r, i) => {
        sheet.getCell(`A${i+2}`).value = r.name;
        sheet.getCell(`B${i+2}`).value = r.paymentsSum;
        sheet.getCell(`C${i+2}`).value = r.incomesSum;
      });
      const wbbuf = await workbook.xlsx.writeBuffer();
      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
      return res.end( wbbuf );
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  exportTotals: async function(req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (!req.param("month")) return res.status(400).send("month не указан");
    try {
      const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile('api/templates/totals.xlsx');
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = DateRangeHelper.GetMonthDateRange(year, month);
      let sheet = workbook.worksheets[0];
      const groups = await Groups.find({ hidden: false });
      const groupIds = groups.map(g => g.id);
      const events = await Events
        .find({ group: groupIds, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
        .sort("startsAt ASC")
        .populate("visitors")
        .populate("payments")
        .populate("group");
      let results = DashboardService.getTotals(events);
      results.forEach((r, i) => {
        sheet.getCell(`A${i+2}`).value = r.group;
        sheet.getCell(`B${i+2}`).value = r.eventsTotal;
        sheet.getCell(`C${i+2}`).value = r.visitsTotal;
        sheet.getCell(`D${i+2}`).value = r.paymentsTotal;
        sheet.getCell(`E${i+2}`).value = r.paymentsTotalSum;
      });
      sheet.getCell(`A${results.length+2}`).value = {'richText': [{'font': {'bold': true}, 'text': 'Итого:'}]};
      sheet.getCell(`B${results.length+2}`).value = {'richText': [{'font': {'bold': true}, 'text': results.map(x => x.eventsTotal).reduce((a, b) => a + b, 0)}]};
      sheet.getCell(`C${results.length+2}`).value = {'richText': [{'font': {'bold': true}, 'text': results.map(x => x.visitsTotal).reduce((a, b) => a + b, 0)}]};
      sheet.getCell(`D${results.length+2}`).value = {'richText': [{'font': {'bold': true}, 'text': results.map(x => x.paymentsTotal).reduce((a, b) => a + b, 0)}]};
      sheet.getCell(`E${results.length+2}`).value = {'richText': [{'font': {'bold': true}, 'text': results.map(x => x.paymentsTotalSum).reduce((a, b) => a + b, 0)}]};
      sheet.getCell(`B${results.length+2}`).alignment = { horizontal: 'right' };
      sheet.getCell(`C${results.length+2}`).alignment = { horizontal: 'right' };
      sheet.getCell(`D${results.length+2}`).alignment = { horizontal: 'right' };
      sheet.getCell(`E${results.length+2}`).alignment = { horizontal: 'right' };
      const wbbuf = await workbook.xlsx.writeBuffer();
      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
      return res.end( wbbuf );
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  birthdays: async function (req, res) {
    try {
      const birthdaysRaw = await Persons
        .getDatastore()
        .sendNativeQuery(`select name, birthday
          FROM vbs.persons
          WHERE DATE_FORMAT(FROM_UNIXTIME(birthday * 0.001 + 3600),'%m-%d') = DATE_FORMAT(NOW(),'%m-%d')`);
      const birthdays = birthdaysRaw.rows;
      return res.send(birthdays);
    } catch (error) {
      return res.badRequest();
    }
  },
  monthInfo: async function (req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (!req.param("month")) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = DateRangeHelper.GetMonthDateRange(year, month);
      const groups = await Groups.find({ hidden: false });
      const groupIds = groups.map(g => g.id);
      const events = await Events
        .find({ group: groupIds, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
        .sort("startsAt ASC")
        .populate("visitors")
        .populate("payments")
        .populate("instructor")
        .populate("group")
        .populate("place");
      let paymentIds = [];
      events.forEach(e => {
        e.payments.forEach(p => {
          if (paymentIds.includes(p.id)) return;
          paymentIds.push(p.id);
        })
      })
      const payments = await Payments.find({id: paymentIds}).populate('person');
      const incomes = await Incomes
        .find({ updatedAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() }})
        .populate('person');
      const visits = DashboardService.getVisits(events);
      const instructors = DashboardService.getInstructors(events);
      const transactionSums = DashboardService.getTransactionSums(payments, incomes);
      const totals = DashboardService.getTotals(events);
      return res.send({ visits, instructors, transactionSums, totals, events });
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  createMonthEvents: async function(req, res){
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (!req.param("month")) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const currentDate = new Date();
      const isCurrentMonth = currentDate.getFullYear() == year && currentDate.getMonth() == month;
      const startDate = new Date(year, month);
      await sails.helpers.eventsGenerate(isCurrentMonth ? Date.now() : startDate.getTime());
      return res.ok();
    }  catch (err) {
      return res.badRequest(err.message);
    }
  }
};


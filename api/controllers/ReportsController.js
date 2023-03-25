const ExcelService = require('../services/ExcelService');
const ReportsService = require('../services/ReportsService');
const GroupsService = require('../services/GroupsService');
const DateRangeHelper =  require('../utils/DateRangeHelper');

module.exports = {
  visits: async function (req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = DateRangeHelper.GetMonthDateRange(year, month);
      const groups = await Groups.find({ hidden: false, provider: req.session.User.provider });
      const groupIds = groups.map(g => g.id);
      const events = await Events
        .find({ 
          group: groupIds, 
          startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() }, 
          provider: req.session.User.provider
        })
        .sort("startsAt ASC")
        .populate("visitors")
        .populate("group");
      const visits = ReportsService.getVisits(events);
      return res.send({ visits });
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  transactions: async function (req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = DateRangeHelper.GetMonthDateRange(year, month);
      const groups = await Groups.find({ hidden: false, provider: req.session.User.provider });
      const groupIds = groups.map(g => g.id);
      const events = await Events
        .find({ 
          group: groupIds, 
          startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() }, 
          provider: req.session.User.provider
        })
        .sort("startsAt ASC")
        .populate("payments")
        .populate("group");
      let paymentIds = [];
      events.forEach(e => {
        e.payments.forEach(p => {
          if (paymentIds.includes(p.id)) return;
          paymentIds.push(p.id);
        })
      })
      const payments = await Payments.find({id: paymentIds, provider: req.session.User.provider}).populate('person');
      const incomes = await Incomes
        .find({ updatedAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() }, provider: req.session.User.provider})
        .populate('person');
      const transactionSums = ReportsService.getTransactionSums(payments, incomes);
      return res.send({ transactionSums });
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  instructors: async function (req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = DateRangeHelper.GetMonthDateRange(year, month);
      const groups = await Groups.find({ hidden: false });
      const groupIds = groups.map(g => g.id);
      const events = await Events
        .find({ 
          group: groupIds, 
          startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() }, 
          provider: req.session.User.provider 
        })
        .sort("startsAt ASC")
        .populate("instructor")
        .populate("group");
      const instructors = ReportsService.getInstructors(events);
      return res.send({ instructors });
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  totals: async function (req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = DateRangeHelper.GetMonthDateRange(year, month);
      const groups = await Groups.find({ hidden: false, provider: req.session.User.provider });
      const groupIds = groups.map(g => g.id);
      const events = await Events
        .find({ 
          group: groupIds, 
          startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() },
          provider: req.session.User.provider
        })
        .sort("startsAt ASC")
        .populate("visitors")
        .populate("payments")
        .populate("group");
      const totals = ReportsService.getTotals(events);
      return res.send({ totals, events });
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  activity: async function (req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    if (req.param("activity") == undefined) return res.status(400).send("activity не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const activity = Number(req.param("activity"));
      const monthDateRange = DateRangeHelper.GetMonthDateRange(year, month);
      const groups = await Groups.find({ hidden: false, provider: req.session.User.provider }).populate("members");
      const groupIds = groups.map(g => g.id);
      const groupedActions = await GroupsService.getGroupedActions(groupIds, monthDateRange.end.valueOf(), req.session.User.provider);
      const persons = await ReportsService.getActivityPersons(groupedActions, groups, activity);
      return res.send({ persons });
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  exportVisits: async function(req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const wbbuf = await ExcelService.getVisits(year, month, req.session.User.provider);
      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
      return res.end( wbbuf );
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  exportInstructors: async function(req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const wbbuf = await ExcelService.getInstructors(year, month, req.session.User.provider);
      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
      return res.end( wbbuf );
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  exportTransactions: async function(req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const wbbuf = await ExcelService.getPayments(year, month, req.session.User.provider);
      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
      return res.end( wbbuf );
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  exportTotals: async function(req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const wbbuf = await ExcelService.getTotals(year, month, req.session.User.provider);
      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
      return res.end( wbbuf );
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  exportActivity: async function(req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    if (req.param("activity") == undefined) return res.status(400).send("activity не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const activity = Number(req.param("activity"));
      const wbbuf = await ExcelService.getActivity(year, month, activity, req.session.User.provider);
      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
      return res.end( wbbuf );
    } catch (err) {
      return res.badRequest(err.message);
    }
  }
};


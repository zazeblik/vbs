const PaymentsService = require('../services/PaymentsService');

module.exports = {
  selfSettings: async function (req, res){
    try {
      const settings = await PaymentsService.getPaymentSettings(req.session.User.person);
      return res.send(settings);
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
  settings: async function (req, res){
    try {
      const settings = await PaymentsService.getPaymentSettings();
      return res.send(settings);
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
  groupUnpayedEvents: async function (req, res){
    if (!req.param("person")) return res.status(400).send("person не указан");
    if (!req.param("group")) return res.status(400).send("group не указан");
    if (!req.param("month")) return res.status(400).send("month не указан");
    if (!req.param("year")) return res.status(400).send("year не указан");
    const person = Number(req.param("person"));
    const group = Number(req.param("group"));
    const month = Number(req.param("month"));
    const year = Number(req.param("year"));
    try {
      const result = await PaymentsService.getGroupUnpayedEvents(year, month, group, person);
      return res.send(result);
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
  selfGroupUnpayedEvents: async function (req, res){
    if (!req.param("group")) return res.status(400).send("group не указан");
    if (!req.param("month")) return res.status(400).send("month не указан");
    if (!req.param("year")) return res.status(400).send("year не указан");
    const group = Number(req.param("group"));
    const month = Number(req.param("month"));
    const year = Number(req.param("year"));
    try {
      const result = await PaymentsService.getGroupUnpayedEvents(year, month, group, req.session.User.person);
      return res.send(result);
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
  transactions: async function (req, res){
    if (!req.param("person")) return res.status(400).send("person не указан");
    if (!req.param("limit")) return res.status(400).send("limit не указан");
    const person = Number(req.param("person"));
    const limit = Number(req.param("limit"));
    try {
      const transactions = await PaymentsService.getTransactions(person, limit);
      return res.send(transactions);
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  selfTransactions: async function (req, res){
    if (!req.param("limit")) return res.status(400).send("limit не указан");
    const limit = Number(req.param("limit"));
    try {
      const transactions = await PaymentsService.getTransactions(req.session.User.person, limit);
      return res.send(transactions);
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  delete: async function (req, res) {
    try {
      await Payments.destroy(req.param("id")).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  edit: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      req.body.id = req.param("id");
      await Payments.update(req.param("id"), req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  create: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      await Payments.create(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  createAll: async function (req, res) {
    try {
      req.body.forEach(p => { p.updater = req.session.User.id });
      await PaymentsService.createAll(req.body);
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  selfCreateAll: async function (req, res) {
    try {
      let payments = req.body;
      const person = await Persons.findOne(req.session.User.person);
      let paymentsSum = 0;
      payments.forEach(p => { 
        p.updater = req.session.User.id;
        p.person = req.session.User.person;
        paymentsSum += p.sum;
      });
      if (person.balance < paymentsSum) {
        return res.badRequest("На вашем балансе не достаточно средств для оплаты");
      }
      await PaymentsService.createAll(payments);
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  }
};
const PaymentsService = require('../services/PaymentsService');

module.exports = {
  settings: async function (req, res){
    try {
      const settings = await PaymentsService.getPaymentSettings(req.session.User.provider);
      return res.send(settings);
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
  groupUnpayedEvents: async function (req, res){
    if (!req.param("person")) return res.status(400).send("person не указан");
    if (!req.param("group")) return res.status(400).send("group не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    if (!req.param("year")) return res.status(400).send("year не указан");
    const person = Number(req.param("person"));
    const group = Number(req.param("group"));
    const month = Number(req.param("month"));
    const year = Number(req.param("year"));
    try {
      const result = await PaymentsService.getGroupUnpayedEvents(year, month, group, person, req.session.User.provider);
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
      const transactions = await PaymentsService.getTransactions(person, limit, req.session.User.provider);
      return res.send(transactions);
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  delete: async function (req, res) {
    try {
      await Payments.destroy({id: req.param("id"), provider: req.session.User.provider}).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  edit: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      req.body.provider = req.session.User.provider;
      req.body.id = req.param("id");
      await Payments.update({id: req.param("id"), provider: req.session.User.provider}).set(req.body).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  create: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      req.body.provider = req.session.User.provider;
      await Payments.create(req.body).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  createAll: async function (req, res) {
    try {
      req.body.forEach(p => { 
        p.updater = req.session.User.id; 
        p.provider = req.session.User.provider;
      });
      await PaymentsService.createAll(req.body);
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  }
};
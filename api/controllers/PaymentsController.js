const TransactionType = require('../../enums').TransactionType;
const GroupType = require('../../enums').GroupType;
const GetMonthDateRange =  require('../utils/DateRangeHelper').GetMonthDateRange;
module.exports = {
  settings: async function (req, res){
    try {
      const persons = await Persons.find().sort('name ASC');
      const groups = await Groups.find().populate("members", {select: ["id"]});
      const personals = groups.filter(g => g.type == GroupType.Personal); 
      const events = await Events
        .find({group: personals.map(p => p.id)})
        .populate("visitors")
        .populate("payments");
      const unpayedEvents = {};
      persons.forEach(p => unpayedEvents[p.id] = []);
      events.forEach(event => {
        const visitors = event.visitors;
        const paymentPersons = event.payments.map(p => p.person);
        visitors.forEach(person => {
          if (paymentPersons.includes(person.id)) return;
          unpayedEvents[person.id].push(event); 
        })
      });
      const generals = groups.filter(g => g.type == GroupType.General);
      generals.forEach(group => {
        group.members = group.members.map(m => m.id);  
      });
      personals.forEach(group => {
        group.members = group.members.map(m => m.id);  
      }); 
      
      return res.send({ persons, generals, personals, unpayedEvents });
    } catch (error) {
      return res.badRequest();
    }
  },
  groupUnpayedEvents: async function (req, res){
    try {
      if (!req.param("person")) return res.status(400).send("person не указан");
      if (!req.param("group")) return res.status(400).send("group не указан");
      if (!req.param("month")) return res.status(400).send("month не указан");
      if (!req.param("year")) return res.status(400).send("year не указан");
      const person = Number(req.param("person"));
      const group = Number(req.param("group"));
      const month = Number(req.param("month"));
      const year = Number(req.param("year"));
      const monthDateRange = GetMonthDateRange(year, month);
      const events = await Events
        .find({group: group, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
        .populate("payments");
      const result = events.filter(e => !e.payments.map(p => p.person).includes(person));
      return res.send(result);
    } catch (error) {
      return res.badRequest();
    }
  },
  transactions: async function (req, res){
    try {
      if (!req.param("person")) return res.status(400).send("person не указан");
      if (!req.param("limit")) return res.status(400).send("limit не указан");
      const person = Number(req.param("person"));
      const limit = Number(req.param("limit"));
      let payments = await Payments.find({ where: { person: person }, limit: limit, sort: "updatedAt DESC"});
      let incomes = await Incomes.find({ where: { person: person }, limit: limit, sort: "updatedAt DESC"});
      payments.forEach(payment => { payment.type =  TransactionType.Payment });
      incomes.forEach(income => { income.type =  TransactionType.Income });
      const transactions = [...payments, ...incomes].sort((a, b) => {
        if (a.updatedAt > b.updatedAt) return -1;
        if (a.updatedAt < b.updatedAt) return 1;
        if (a.updatedAt == b.updatedAt) return 0;
      }).slice(0, limit);
      return res.send(transactions);
    } catch (error) {
      return res.badRequest();
    }
  },
  delete: async function (req, res) {
    try {
      await Payments.destroy(req.param("id")).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  edit: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      req.body.id = req.param("id");
      await Payments.update(req.param("id"), req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  create: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      await Payments.create(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  createAll: async function (req, res) {
    try {
      req.body.forEach(p => {
        p.updater = req.session.User.id;
      })
      await Payments.createEach(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
};


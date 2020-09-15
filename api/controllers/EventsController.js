const moment = require('moment');
const Users = require('../models/Users');
const GroupType = require('../../enums').GroupType;

module.exports = {
  delete: async function (req, res) {
    try {
      await Events.destroy(req.param("id")).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  edit: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      req.body.id = req.param("id");
      await Events.update(req.param("id"), req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  create: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      await Events.create(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  addVisitor: async function (req, res) {
    if (!req.param("id")) return res.status(400).send({
      message: "id не указан",
      success: false
    });
    if (!req.param("visitors")) return res.status(400).send({
      message: "visitors не указан",
      success: false
    });
    try {
      const id = Number(req.param("id"));
      const visitors = req.param("visitors");
      const persons = await Persons.find({ id: visitors });
      const event = await Events.findOne(id).populate("payments");
      const group = await Groups.findOne(event.group);
      let createdPayments = [];
      let personBalances = {};
      await Events.addToCollection(id, "visitors").members(visitors);
      if (group.type == GroupType.Personal){
        const eventPaymentsPersons = event.payments.map(p => p.person);
        const cost = group.cost;
        const payments = persons
          .filter(p => !eventPaymentsPersons.includes(p.id) && p.balance >= cost)
          .map(p => {
            return {
              updater: req.session.User.id,
              person: p.id,
              events: [event.id],
              group: group.id,
              sum: cost,
              description: `Посещение ${group.name} ${moment(event.startsAt).format("DD.MM")}`
            }
          });
        createdPayments = await Payments.createEach(payments).fetch();
        const updatedPersons = await Persons.find({id: payments.map(p => p.person)});
        updatedPersons.forEach(p => { 
          personBalances[p.id] = p.balance;
        });
      }
      return res.send({
        success: true,
        createdPayments,
        personBalances
      });
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
  removeVisitor: async function (req, res) {
    if (!req.param("id")) return res.status(400).send({
      message: "id не указан",
      success: false
    });
    if (!req.param("visitors")) return res.status(400).send({
      message: "visitors не указан",
      success: false
    });
    try {
      const id = Number(req.param("id"));
      const visitors = req.param("visitors");
      const event = await Events.findOne(id).populate("payments");
      const group = await Groups.findOne(event.group);
      let removedPayments = [];
      let personBalances = {};
      if (group.type == GroupType.Personal){
        const payments = event.payments
          .filter(p => visitors.includes(p.person));
        if (payments.length){
          await Payments.destroy({ id: payments.map(p => p.id) }).fetch();
          removedPayments = payments.map(p => p.id);
          const updatedPersons = await Persons.find({id: payments.map(p => p.person)});
          updatedPersons.forEach(p => { 
            personBalances[p.id] = p.balance;
          });
        }
      }
      await Events.removeFromCollection(id, "visitors").members(visitors);
      return res.send({
        success: true,
        removedPayments,
        personBalances
      });
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
};


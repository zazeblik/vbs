const moment = require('moment');
const GroupType = require('../../enums').GroupType;

module.exports = {
  delete: async function (req, res) {
    try {
      await Events.destroy(req.param("id")).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  edit: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      await Events.update(req.param("id"), req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  create: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      await Events.create(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
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
      if (group.type == GroupType.Personal){
        const eventPaymentsPersons = event.payments.map(p => p.person);
        const cost = group.cost;
        await Events.addToCollection(id, "visitors").members(visitors);
        const payments = persons
          .filter(p => !eventPaymentsPersons.includes(p.id) && p.balance >= cost)
          .map(p => {
            return {
              updater: req.session.User.id,
              person: p.id,
              events: [event.id],
              group: group.id,
              sum: group.cost,
              description: `Посещение ${group.name} ${moment(event.startsAt).format("DD.MM")}`
            }
          });
        createdPayments = await Payments.createEach(payments).fetch();
      }
      return res.send({
        success: true,
        createdPayments: createdPayments
      });
    } catch (error) {
      return res.badRequest();
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
      if (group.type == GroupType.Personal){
        const payments = event.payments
          .filter(p => visitors.includes(p.person))
          .map(p => p.id);
        if (payments.length){
          await Payments.destroy({ id: payments }).fetch();
          removedPayments = payments;
        }
      }
      await Events.removeFromCollection(id, "visitors").members(visitors);
      return res.send({
        success: true,
        removedPayments: removedPayments
      });
    } catch (error) {
      return res.badRequest();
    }
  },
};


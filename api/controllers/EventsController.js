const moment = require('moment');
const GroupType = require('../../enums').GroupType;
const PersonalDebitMode = require('../../enums').PersonalDebitMode;

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
      const event_id = Number(req.param("id"));
      let visitors = req.param("visitors");
      let autoDebit = req.param("autoDebit");
      const settings = await Settings.findOne(1);
      if (settings.debitMode == PersonalDebitMode.AlwaysDebit) autoDebit = true;
      if (settings.debitMode == PersonalDebitMode.AlwaysNoDebit) autoDebit = false;
      let event = await Events.findOne(event_id)
        .populate("payments")
        .populate("visitors");
      const group = await Groups.findOne(event.group);
      let createdPayments = [];
      let updatedPayments = [];
      let updatedPersonIds = [];
      let personBalances = {};
      await Events.addToCollection(event_id, "visitors").members(visitors);
      if (group.type == GroupType.Personal && autoDebit) {
        const persons = await Persons.find({id: visitors}).sort('balance DESC');
        const eventPayments = event.payments;
        const eventVisitorIds = event.visitors.map(x => x.id);
        const eventPaymentsPersons = eventPayments.map(p => p.person);
        const uniquePersons = [...new Set(eventVisitorIds.concat(visitors))];
        const memberCost = settings.divideSumMode ? (group.cost / uniquePersons.length) : group.cost;
        const visiorsToCreatePayments = visitors
          .filter(v => !eventPaymentsPersons.includes(v) && persons.find(p => p.id == v).balance >= memberCost);
        const paymentsToCreate = visiorsToCreatePayments.map(v => {
          return {
            updater: req.session.User.id,
            person: v,
            events: [event.id],
            group: group.id,
            sum: memberCost,
            description: `Посещение ${group.name} ${moment(event.startsAt).format("DD.MM")}`
          }
        });
        for (let i = 0; i < paymentsToCreate.length; i++) {
          const p = paymentsToCreate[i];
          const createdPayment = await Payments.create(p).fetch();
          createdPayments.push(createdPayment);
        }
        updatedPersonIds = updatedPersonIds.concat(visiorsToCreatePayments);
        const personsToUpdatePayments = eventPaymentsPersons.filter(p => !visiorsToCreatePayments.includes(p));
        for (let i = 0; i < personsToUpdatePayments.length; i++) {
          const p = eventPayments.find(x => x.person == personsToUpdatePayments[i]);
          const updatedPayment = await Payments.updateOne({id: p.id}, {id: p.id, sum: memberCost});
          updatedPersonIds.push(p.person);
          updatedPayments.push(updatedPayment);
        }
      }
      const updatedPersons = await Persons.find({id: updatedPersonIds});
      for (let i = 0; i < updatedPersons.length; i++) {
        const p = updatedPersons[i];
        personBalances[p.id] = p.balance;
      }
      return res.send({
        success: true,
        createdPayments,
        updatedPayments,
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
      const event_id = Number(req.param("id"));
      const visitors = req.param("visitors");
      const settings = await Settings.findOne(1);
      let event = await Events.findOne(event_id)
        .populate("payments")
        .populate("visitors");
      const group = await Groups.findOne(event.group);
      let removedPayments = [];
      let updatedPayments = [];
      let updatedPersonIds = [];
      let personBalances = {};
      await Events.removeFromCollection(event_id, "visitors").members(visitors);
      if (group.type == GroupType.Personal) {
        const eventPayments = event.payments;
        const eventVisitorIds = event.visitors.map(x => x.id);
        const eventPaymentsPersons = eventPayments.map(p => p.person);
        const remainingPersons = eventVisitorIds.filter(x => !visitors.includes(x));
        const memberCost = settings.divideSumMode ? (group.cost / remainingPersons.length) : group.cost;
        const visiorsToDeletePayments = eventPaymentsPersons.filter(x => visitors.includes(x));
        const paymentIdsToDelete = eventPayments
          .filter(p => visiorsToDeletePayments.includes(p.person))
          .map(p => p.id);
        await Payments.destroy({ id: paymentIdsToDelete }).fetch();;
        removedPayments = removedPayments.concat(paymentIdsToDelete);
        updatedPersonIds = updatedPersonIds.concat(visiorsToDeletePayments);
        const otherEventPayments = eventPayments.filter(p => !paymentIdsToDelete.includes(p.id));
        for (let j = 0; j < otherEventPayments.length; j++) {
          const p = otherEventPayments[j];
          const updatedPayment = await Payments.updateOne({id: p.id}, {id: p.id, sum: memberCost});
          updatedPersonIds.push(p.person);
          updatedPayments.push(updatedPayment);
        };
      }
      const updatedPersons = await Persons.find({id: updatedPersonIds});
      for (let i = 0; i < updatedPersons.length; i++) {
        const p = updatedPersons[i];
        personBalances[p.id] = p.balance;
      }
      return res.send({
        success: true,
        removedPayments,
        updatedPayments,
        personBalances
      });
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
};


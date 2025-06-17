const GroupType = require('../../enums').GroupType;
const IncomeType = require('../../enums').IncomeType;
const moment = require('moment');
module.exports = {
  delete: async function (req, res) {
    if (!req.param("id")) return res.status(400).send({
      message: "id не указан",
      success: false
    });
    try {
      const id = req.param("id");

      const settings = (await Settings.find({provider: req.session.User.provider}))[0];
      if (settings.autoRefundOnDeletePersonalEvents) {
        const event = await Events.findOne(id).populate("payments").populate("group");
        if (event.group.type == GroupType.Personal){
          for (let i = 0; i < event.payments.length; i++) {
            const payment = event.payments[i];
            await Incomes.create({
              updater: req.session.User.id,
              person: payment.person,
              sum: payment.sum,
              type: IncomeType.Other,
              description: `Возврат при удалении занятия "${event.group.name}" (${moment(event.startsAt).format("DD.MM")})`,
              provider: req.session.User.provider
            });
          }
        }
      }

      await Events.destroy({id: id, provider: req.session.User.provider}).fetch();;
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  edit: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      req.body.id = req.param("id");
      req.body.provider = req.session.User.provider;
      await Events.update({id: req.param("id"), provider: req.session.User.provider}).set(req.body).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  create: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      req.body.provider = req.session.User.provider;
      await Events.create(req.body).fetch();
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

      let event = await Events.findOne({id: event_id, provider: req.session.User.provider})
        .populate("visitors");
      await Events.addToCollection(event.id, "visitors").members(visitors);

      return res.send({
        success: true
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
      let event = await Events.findOne({id: event_id, provider: req.session.User.provider})
        .populate("visitors");
      await Events.removeFromCollection(event.id, "visitors").members(visitors);
      return res.send({
        success: true
      });
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
};


const GroupType = require('../../enums').GroupType
const moment = require('moment');

const GetMonthDateRange =  require('../utils/DateRangeHelper').GetMonthDateRange;

module.exports = {
  addPerson: async function (req, res) {
    if (!req.param("id")) return res.status(400).send("id не указан");
    if (!req.param("person")) return res.status(400).send("person не указан");
    try {
      const id = Number(req.param("id"));
      const person = Number(req.param("person"));
      await Groups.addToCollection(id, "members").members([person]);
      await Groups.update(id, { updater: req.session.User.id })
      return res.ok();
    } catch (error) {
      return res.badRequest();
    }
  },
  removePerson: async function (req, res) {
    if (!req.param("id")) return res.status(400).send("id не указан");
    if (!req.param("person")) return res.status(400).send("person не указан");
    try {
      const id = Number(req.param("id"));
      const person = Number(req.param("person"));
      await Groups.removeFromCollection(id, "members").members([person]);
      await Groups.update(id, { updater: req.session.User.id })
      return res.ok();
    } catch (error) {
      return res.badRequest();
    }
  },
  detail: async function (req, res){
    if (!req.param("id")) return res.status(400).send("id не указан");
    try {
      const id = Number(req.param("id"));
      const group = await Groups.findOne(id).populate("members");
      let existingIds = group.members.map(m => m.id);
      const persons = await Persons.find({ where: { id: { "!=": existingIds } }, select: ["id", "name"]});
      const places = await Places.find();
      return res.send({ group, persons, places });
    } catch (error) {
      return res.badRequest();
    }
  },
  sheet: async function (req, res) {
    try {
      if (!req.param("id")) return res.status(400).send("id не указан");
      if (!req.param("year")) return res.status(400).send("year не указан");
      if (!req.param("month")) return res.status(400).send("month не указан");
      const id = Number(req.param("id"));
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = GetMonthDateRange(year, month);
      const archivePersons = await ArchivePersons.find({ group: id });
      const group = await Groups.findOne(id)
        .populate("members", { 
          where: { id: { '!=' : archivePersons.map(ap => ap.person) } }, 
          sort: "name ASC" 
        });
      const groupMembers = group.members;
      const events = await Events
        .find({ group: id, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
        .sort("startsAt ASC")
        .populate("visitors", {select: ["id"]})
        .populate("payments", {select: ["id", "person", "sum"]});
      let fields = [{
        key: "person", label: "Фамилия Имя"
      }]
      let rows = groupMembers.map(gm => {
        let row = {
          person: gm,
          _cellVariants: {}
        };
        events.forEach(e => {
          const visits = e.visitors.map( v => v.id );
          const eventPersonPayment = e.payments.find(p => p.person == gm.id);
          row[e.id] = {
            visited: visits.includes(gm.id),
            payed: !!eventPersonPayment,
            eventId: e.id,
            visitorId: gm.id,
            payment: eventPersonPayment
          };
          if (row[e.id].payed){
            row._cellVariants[e.id] = 'success'
          }
          const fieldKeys = fields.map(f => f.key);
          if (fieldKeys.includes(e.id.toString()))
            return;
          
          fields.push({
            key: e.id.toString(),
            label: moment(e.startsAt).format("DD"),
            class: "text-center",
            eventId: e.id
          });
        });
        return row;
      });
      fields.push({ key: "payments", label: "Платежи", class: "text-center" });
      fields.push({ key: "visits", label: "Посещения", class: "text-center" });
      return res.send({ rows, fields });
    } catch (err) {
      return res.badRequest();
    }
  },
  general: async function (req, res) {
    try {
      const places = await Places.find({ select: ["id", "name"] });
      const persons = await Persons.find({ select: ["id", "name"] });
      const groups = await Groups
        .find({ type: GroupType.General })
        .populate("defaultInstructor")
        .populate("members");

      const instructors = groups.filter(g => g.defaultInstructor != null)
        .map(g => {
          return { id: g.defaultInstructor.id, name: g.defaultInstructor.name }
        })
        .filter((v, i, a) => (a.map(ai => ai.id)).indexOf(v.id) === i);
      return res.send({ places, persons, instructors });
    } catch (err) {
      return res.badRequest();
    }
  },
  personal: async function (req, res) {
    try {
      const places = await Places.find({ select: ["id", "name"] });
      const persons = await Persons.find({ select: ["id", "name"] });
      const groups = await Groups
        .find({ type: GroupType.Personal })
        .populate("defaultInstructor")
        .populate("members");

      const instructors = groups.filter(g => g.defaultInstructor != null)
        .map(g => {
          return { id: g.defaultInstructor.id, name: g.defaultInstructor.name }
        })
        .filter((v, i, a) => (a.map(ai => ai.id)).indexOf(v.id) === i);
      return res.send({ places, persons, instructors });
    } catch (err) {
      return res.badRequest();
    }
  },
  delete: async function (req, res) {
    try {
      await Groups.destroy(req.param("id"))
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  edit: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      await Groups.update(req.param("id"), req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
  create: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      await Groups.create(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest();
    }
  },
};


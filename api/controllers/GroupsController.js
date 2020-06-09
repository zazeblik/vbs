const GroupType = require('../../enums').GroupType
const moment = require('moment');

const GetMonthDateRange =  require('../utils/DateRangeHelper').GetMonthDateRange;

module.exports = {
  settings: async function (req, res){
    try {
      const persons = await Persons.find();
      const places = await Places.find();
      return res.send({ persons, places });
    } catch (error) {
      return res.badRequest();
    }
  },
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
  instructorDetail: async function (req, res){
    if (!req.param("id")) return res.status(400).send("id не указан");
    try {
      const id = Number(req.param("id"));
      const instructor = await Persons.findOne(id);
      const persons = await Persons.find({select: ["id", "name"]});
      const places = await Places.find();
      const groups = await Groups.find({ type: GroupType.Personal, defaultInstructor: id, hidden: false });
      return res.send({ instructor, places, persons, groups });
    } catch (error) {
      return res.badRequest();
    }
  },
  instructorScheduleEvents: async function (req, res){
    if (!req.param("id")) return res.status(400).send("id не указан");
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (!req.param("month")) return res.status(400).send("month не указан");
    try {
      const id = Number(req.param("id"));
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = GetMonthDateRange(year, month);
      
      const groups = await Groups
        .find({ type: GroupType.Personal, hidden: false })
        .populate("members", {select: ["id", "name"]});
      const archivePersons = await ArchivePersons.find({ group: groups.map(g => g.id) });
      const groupIds = groups.map(g => g.id);
      let events = await Events
        .find({ instructor: id, group: groupIds, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
        .sort("startsAt ASC")
        .populate("visitors", {select: ["id", "name"]})
        .populate("payments", {select: ["id", "person", "sum"]});
      events.forEach(e => {
        e.members = groups
          .find(g => g.id == e.group)
          .members
          .filter(m => archivePersons.filter(ap => ap.group == e.group && ap.person == m.id).length == 0);
      })
      return res.send(events);
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
            eventId: e.id,
            event: e
          });
        });
        return row;
      });
      fields.push({ key: "payments", label: "Оплата", class: "text-center" });
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
      const groups = await Groups.find({ 
        where: { 
          type: GroupType.General, 
          hidden: false 
        }, 
        select: ["defaultInstructor"]
      });
      const instructorIdsRaw = await Events
        .getDatastore()
        .sendNativeQuery(`select distinct instructor from vbs.events as e 
                        where e.group in (select id from vbs.groups where type=${GroupType.General})`);
      const instructorIds = instructorIdsRaw.rows.map(r => r.instructor);
      const defaultInstructorIds = [...new Set(groups.map(g => g.defaultInstructor))];
      const instructors = persons.filter(p => instructorIds.includes(p.id));
      defaultInstructorIds.forEach(id => {
        if (!instructorIds.includes(id)){
          instructors.push(persons.find(p => p.id == id));
        }
      });
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
        .find({ type: GroupType.Personal, hidden: false });
      const instructorIdsRaw = await Events
        .getDatastore()
        .sendNativeQuery(`select distinct instructor from vbs.events as e 
                        where e.group in (select id from vbs.groups where type=${GroupType.Personal})`);
      const instructorIds = instructorIdsRaw.rows.map(r => r.instructor);
      const defaultInstructorIds = [...new Set(groups.map(g => g.defaultInstructor))];
      const instructors = persons.filter(p => instructorIds.includes(p.id));
      defaultInstructorIds.forEach(id => {
        if (!instructorIds.includes(id)){
          instructors.push(persons.find(p => p.id == id));
        }
      });
      return res.send({ places, persons, instructors });
    } catch (err) {
      return res.badRequest();
    }
  },
  instructorGroups: async function (req, res){
    try {
      if (!req.param("id")) return res.status(400).send("id не указан");
      if (!req.param("type")) return res.status(400).send("type не указан");
      const id = Number(req.param("id"));
      const type = Number(req.param("type"));
      let groups = await Groups
        .find({
          where: { 
            type: type,
            defaultInstructor: id,
            hidden: false
          },
          sort: "updatedAt DESC"
        })
        .populate("defaultInstructor")
        .populate("defaultPlace")
        .populate("members", {
          sort: "name ASC"
        });
      const archivePersons = await ArchivePersons.find({ group: groups.map(g => g.id) }); 
      groups.forEach(g => {
        g.members = g.members.filter(m => archivePersons.filter(ap => ap.group == g.id && ap.person == m.id).length == 0)
      })
      return res.send(groups);
    } catch (error) {
      return res.badRequest();
    }
  },
  delete: async function (req, res) {
    try {
      await Groups.destroy(req.param("id")).fetch();
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
  list: async function (req, res) {
    try {
      const sort = req.query.sort || "updatedAt DESC";
      const perPage = Number(req.query.perPage) || 10;
      let currentPage = Number(req.query.page) || 1;
      let query = {
        where: {
          name: { "contains": req.query.search || "" }
        }
      };
      const total = await Groups.count(query);
      const skip = (currentPage - 1) * perPage;
      query.skip = skip > total ? 0 : skip;
      currentPage = skip > total ? 1 : currentPage;
      let totalPages = Math.ceil(total / perPage);
      query.limit = perPage;
      query.sort = sort;
      const data = await Groups.find(query)
        .populate("defaultInstructor")
        .populate("defaultPlace")
        .populate("updater");
      return res.send({
        total: total,
        totalPages: totalPages,
        perPage: perPage,
        page: currentPage,
        data: data
      })
    } catch (err) {
      return res.badRequest();
    }
  }
};


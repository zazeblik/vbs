const GroupType = require('../../enums').GroupType
const GetMonthDateRange =  require('../utils/DateRangeHelper').GetMonthDateRange;
const GroupsService = require('../services/GroupsService');
const ExcelService = require('../services/ExcelService');

module.exports = {
  exportGenerals: async function (req, res){
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    if (!req.param("group")) return res.status(400).send("group не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const group = Number(req.param("group"));
      const wbbuf = await ExcelService.getGenerals(year, month, group);
      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
      return res.end( wbbuf );
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  exportPersonals: async function (req, res){
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    if (!req.param("instructor")) return res.status(400).send("instructor не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const instructor = Number(req.param("instructor"));
      const wbbuf = await ExcelService.getPersonals(year, month, instructor);
      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
      return res.end( wbbuf );
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  settings: async function (req, res){
    try {
      const persons = await Persons.find().sort('name ASC');
      const places = await Places.find();
      return res.send({ persons, places });
    } catch (error) {
      return res.badRequest(error.message);
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
      return res.badRequest(error.message);
    }
  },
  addPersons: async function (req, res) {
    if (!req.param("id")) return res.status(400).send("id не указан");
    if (!req.param("persons")) return res.status(400).send("persons не указан");
    try {
      const id = Number(req.param("id"));
      const persons = req.param("persons");
      await Groups.addToCollection(id, "members").members(persons);
      await Groups.update(id, { updater: req.session.User.id })
      return res.ok();
    } catch (error) {
      return res.badRequest(error.message);
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
      return res.badRequest(error.message);
    }
  },
  instructorDetail: async function (req, res){
    if (!req.param("id")) return res.status(400).send("id не указан");
    try {
      const id = Number(req.param("id"));
      const instructor = await Persons.findOne(id);
      const persons = await Persons.find({select: ["id", "name"]}).sort('name ASC');
      const places = await Places.find();
      const groups = await Groups.find({ type: GroupType.Personal, defaultInstructor: id, hidden: false }).sort('name ASC');;
      return res.send({ instructor, places, persons, groups });
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
  instructorScheduleCalendar: async function (req, res){
    if (!req.param("id")) return res.status(400).send("id не указан");
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    try {
      const id = Number(req.param("id"));
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = GetMonthDateRange(year, month);
      const events = await GroupsService.getInstructorScheduleEvents(id, monthDateRange);
      const fields = GroupsService.getInstructorScheduleFields(events);
      const rows = GroupsService.getInstructorScheduleRows(year, month, events, fields);
      const paymentsSum = GroupsService.getInstructorSchedulePaymentsSum(events);
      const hoursSum = GroupsService.getInstructorScheduleHoursSum(events);
      const totals = {hoursSum, paymentsSum}
      return res.send({ fields, rows, totals });
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
  detail: async function (req, res){
    if (!req.param("id")) return res.status(400).send("id не указан");
    try {
      const id = Number(req.param("id"));
      const group = await Groups.findOne(id).populate("members");
      let existingIds = group.members.map(m => m.id);
      const persons = await Persons.find({ where: { id: { "!=": existingIds } }, select: ["id", "name"]}).sort('name ASC');;
      const places = await Places.find();
      return res.send({ group, persons, places });
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
  sheet: async function (req, res) {
    try {
      if (!req.param("id")) return res.status(400).send("id не указан");
      if (!req.param("year")) return res.status(400).send("year не указан");
      if (req.param("month") == undefined) return res.status(400).send("month не указан");
      const id = Number(req.param("id"));
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = GetMonthDateRange(year, month);
      const sheet = await GroupsService.getSheet(id, monthDateRange);
      return res.send(sheet);
    } catch (err) {
      return res.badRequest(err.message);
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
      return res.badRequest(err.message);
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
      return res.badRequest(err.message);
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
          sort: "name ASC"
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
      return res.badRequest(error.message);
    }
  },
  generalDefaultInstructors: async function (req, res) {
    try {
      const groups = await Groups.find({type: GroupType.General, hidden: false});
      const defaultInstructorIds = [...new Set(groups.map(g => g.defaultInstructor))];
      const instructors = await Persons.find({ id: defaultInstructorIds });
      instructors.forEach(i => {
        i.groups = groups.filter(g => g.defaultInstructor == i.id);
      })
      return res.ok(instructors);
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  delete: async function (req, res) {
    try {
      await Groups.destroy(req.param("id")).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  edit: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      req.body.id = req.param("id");
      await Groups.update(req.param("id"), req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  create: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      await Groups.create(req.body)
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
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
      return res.badRequest(err.message);
    }
  }
};


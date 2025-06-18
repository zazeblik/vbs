const GroupType = require('../../enums').GroupType;
const GroupMemberActionType = require('../../enums').GroupMemberActionType;
const GetMonthDateRange =  require('../utils/DateRangeHelper').GetMonthDateRange;
const GroupsService = require('../services/GroupsService');
const ExcelService = require('../services/ExcelService');

module.exports = {
  autoDebit: async function (req, res) {
    try {
      await sails.helpers.autoDebit(req.session.User.provider, req.param("group"));
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  exportReport: async function (req, res){
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    if (!req.param("group")) return res.status(400).send("group не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const group = Number(req.param("group"));
      const wbbuf = await ExcelService.getGroupReport(year, month, group, req.session.User.provider);
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
      const wbbuf = await ExcelService.getPersonals(year, month, instructor, req.session.User.provider);
      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
      return res.end( wbbuf );
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  settings: async function (req, res){
    try {
      const persons = await Persons.find({provider: req.session.User.provider}).sort('name ASC');
      const instructors = await Instructors.find({provider: req.session.User.provider});
      return res.send({ persons, instructors });
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
  addPerson: async function (req, res) {
    if (!req.param("id")) return res.status(400).send("id не указан");
    if (!req.param("person")) return res.status(400).send("person не указан");
    const id = Number(req.param("id"));
    const group = await Groups.findOne(id);
    if (group.provider != req.session.User.provider) return res.status(403);
    try {
      const person = Number(req.param("person"));
      await Groups.addToCollection(id, "members").members([person]);
      await GroupMemberActions.create({
        group: id, 
        person: person, 
        type: GroupMemberActionType.Added, 
        provider: req.session.User.provider
      }).fetch();;
      await Groups.update(id, { updater: req.session.User.id, provider: req.session.User.provider }).fetch();
      return res.ok();
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
  addPersons: async function (req, res) {
    if (!req.param("id")) return res.status(400).send("id не указан");
    if (!req.param("persons")) return res.status(400).send("persons не указан");
    const id = Number(req.param("id"));
    const group = await Groups.findOne(id);
    if (group.provider != req.session.User.provider) return res.status(403);
    try {
      const persons = req.param("persons");
      await Groups.addToCollection(id, "members").members(persons);
      const actions = persons.map(x => { 
        return {
          group: id, 
          person: x, 
          type: GroupMemberActionType.Added, 
          provider: req.session.User.provider
        }
      });
      await GroupMemberActions.createEach(actions);
      await Groups.update(id, {
        updater: req.session.User.id, 
        provider: req.session.User.provider 
      }).fetch();
      return res.ok();
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
  removePerson: async function (req, res) {
    if (!req.param("id")) return res.status(400).send("id не указан");
    if (!req.param("person")) return res.status(400).send("person не указан");
    const id = Number(req.param("id"));
    const group = await Groups.findOne(id);
    if (group.provider != req.session.User.provider) return res.status(403);
    try {
      const person = Number(req.param("person"));
      await Groups.removeFromCollection(id, "members").members([person]);
      await GroupMemberActions.create({
        group: id, 
        person: person, 
        type: GroupMemberActionType.Deleted, 
        provider: req.session.User.provider 
      }).fetch();
      await Groups.update(id, { 
        updater: req.session.User.id, 
        provider: req.session.User.provider  
      })
      return res.ok();
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
  instructorDetail: async function (req, res){
    try {
      const persons = await Persons
        .find({
          select: ["id", "name"], 
          where: {
            provider: req.session.User.provider 
          }
        })
        .sort('name ASC');
      const groups = await Groups
        .find({
          type: GroupType.Personal,
          hidden: false, 
          provider: req.session.User.provider
        }).sort('name ASC');
      const instructors = await Instructors.find({ 
        select: ["id", "name"],
        where: {
          provider: req.session.User.provider 
        } 
      });
      return res.send({ persons, groups, instructors });
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
      const events = await GroupsService.getInstructorScheduleEvents(id, monthDateRange, req.session.User.provider);
      const fields = GroupsService.getInstructorScheduleFields(events);
      const rows = GroupsService.getInstructorScheduleRows(year, month, events, fields);
      const paymentsSum = GroupsService.getInstructorSchedulePaymentsSum(events);
      const hoursSum = GroupsService.getInstructorScheduleHoursSum(events);
      const totals = { hoursSum, paymentsSum };
      return res.send({ fields, rows, totals });
    } catch (error) {
      console.log(error);
      return res.badRequest(error.message);
    }
  },
  detail: async function (req, res){
    if (!req.param('id')) return res.status(400).send('id не указан');
    try {
      const id = Number(req.param('id'));
      const group = await Groups.findOne({id: id, provider: req.session.User.provider}).populate('members');

      let existingIds = group.members.map(m => m.id);
      const persons = await Persons
        .find({ where: { id: { '!=': existingIds }, provider: req.session.User.provider }, select: ['id', 'name'] })
        .sort('name ASC');
      const instructors = await Instructors.find({provider: req.session.User.provider}).sort('name ASC');;
      return res.send({ group, persons, instructors });
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
      const sheet = await GroupsService.getSheet(id, monthDateRange, req.session.User.provider);
      return res.send(sheet);
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  general: async function (req, res) {
    try {
      let instructors = await Instructors.find({where: {provider: req.session.User.provider}, select: ["id", "name"]});
      const persons = await Persons.find({where: {provider: req.session.User.provider}, select: ["id", "name"]});
      return res.send({ persons, instructors });
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  personal: async function (req, res) {
    try {
      const persons = await Persons.find({ 
        select: ["id", "name"],
        where: {
          provider: req.session.User.provider 
        } 
      });
      let instructors = await Instructors.find({ 
        select: ["id", "name"],
        where: {
          provider: req.session.User.provider 
        } 
      });
      return res.send({ persons, instructors });
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  journalGroups: async function (req, res){
    try {
      if (!req.param("type")) return res.status(400).send("type не указан");
      const type = Number(req.param("type"));
      const query = { 
        where: { type: type, hidden: false, provider: req.session.User.provider }, 
        sort: "name ASC" 
      };
      const id = req.param("id");
      if (id) {
        query.where.defaultInstructor = Number(req.param("id"));
      }
      let groups = await Groups
        .find(query)
        .populate("defaultInstructor")
        .populate("members", { sort: "name ASC" });
      return res.send(groups);
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
  generalDefaultInstructors: async function (req, res) {
    try {
      const groups = await Groups.find({type: GroupType.General, hidden: false, provider: req.session.User.provider});
      const defaultInstructorIds = [...new Set(groups.map(g => g.defaultInstructor))];
      const instructors = await Instructors.find({ id: defaultInstructorIds, provider: req.session.User.provider });
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
      await Groups.destroy({id: req.param("id"), provider: req.session.User.provider}).fetch();
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
      await Groups.update({id: req.param("id"), provider: req.session.User.provider}).set(req.body).fetch();
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  create: async function (req, res) {
    try {
      req.body.updater = req.session.User.id;
      req.body.provider = req.session.User.provider;
      await Groups.create(req.body).fetch();
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
          name: { "contains": req.query.search || "" },
          provider: req.session.User.provider
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


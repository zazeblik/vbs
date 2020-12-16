const path = require('path');
const fs = require('fs');
const GroupType = require('../../enums').GroupType;
const DateRangeHelper =  require('../utils/DateRangeHelper');
const PersonsController = require('./PersonsController');

module.exports = {
  publicSchedule: async function (req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (!req.param("month")) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = DateRangeHelper.GetMonthDateRange(year, month);
      const groups = await Groups.find({ type: GroupType.General, hidden: false });
      const groupIds = groups.map(g => g.id);
      const events = await Events
        .find({ group: groupIds, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
        .sort("startsAt ASC")
        .populate("instructor")
        .populate("group")
        .populate("place");
      
      return res.send(events);
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  selfSchedule: async function (req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (!req.param("month")) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = DateRangeHelper.GetMonthDateRange(year, month);
      const groups = await Groups.find({ hidden: false }).populate('members');
      const archive = await ArchivePersons.find({person: req.session.User.person});
      const archivedInGroups = archive.map(x => x.group);
      const groupIds = groups.filter(x => (x.members.map(y => y.id)).includes(req.session.User.person) && !archivedInGroups.includes(x.id) ).map(g => g.id);
      const events = await Events
        .find({ group: groupIds, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
        .sort("startsAt ASC")
        .populate("instructor")
        .populate("group")
        .populate("place");
      
      return res.send(events);
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  icon: async function (req, res) {
    fs.copyFile('frontend/public/favicon.ico', 'assets/favicon.ico', (err) => {
      if (err) res.badRequest(err.message);
      return res.ok();
    });
  },
  groups: async function (req, res) {
    try {
      const groups = await Groups.find({ type: GroupType.General, hidden: false });
      return res.send(groups);
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  uploads: async function (req, res) {
    let filename = req.params[0];
    if (!filename) return res.notFound();
    const file = path.resolve(sails.config.appPath, 'uploads'  + filename);
    if (fs.existsSync(file)) {
      let filestream = fs.createReadStream(file);
      return filestream.pipe(res);
    } else {
      return res.notFound();
    }
  },
  update: async function (req, res) {
    try {
      await Settings.update(1, req.body);
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  settings: async function (req, res) {
    const settings = await Settings.findOne(1);
    return res.send(settings);
  },
  profile: async function (req, res) {
    try {
      delete req.body.role;
      delete req.body.person;
      await Users.update(req.session.User.id, req.body);
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  person: async function (req, res){
    try {
      const person = await Persons.findOne({id: req.session.User.person});
      const fields = await PersonCustomFields.find();
      const fieldValues = await PersonCustomValues.find({person: req.session.User.person});
      fields.forEach(field => {
        const value = fieldValues.find(x => x.field == field.id)
        if (value) person[field.name] = value.value; 
      });
      return res.send(person);
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  profilePerson: async function (req, res) {
    try {
      req.body.id = req.session.User.person;
      return await PersonsController.edit(req, res);
    } catch (err) {
      return res.badRequest(err.message);
    }
  }
};


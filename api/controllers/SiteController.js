const path = require('path');
const fs = require('fs');
const GroupType = require('../../enums').GroupType;
const DateRangeHelper =  require('../utils/DateRangeHelper');

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
  profilePerson: async function (req, res) {
    try {
      await Persons.update(req.session.User.person, req.body);
      return res.ok();
    } catch (err) {
      return res.badRequest(err.message);
    }
  }
};


const DateRangeHelper =  require('../utils/DateRangeHelper');

module.exports = {
  birthdays: async function (req, res) {
    try {
      const birthdaysRaw = await Persons
        .getDatastore()
        .sendNativeQuery(`select name, birthday
          FROM vbs.persons
          WHERE DATE_FORMAT(FROM_UNIXTIME(birthday * 0.001 + 3600),'%m-%d') = DATE_FORMAT(NOW(),'%m-%d')`);
      const birthdays = birthdaysRaw.rows;
      return res.send(birthdays);
    } catch (error) {
      return res.badRequest();
    }
  },
  monthInfo: async function (req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (!req.param("month")) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = DateRangeHelper.GetMonthDateRange(year, month);
      const groups = await Groups.find({ hidden: false });
      const groupIds = groups.map(g => g.id);
      const events = await Events
        .find({ group: groupIds, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
        .sort("startsAt ASC")
        .populate("visitors")
        .populate("payments")
        .populate("instructor")
        .populate("group")
        .populate("place");
      let paymentIds = [];
      events.forEach(e => {
        e.payments.forEach(p => {
          if (paymentIds.includes(p.id)) return;
          paymentIds.push(p.id);
        })
      })
      const payments = await Payments.find({id: paymentIds}).populate('person');
      const incomes = await Incomes
        .find({ updatedAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() }})
        .populate('person');
      
      return res.send({ events, payments, incomes });
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  createMonthEvents: async function(req, res){
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (!req.param("month")) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const currentDate = new Date();
      const isCurrentMonth = currentDate.getFullYear() == year && currentDate.getMonth() == month;
      const startDate = new Date(year, month);
      await sails.helpers.eventsGenerate(isCurrentMonth ? Date.now() : startDate.getTime());
      return res.ok();
    }  catch (err) {
      return res.badRequest(err.message);
    }
  }
};


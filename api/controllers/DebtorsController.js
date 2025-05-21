const DateRangeHelper =  require('../utils/DateRangeHelper');

module.exports = {
  list: async function (req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const monthDateRange = DateRangeHelper.GetMonthDateRange(year, month);
      const groups = await Groups.find({ hidden: false, provider: req.session.User.provider }).populate("members");
      const groupIds = groups.map(g => g.id);
      const events = await Events.find({
        group: groupIds, 
        startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() }, 
        provider: req.session.User.provider 
      })
      .populate("visitors")
      .populate("payments");
      const debtors = [];
      events.forEach(event => {
        const payers = event.payments.map(x => x.person);
        event.visitors.forEach(visitor => {
          if (!payers.includes(visitor.id) && !debtors.find(x => x.id == visitor.id)){
            debtors.push({id: visitor.id, name: visitor.name })
          }
        });
      });
      return res.send({ debtors });
    } catch (err) {
      return res.badRequest(err.message);
    }
  },
  export: async function(req, res) {
    if (!req.param("year")) return res.status(400).send("year не указан");
    if (req.param("month") == undefined) return res.status(400).send("month не указан");
    try {
      const year = Number(req.param("year"));
      const month = Number(req.param("month"));
      const wbbuf = await ExcelService.getDebtors(year, month, req.session.User.provider);
      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);
      return res.end( wbbuf );
    } catch (err) {
      return res.badRequest(err.message);
    }
  }
}
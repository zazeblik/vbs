const moment = require('moment');
moment.locale('ru'); 
const GroupType = require('../../enums').GroupType;

module.exports.getSheet = async function(id, monthDateRange){
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
  let fields = [{ key: "person", label: "Фамилия Имя" }];
  const totals = {};
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
    const rowUniquePaymentIds = [];
    const payedRowEvents = Object.values(row).filter(x => x.payed);
    row.payments = 0;
    for (let i = 0; i < payedRowEvents.length; i++) {
      const e = payedRowEvents[i];
      if (!rowUniquePaymentIds.includes(e.payment.id)){
        row.payments += e.payment.sum;
        rowUniquePaymentIds.push(e.payment.id);
      }
    }
    row.visits = Object.values(row).filter(x => x.visited).length;
    return row;
  });
  events.forEach(e => {
    totals[e.id] = rows.filter(r => r[e.id].visited).length;
  });
  totals.person = 'Итого:';
  totals.payments = rows.map(x => x.payments).reduce((a, b) => a + b, 0);
  totals.visits = rows.map(x => x.visits).reduce((a, b) => a + b, 0);
  
  fields.push({ key: "payments", label: "Оплата", class: "text-center" });
  fields.push({ key: "visits", label: "Посещения", class: "text-center" });
  return { fields, rows, totals };
}

module.exports.getInstructorScheduleEvents = async function(id, monthDateRange) {
  const groups = await Groups
    .find({ type: GroupType.Personal, hidden: false })
    .populate("members", {select: ["id", "name", "balance"]});
  const archivePersons = await ArchivePersons.find({ group: groups.map(g => g.id) });
  const groupIds = groups.map(g => g.id);
  let events = await Events
    .find({ instructor: id, group: groupIds, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
    .sort("startsAt ASC")
    .populate("visitors", {select: ["id", "name"]})
    .populate("payments", {select: ["id", "person", "sum"]});
  events.forEach(e => {
    const members = groups
      .find(g => g.id == e.group).members
      .filter(m => archivePersons.filter(ap => ap.group == e.group && ap.person == m.id).length == 0)
      .map(x => { return {
        id: x.id,
        name: x.name,
        balance: x.balance
      }});
    members.forEach(m => { 
      m.isVisitor = !!e.visitors.find(v => v.id == m.id) 
    });
    e.members = members;
  });
  return events;
}

module.exports.getInstructorScheduleFields = function(events) {
  let weekdays = moment.weekdays();
  let fields = [];
  weekdays.forEach((wd, index) => {
    fields.push({
      label: wd,
      key: index.toString(),
      isShown: events.some(e => new Date(e.startsAt).getDay() == index )
    });
  });
  fields.push(fields.shift());
  return fields;
}

module.exports.getInstructorScheduleRows = function(year, month, events, fields) {
  let rows = [];
  const weekNumbers = [...new Set(events.map(e => getWeekNumber(e.startsAt)))];
  for (let i = 0; i < weekNumbers.length; i++) {
    let week = {}; 
    fields.map(sf => {
      const day = sf.key; 
      const date = getWeekDayDate(year, month, weekNumbers[i], day); 
      const isShown = date.getFullYear() == year && date.getMonth() == month;  
      week[day] = { date, isShown, events: getWeekDayEvents(date, events) };
    });
    rows.push(week);
  }
  let result = [];
  let appendWeek = {
    "1": { isShown: false, events: [] },
    "2": { isShown: false, events: [] },
    "3": { isShown: false, events: [] },
    "4": { isShown: false, events: [] },
    "5": { isShown: false, events: [] },
    "6": { isShown: false, events: [] }
  };
  rows.forEach((week, index) => {
    for (const day in week) {
      if (day == "0"){
        if (!result[index-1]) {
          if (week[day].isShown) appendWeek["0"] = week[day];
        } else {
          result[index-1]["0"] =  week[day];
        }
      } else {
        if (!result[index]) result[index] = {};
        result[index][day] = week[day];  
      }
    }
  });
  result = appendWeek["0"] ? [appendWeek, ...result] : result;
  result = result.filter(w => weekContainsEvents(w));
  result.forEach((w, index) => {
    if (!result[index]["0"]) {
      let sundayDate = new Date(result[index]["6"].date);
      sundayDate.setDate(sundayDate.getDate() + 1);
      result[index]["0"] = { isShown: true, date: sundayDate, events: [] };
    }
  })
  return result;
}

function weekContainsEvents(week){
  for (const day in week) {
    if (week[day].events.length) return true;
  }
  return false;
}

function getWeekDayEvents(date, events){
  const startOfDate = moment([date.getFullYear(), date.getMonth(), date.getDate()]);
  const endOfDate = moment(startOfDate).endOf('day');
  return events.filter(e => e.startsAt >= startOfDate.valueOf() && e.startsAt <= endOfDate.valueOf());
}

function getWeekDayDate(year, month, week, day){
  let date = new Date(year, month);
  const dayOffset = day - date.getDay();
  date.setDate(date.getDate() + week * 7 + dayOffset);
  return date;
}

function getWeekNumber(startsAt){
  const date = new Date(startsAt);
  let startOfMonthDate = new Date(startsAt);
  startOfMonthDate.setDate(1);
  const startOfMonthDay = startOfMonthDate.getDay() - 1;
  const weekdayNumber = Math.floor((date.getDate() + startOfMonthDay) / 7);
  return weekdayNumber;
}
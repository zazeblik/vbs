const moment = require('moment');
moment.locale('ru'); 
const GroupType = require('../../enums').GroupType;
const GroupMemberActionType = require('../../enums').GroupMemberActionType;

module.exports.getGroupedActions = async function (groupIds, toDate, providerId) {
  const actions = await GroupMemberActions
    .find({group: groupIds, createdAt: {"<=": toDate}, provider: providerId})
    .populate("person")
    .sort('createdAt ASC');
  let actionsByPerson = {};
  actions.forEach(action => {
    const group = action.group;
    const person = action.person.id;
    if (!actionsByPerson[group]) actionsByPerson[group] = {};
    if (!actionsByPerson[group][person]) actionsByPerson[group][person] = [];
    actionsByPerson[group][person].push(action); 
  });
  return actionsByPerson;
}

module.exports.getSheet = async function(id, monthDateRange, providerId){
  const group = await Groups.findOne(id).populate("members", { sort: "name ASC" });
  let groupMembers = group.members;
  const actionsByPerson = await getActionsByPerson(id, monthDateRange.end.valueOf(), providerId);
  groupMembers = this.resolveGroupMembersByActions(groupMembers, actionsByPerson);
  const events = await Events
    .find({ 
      group: id,
      startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() },
      provider: providerId
    })
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

module.exports.getInstructorScheduleEvents = async function(id, monthDateRange, providerId) {
  const groups = await Groups
    .find({ type: GroupType.Personal, hidden: falseproviderId, provider: providerId })
    .populate("members", {select: ["id", "name", "balance"]});
  const groupIds = groups.map(g => g.id);
  const groupedActions = await this.getGroupedActions(groupIds, monthDateRange.end.valueOf());
  let events = await Events
    .find({ instructor: id, group: groupIds, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
    .sort("startsAt ASC")
    .populate("visitors", {select: ["id", "name"]})
    .populate("payments", {select: ["id", "person", "sum"]});
  const membersByGroup = {};
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    let actionsByPerson = groupedActions[group.id] || {};
    let groupMembers = group.members;
    membersByGroup[group.id] = this.resolveGroupMembersByActions(groupMembers, actionsByPerson);
  }
  events.forEach(e => {
    const members = membersByGroup[e.group].map(x => { return {
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

module.exports.getInstructorSchedulePaymentsSum = function(events){
  let paymentsSum = 0;
  let uniquePaymentIds = [];
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    for (let j = 0; j < event.payments.length; j++) {
      const payment = event.payments[j];
      if (!uniquePaymentIds.includes(payment.id)){
        paymentsSum += payment.sum;
        uniquePaymentIds.push(payment.id);
      }
    }
  }
  return paymentsSum;
}

module.exports.getInstructorScheduleHoursSum = function(events){
  let hoursSum = 0;
  let uniqueStartsAt = [];
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const visitors = event.members.filter(x => x.isVisitor);
    if (!visitors.length) continue;
    if (!uniqueStartsAt.includes(event.startsAt)){
      hoursSum += event.duration / 60;
      uniqueStartsAt.push(event.startsAt);
    }
  }
  return hoursSum;
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

module.exports.resolveGroupMembersByActions = function(groupMembers, actionsByPerson){
  let groupMemberIds = groupMembers.map(x => x.id);
  for (const personId in actionsByPerson) {
    let actions = actionsByPerson[personId];
    let pId = Number(personId);
    if (actions.length) {
      const lastAction = actions[actions.length - 1];
      if (lastAction.type == GroupMemberActionType.Added) {
        if (!groupMemberIds.includes(pId)) groupMembers.push(lastAction.person);
      } else {
        groupMembers = groupMembers.filter(x => x.id != pId);
      }
    }
  }
  for (let i = 0; i < groupMembers.length; i++) {
    const member = groupMembers[i];
    if (!actionsByPerson[member.id]) groupMembers = groupMembers.filter(x => x.id != member.id);
  }
  return groupMembers.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
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

async function getActionsByPerson(group, toDate, providerId) {
  const actions = await GroupMemberActions
    .find({group: group, createdAt: {"<=": toDate}, provider: providerId})
    .populate("person")
    .sort('createdAt ASC');
  let actionsByPerson = {};
  actions.forEach(action => {
    const person = action.person.id;
    if (!actionsByPerson[person]) actionsByPerson[person] = [];
    actionsByPerson[person].push(action); 
  });
  return actionsByPerson;
}
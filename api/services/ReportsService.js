
const GroupType = require('../../enums').GroupType;

module.exports.getActivityPersons = async function(groupedActions, groups, activity){
  let persons = [];
  let activePersons = [];
  let activePersonsIds = [];
  const membersByGroup = {};
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    let actionsByPerson = groupedActions[group.id] || {};
    let groupMembers = group.members;
    membersByGroup[group.id] = GroupsService.resolveGroupMembersByActions(groupMembers, actionsByPerson);
  }
  for (const gId in membersByGroup) {
    const groupActiveMembers = membersByGroup[gId];
    activePersons = activePersons.concat(groupActiveMembers.filter(x => !activePersonsIds.includes(x.id)));
    activePersonsIds = activePersons.map(x => x.id);
  }
  if (activity) {
    persons = await Persons.find({id: {"!=": activePersonsIds}});
  } else {
    persons = activePersons;
  }
  return persons.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
}

module.exports.getVisits = function(events) {
  let visits = [];
  events.forEach(e => {
    let visitors = e.visitors;
    visitors.forEach(v => {
      let finded = visits.find(visit => visit.name == v.name);
      if (!finded) {
        visits.push({name: v.name, generalsCount: 0, personalsCount: 0, total: 0});
        finded = visits.find(visit => visit.name == v.name);
      }
      if (e.group.type == GroupType.General) {
        finded.generalsCount++;
      } else {
        finded.personalsCount++;
      }
      finded.total++;
    })
  });
  return visits.sort(sortByTotal);
}

module.exports.getInstructors = function(events) {
  let results = [];
  events.forEach(e => {
    let instructor = e.instructor;
    let finded = results.find(r => r.name == instructor.name);
    if (!finded) {
      results.push({name: instructor.name, generalsCount: 0, personalsCount: 0, total: 0});
      finded = results.find(r => r.name == instructor.name);
    }
    if (e.group.type == GroupType.General) {
      finded.generalsCount++;
    } else {
      finded.personalsCount++;
    }
    finded.total++;
  });
  return results.sort(sortByTotal);
}

module.exports.getTransactionSums = function(payments, incomes) {
  let results = [];
  payments.forEach(x => {
    const person = x.person;
    let finded = results.find(r => r.name == person.name);
    if (!finded) {
      results.push({name: person.name, incomesSum: 0, paymentsSum: 0});
      finded = results.find(r => r.name == person.name);
    }
    finded.paymentsSum += x.sum;
  });
  incomes.forEach(x => {
    const person = x.person;
    let finded = results.find(r => r.name == person.name);
    if (!finded) {
      results.push({name: person.name, incomesSum: 0, paymentsSum: 0});
      finded = results.find(r => r.name == person.name);
    }
    finded.incomesSum += x.sum;
  });
  return results.sort(sortByIncomesSum);
}

module.exports.resolveTotalSum = function(results, colNumber){
  switch (colNumber) {
    case 1: return 'Итого:';
    case 2: return results.map(x => x.eventsTotal).reduce((a, b) => a + b, 0);
    case 3: return results.map(x => x.visitsTotal).reduce((a, b) => a + b, 0);
    case 4: return results.map(x => x.paymentsTotal).reduce((a, b) => a + b, 0);
    case 5: return results.map(x => x.paymentsTotalSum).reduce((a, b) => a + b, 0);
    default: return ''
  }
}

module.exports.getTotals = function(events){
  let groups = [...new Set(events.map(e => e.group.name))];
  let totals = groups.map(g => { 
    return {
      group: g, 
      eventsTotal: 0, 
      visitsTotal: 0, 
      paymentIds: [], 
      paymentsTotal: 0, 
      paymentsTotalSum: 0
    }
  });
  events.forEach(e => {
    let total = totals.find(t => t.group == e.group.name); 
    total.eventsTotal++;
    total.visitsTotal += e.visitors.length;
    e.payments.forEach(p => {
      if (total.paymentIds.includes(p.id)) return;
      total.paymentIds.push(p.id);
      total.paymentsTotal++;
      total.paymentsTotalSum += p.sum;
    });
  });
  return totals;
} 

function sortByTotal(a, b) {
  if (a.total > b.total) return -1;
  if (a.total < b.total) return 1;
  return 0;
}

function sortByIncomesSum(a, b) {
  if (a.incomesSum > b.incomesSum) return -1;
  if (a.incomesSum < b.incomesSum) return 1;
  return 0;
}
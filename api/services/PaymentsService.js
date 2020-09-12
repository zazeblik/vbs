const TransactionType = require('../../enums').TransactionType;
const GroupType = require('../../enums').GroupType;

module.exports.getPaymentSettings = async function(person){
  let personsQuery = {};
  if (person){
    personsQuery.id = person;
  }
  const persons = await Persons.find(personsQuery).sort('name ASC');
  const groups = await Groups.find().populate("members", {select: ["id"]});
  const personals = groups.filter(g => g.type == GroupType.Personal); 
  const events = await Events
    .find({group: personals.map(p => p.id)})
    .populate("visitors")
    .populate("payments");
  const unpayedEvents = {};
  persons.forEach(p => unpayedEvents[p.id] = []);
  events.forEach(event => {
    const visitors = event.visitors;
    const paymentPersons = event.payments.map(p => p.person);
    visitors.forEach(person => {
      if (paymentPersons.includes(person.id)) return;
      unpayedEvents[person.id].push(event); 
    })
  });
  const generals = groups.filter(g => g.type == GroupType.General);
  generals.forEach(group => {
    group.members = group.members.map(m => m.id);  
  });
  personals.forEach(group => {
    group.members = group.members.map(m => m.id);  
  }); 
  return { persons, generals, personals, unpayedEvents };
}

module.exports.getTransactions = async function(person, limit){
  let payments = await Payments.find({ where: { person: person }, limit: limit, sort: "updatedAt DESC"});
  let incomes = await Incomes.find({ where: { person: person }, limit: limit, sort: "updatedAt DESC"});
  payments.forEach(payment => { payment.type =  TransactionType.Payment });
  incomes.forEach(income => { income.type =  TransactionType.Income });
  const transactions = [...payments, ...incomes].sort((a, b) => {
    if (a.updatedAt > b.updatedAt) return -1;
    if (a.updatedAt < b.updatedAt) return 1;
    if (a.updatedAt == b.updatedAt) return 0;
  }).slice(0, limit);
  return transactions;
}

module.exports.createAll = async function (payments){
  let uniquePaymentEvents = [];
  let paymentsToCreate = [];
  payments.forEach(payment => {
    if (!payment.events) {
      paymentsToCreate.push(payment);
      return;
    } 
    const events = p.events;
    let isContainsDublicates = false;
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (!uniquePaymentEvents.includes(event)){
        uniquePaymentEvents.push(event);
      } else {
        isContainsDublicates = true;
        break;
      }
    }
    if (!isContainsDublicates) paymentsToCreate.push(payment);
  });
  await Payments.createEach(paymentsToCreate);
}
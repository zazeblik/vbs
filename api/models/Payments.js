const GetMonthDateRange =  require('../utils/DateRangeHelper').GetMonthDateRange;
const GroupType = require('../../enums').GroupType;

module.exports = {
  attributes: {
    updater: {
      model: 'users'
    },
    person: {
      model: 'persons'
    },
    events: {
      collection: 'events',
      via: 'payments'
    },
    group: {
      model: 'groups',
      required: true
    },
    sum: {
      type: 'number',
      min: 0,
      required: true
    },
    month: {
      type: 'number',
      allowNull: true
    },
    year: {
      type: 'number',
      allowNull: true
    },
    description: {
      type: 'string',
      allowNull: true
    },
    provider: {
      model: 'providers'
    }
  },
  beforeCreate: async function (value, next) {
    try {
      const group = await Groups.findOne({id: value.group, provider: value.provider}).populate("members");
      if (group.type == GroupType.General && value.month && value.year){
        const alreadyExistsPayment = await Payments.findOne({ 
          group: value.group, 
          month: value.month,
          year: value.year,
          person: value.person, 
          provider: value.provider
        });
        if (alreadyExistsPayment != null) {
          return next("Месяц уже оплачен");
        }
        const monthDateRange = GetMonthDateRange(value.year, value.month);
        const events = await Events
          .find({ 
            group: value.group, 
            startsAt: { 
              ">=": monthDateRange.start.valueOf(), 
              "<=": monthDateRange.end.valueOf() 
            }, 
            provider: value.provider
          })
          .sort("startsAt ASC");
        value.events = events.map(e => e.id);
      }
      if (group.type == GroupType.Personal && value.events.length) {
        let paymentEvents = await Events.find({ id: value.events, provider: value.provider }).populate('payments');
        if (paymentEvents.some(x => x.payments.find(p => p.payer == value.person))){
          return next("Занятие уже оплачено. events: " + value.events);
        }
      }
      const person = await Persons.findOne(value.person);
      await Persons.updateOne({ id: person.id, provider: value.provider }).set({ balance: person.balance - value.sum })
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  },
  beforeUpdate: async function (value, next) {
    try {
      const id = value.id;
      const actualPayment = await Payments.findOne(id);
      if (value.sum){
        const person = await Persons.findOne(actualPayment.person);
        const delta = actualPayment.sum - value.sum;
        await Persons.updateOne({ id: person.id, provider: value.provider }).set({ balance: person.balance + delta })
      }
      if (value.person != null && actualPayment.person != value.person) {
        return next("В платеже не должен меняться участник. person: " + value.person);
      }
      if (value.group) {
        if (actualPayment.group != value.group) {
          return next("В платеже не должна меняться группа");
        }
        const group = await Groups.findOne(value.group);
        const actualMonth = actualPayment.month;
        const actualYear = actualPayment.year;
        const newMonth = value.month != null ? value.month : actualMonth;
        const newYear = value.year ? value.year : actualYear;
        const monthChanged = (value.month != null || value.year != null) 
          && (actualMonth != newMonth || actualYear != newYear);
        if (group.type == GroupType.General && monthChanged){
          const alreadyExistsPayment = await Payments.findOne({ 
            group: value.group, 
            month: newMonth,
            year: newYear,
            person: actualPayment.person, 
            provider: value.provider
          });
          if (alreadyExistsPayment != null) {
            return next("Месяц уже оплачен. person: " + value.person);
          }
          const actualDateRange = GetMonthDateRange(actualYear, actualMonth);
          const newDateRange = GetMonthDateRange(newYear, newMonth);
          const eventsToRemove = await Events.find({ 
            group: actualPayment.group, 
            startsAt: { 
              ">=": actualDateRange.start.valueOf(), 
              "<=": actualDateRange.end.valueOf() 
            }, 
            provider: value.provider
          });
          const eventsToAdd = await Events.find({ 
            group: value.group,
            startsAt: { 
              ">=": newDateRange.start.valueOf(), 
              "<=": newDateRange.end.valueOf() 
            },
            provider: value.provider
          })
          await Payments.removeFromCollection(id, "events").members(eventsToRemove.map(p => p.id));
          await Payments.addToCollection(id, "events").members(eventsToAdd.map(p => p.id));
        }
      }
      return next(); 
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  },
  afterDestroy: async function(value, next){
    try {
      const person = await Persons.findOne({id: value.person, provider: value.provider});
      if (person) await Persons.updateOne({id: person.id, provider: value.provider}).set({ balance: person.balance + value.sum });
      return next();  
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  }
};
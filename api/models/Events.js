const GroupType = require('../../enums').GroupType;

module.exports = {
  attributes: {
    group: {
      model: 'groups'
    },
    instructor: {
      model: 'persons'
    },
    startsAt: {
      type: 'number',
      required: true
    },
    duration: {
      type: 'number',
      min: 0,
      required: true
    },
    place: {
      model: 'places',
      required: true
    },
    payments: {
      collection: 'payments',
      via: 'events'
    },
    visitors: {
      collection: 'persons',
      via: 'events'
    }
  },
  beforeCreate: async function (value, next) {
    try {
      const startsDate = new Date(value.startsAt);
      const month = startsDate.getMonth();
      const year = startsDate.getFullYear();
      const payments = await Payments
        .find({ group: value.group, month: month, year: year });
      value.payments = payments.map(p => p.id);
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  },
  beforeUpdate: async function (valueToSet, next) {
    try {
      const id = valueToSet.id;
      const actualEvent = await Events.findOne({id});
      if (valueToSet.group != null && actualEvent.group != valueToSet.group) {
        throw new Error("В событии не должна меняться группа");
      }
      const group = await Groups.findOne(actualEvent.group);
      if (group.type == GroupType.General){
        if (!valueToSet.startsAt) {
          return next();
        }
        const actualStartsDate = new Date(actualEvent.startsAt);
        const startsDate = new Date(valueToSet.startsAt);
        const actualMonth = actualStartsDate.getMonth();
        const actualYear = actualStartsDate.getFullYear();
        const month = startsDate.getMonth();
        const year = startsDate.getFullYear();
        if (actualMonth != month || actualYear != year) {
          const paymentsToRemove = await Payments.find({ group: actualEvent.group, month: actualMonth, year: actualYear });
          const paymentsToAdd = await Payments.find({ group: actualEvent.group, month: month, year: year })
          await Events.removeFromCollection(id, "payments").members(paymentsToRemove.map(p => p.id));
          await Events.addToCollection(id, "payments").members(paymentsToAdd.map(p => p.id));
        }
      }
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  }
};
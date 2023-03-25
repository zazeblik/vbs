const GroupType = require('../../enums').GroupType;

module.exports = {
  attributes: {
    group: {
      model: 'groups',
      required: true
    },
    instructor: {
      model: 'persons',
      required: true
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
    },
    provider: {
      model: 'providers'
    }
  },
  beforeCreate: async function (value, next) {
    try {
      if (await sails.helpers.isAlreadyExistsEvent(value.group, value.startsAt, value.duration, value.provider)) {
        return next(`Занятие в это время уже есть. ${JSON.stringify(value)}`);
      }
      const startsDate = new Date(value.startsAt);
      const month = startsDate.getMonth();
      const year = startsDate.getFullYear();
      const payments = await Payments
      .find({ group: value.group, month: month, year: year, provider: value.provider });
      value.payments = payments.map(p => p.id);
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  },
  beforeUpdate: async function (valueToSet, next) {
    try {
      const id = valueToSet.id;
      const actualEvent = await Events.findOne({id: id, provider: valueToSet.provider});
      if (valueToSet.group != null && actualEvent.group != valueToSet.group) {
        return next("В событии не должна меняться группа");
      }
      const eventTimeChanged = valueToSet.startsAt || valueToSet.duration;
      const isExistsEvent = await sails.helpers.isAlreadyExistsEvent(
        actualEvent.group, 
        valueToSet.startsAt || actualEvent.startsAt,
        valueToSet.duration || actualEvent.duration,
        valueToSet.provider,
        id )
      if (eventTimeChanged && isExistsEvent) {
        return next(`Занятие в это время уже есть. ${JSON.stringify(value)}`);
      }
      const group = await Groups.findOne({id: actualEvent.group, provider: valueToSet.provider});
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
          const paymentsToRemove = await Payments.find({ group: actualEvent.group, month: actualMonth, year: actualYear, provider: valueToSet.provider });
          const paymentsToAdd = await Payments.find({ group: actualEvent.group, month: month, year: year, provider: valueToSet.provider })
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
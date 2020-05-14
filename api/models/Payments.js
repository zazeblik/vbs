const GetMonthDateRange =  require('../utils/DateRangeHelper').GetMonthDateRange;

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
      model: 'groups'
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
  },
  beforeCreate: async function (value, next) {
    if (!value.events.length && value.group && value.month !== null && value.year){
      try {
        const monthDateRange = GetMonthDateRange(value.year, value.month);
        const events = await Events
          .find({ group: value.group, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
          .sort("startsAt ASC");
        value.events = events.map(e => e.id);
      } catch (error) {
        return next();
      }
    }
    return next();
  }
};



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
    } catch (error) {
      return next();
    }
    return next();
  }
};
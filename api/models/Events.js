
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
    payment: {
      model: 'payments'
    },
    visitors: {
      collection: 'persons',
      via: 'events'
    }
  }
};
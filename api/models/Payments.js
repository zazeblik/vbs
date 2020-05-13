module.exports = {
  attributes: {
    person: {
      model: 'persons'
    },
    events: {
      collection: 'events',
      via: 'payment'
    },
    sum: {
      type: 'number',
      min: 0,
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
    description: {
      type: 'string',
      allowNull: true
    },
  },
};


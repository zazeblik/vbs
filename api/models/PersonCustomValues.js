module.exports = {
  attributes: {
    person: {
      model: 'Persons'
    },
    field: {
      model: 'PersonCustomFields'
    },
    value: {
      type: 'string',
      allowNull: true
    },
    provider: {
      model: 'providers'
    }
  },
};


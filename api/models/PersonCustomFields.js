module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true,
      unique: true,
    },
    label: {
      type: 'string',
      required: true,
      unique: true,
    },
    provider: {
      model: 'providers'
    }
  },
  afterDestroy: async function(value, next){
    try {
      await PersonCustomValues.destroy({field: value.id, provider: value.provider}).fetch();
      next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  }
};


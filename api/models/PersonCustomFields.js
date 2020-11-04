module.exports = {
  attributes: {
    name: {
      type: "string",
      required: true,
      unique: true,
    },
    label: {
      type: "string",
      required: true,
      unique: true,
    }
  },
  afterDestroy: async function(value, next){
    try {
      await PersonCustomValues.destroy({field: value.id})
      next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  }
};


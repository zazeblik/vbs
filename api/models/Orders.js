module.exports = {
  attributes: {
    sum: {
      type: "number",
      required: true,
      min: 0
    },
    status: {
      type: "number",
      defaultsTo: 0
    },
    person: {
      model: "persons"
    },
    orderNumber: {
      type: "string",
      allowNull: true
    },
    externalId: {
      type: "string",
      allowNull: true
    },
    formUrl: {
      type: "string",
      allowNull: true
    }
  },
  beforeUpdate: async function (valueToSet, next) {
    try {
      if (valueToSet.status && valueToSet.status == 2) {
        const id = valueToSet.id;
        const order = await Orders.findOne({id});
        if (order.status == 2){
          return next();
        }
        await Incomes.create({person: order.person, order: id, sum: order.sum, online: true, description: "Пополнение баланса онлайн"});
      }
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  }
};


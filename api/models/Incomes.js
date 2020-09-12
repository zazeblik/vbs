module.exports = {
  attributes: {
    updater: {
      model: 'users'
    },
    order: {
      model: 'orders'
    },
    person: {
      model: 'persons',
      required: true
    },
    sum: {
      type: 'number',
      min: 0,
      required: true
    },
    online: {
      type: 'boolean',
      defaultsTo: false
    },
    description: {
      type: 'string',
      defaultsTo: 'Пополнение баланса вручную'
    },
  },
  beforeCreate: async function (value, next) {
    try {
      const person = await Persons.findOne(value.person);
      await Persons.updateOne({ id: person.id }).set({ balance: person.balance + value.sum })
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  },
  beforeUpdate: async function (value, next) {
    try {
      const id = value.id;
      const actualIncome = await Incomes.findOne(id);
      if (value.sum){
        const person = await Persons.findOne(actualIncome.person);
        const delta = value.sum - actualIncome.sum;
        await Persons.updateOne({ id: person.id }).set({ balance: person.balance + delta })
      }
      if (value.person != null && actualIncome.person != value.person) {
        throw new Error("В платеже не должен меняться участник");
      }
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  },
  afterDestroy: async function(value, next){
    try {
      const person = await Persons.findOne(value.person);
      await Persons.updateOne({ id: person.id }).set({ balance: person.balance - value.sum })
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  }
};


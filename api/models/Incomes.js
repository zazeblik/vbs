const IncomeType = require('../../enums').IncomeType

module.exports = {
  attributes: {
    updater: {
      model: 'users'
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
    type: {
      type: 'number',
      isIn: [IncomeType.Electronic, IncomeType.Cash, IncomeType.Other],
      defaultsTo: IncomeType.Cashless
    },
    description: {
      type: 'string',
      allowNull: true
    },
    provider: {
      model: 'providers'
    }
  },
  beforeCreate: async function (value, next) {
    try {
      const person = await Persons.findOne({id: value.person, provider: value.provider});
      await Persons.updateOne({ id: person.id, provider: value.provider }).set({ balance: person.balance + value.sum })
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  },
  beforeUpdate: async function (value, next) {
    try {
      const id = value.id;
      const actualIncome = await Incomes.findOne({id: id, provider: value.provider});
      if (value.sum){
        const person = await Persons.findOne({id: actualIncome.person, provider: value.provider});
        const delta = value.sum - actualIncome.sum;
        await Persons.updateOne({ id: person.id, provider: value.provider }).set({ balance: person.balance + delta })
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
      const person = await Persons.findOne({id: value.person, provider: value.provider});
      if (person) await Persons.updateOne({ id: person.id, provider: value.provider }).set({ balance: person.balance - value.sum })
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  }
};


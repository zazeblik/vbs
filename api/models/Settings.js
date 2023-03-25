const PersonalDebitMode = require('../../enums').PersonalDebitMode;

module.exports = {
  attributes: {
    debitMode: {
      type: "number",
      defaultsTo: PersonalDebitMode.AlwaysAsk
    },
    divideSumMode: {
      type: "boolean",
      defaultsTo: true
    },
    autoOpenPaymentModel: {
      type: "boolean",
      defaultsTo: true
    },
    provider: {
      model: 'providers'
    }
  },
};

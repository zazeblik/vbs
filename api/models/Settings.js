const PersonalDebitMode = require('../../enums').PersonalDebitMode;

module.exports = {
  attributes: {
    name: {
      type: "string",
      required: true
    },
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
    }
  },
};

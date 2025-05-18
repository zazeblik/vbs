module.exports = {
  attributes: {
    autoDebitPersonalEvents: {
      type: "boolean",
      defaultsTo: false
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

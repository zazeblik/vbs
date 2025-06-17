module.exports = {
  attributes: {
    autoDebitPersonalEvents: {
      type: "boolean",
      defaultsTo: false
    },
    autoRefundOnDeletePersonalEvents: {
      type: "boolean",
      defaultsTo: true
    },
    provider: {
      model: 'providers'
    }
  },
};

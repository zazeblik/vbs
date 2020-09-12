const request = require("request-promise");

module.exports = {
  inputs: {
    id: {
      type: 'number',
      required: true
    },
    externalId: {
      type: 'string',
      required: true
    }
  },
  exits: {
    success: {
      outputFriendlyName: 'Status'
    }
  },
  fn: async function (inputs, exits) {
    try {
      const settings = await Settings.findOne(1);
      const isSberCredentialsExists = settings.sberUsername && settings.sberPassword;
      if (!isSberCredentialsExists) return exits.success(null);
      let statusResult = await request({
        url: `${sails.config.sberUrl}${sails.config.checkStatusPath}`,
        qs: {
          userName: settings.sberUsername,
          password: settings.sberPassword,
          orderId: inputs.externalId,
          orderNumber: inputs.id
        },
        json: true
      });
      if (statusResult.errorCode != '0') return exits.status(null);
      return exits.success(statusResult.orderStatus);
    } catch (error) {
      return exits.success(null);
    }
  }
};
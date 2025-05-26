const PaymentsService = require('../services/PaymentsService');

module.exports = {
  settings: async function (req, res) {
    try {
      const settings = await PaymentsService.getPaymentSettings(req.session.User.provider);
      return res.send(settings);
    } catch (error) {
      return res.badRequest(error.message);
    }
  }
}
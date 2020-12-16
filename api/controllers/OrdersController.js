const request = require("request-promise");
const { v4: uuidv4 } = require('uuid');

module.exports = {
  confirm: async function (req, res) {
    try {
      const orderNumber = req.param("orderNumber");
      if (!orderNumber) return res.status(400).send('Необходимо указать orderNumber');
      const order = await Orders.findOne({ orderNumber });
      const status = await sails.helpers.checkOrderStatus(orderNumber, order.externalId);
      if (status == null) return res.status(400).send('Ошибка запроса к сервисам Сбербанк');
      await Orders.updateOne({ id: order.id }, {
        id: order.id,
        status: status
      })
      return res.redirect('/?route=profile');
    } catch (error) {
      return res.badRequest(error.message);
    }
  },
  register: async function (req, res) {
    try {
      const sum = req.param("sum");
      const origin = req.param("origin");
      if (!sum) return res.status(400).send('Необходимо указать sum');
      if (!origin) return res.status(400).send('Необходимо указать origin');
      const person = await Persons.findOne(req.session.User.person);
      const orderNumber = uuidv4().replace(/-/g, '');
      const order = await Orders
        .create({ sum, orderNumber, person: req.session.User.person })
        .fetch();
      const settings = await Settings.findOne(1);
      const isSberCredentialsExists = settings.sberUsername && settings.sberPassword;
      if (!isSberCredentialsExists) return res.status(400).send('Не заполнены данные авторизации в сервисах Сбербанк');
      const result = await request({
        url: `${sails.config.sberUrl}${sails.config.registerPath}`,
        qs: {
          userName: settings.sberUsername,
          password: settings.sberPassword,
          orderNumber: orderNumber,
          amount: order.sum *100,
          returnUrl: `${origin}/orders/confirm?orderNumber=${orderNumber}`,
          description: `${person.name}: пополнение баланса`,
          clientId: person.id
        },
        json:true
      });
      if (result.errorMessage) return res.badRequest(result.errorMessage);
      await Orders.updateOne(
        { orderNumber },
        { id: order.id, externalId: result.orderId, formUrl: result.formUrl });
      return res.send(result.formUrl);
    } catch (error) {
      return res.badRequest(error.message);
    }
  }
};


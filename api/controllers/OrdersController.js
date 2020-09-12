const request = require("request-promise");

module.exports = {
  confirm: async function (req, res) {
    try {
      const orderId = Number(req.param("orderId"));
      if (!orderId) return res.status(400).send('Необходимо указать orderId');
      const order = await Orders.findOne({ id: orderId });
      const status = await sails.helpers.checkOrderStatus(order.id, order.externalId);
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
      const order = await Orders
        .create({ sum, person: req.session.User.person })
        .fetch();
      const settings = await Settings.findOne(1);
      const isSberCredentialsExists = settings.sberUsername && settings.sberPassword;
      if (!isSberCredentialsExists) return res.status(400).send('Не заполнены данные авторизации в сервисах Сбербанк');
      const result = await request({
        url: `${sails.config.sberUrl}${sails.config.registerPath}`,
        qs: {
          userName: settings.sberUsername,
          password: settings.sberPassword,
          orderNumber: order.id,
          amount: order.sum *100,
          returnUrl: `${origin}/orders/confirm?orderId=${order.id}`,
          description: `${person.name}: пополнение баланса`,
          clientId: person.id
        },
        json:true
      });
      if (result.errorMessage) return res.status(400).send(result.errorMessage);
      await Orders.updateOne(
        { id: order.id },
        { id: order.id, externalId: result.orderId, formUrl: result.formUrl });
      return res.send(result.formUrl);
    } catch (error) {
      return res.badRequest(error.message);
    }
  }
};


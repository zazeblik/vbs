const Role = require('../enums').Role

module.exports.bootstrap = async function() {
  if (await Users.count() > 0) {
    return;
  }
  await Users.create({ login: 'admin', password: 'Qa1Ws2Ed3Rf4', role: Role.SystemAdmin})
};

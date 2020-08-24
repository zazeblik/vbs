const Role = require('../enums').Role

module.exports.bootstrap = async function() {
  if (await Users.count() == 0) {
    await Users.create({ login: 'admin', password: 'Qa1Ws2Ed3Rf4', role: Role.LocalAdmin })
  }
  if (await Settings.count() == 0) {
    await Settings.create({ name: 'Школа танцев', subtitle: 'Красота Движение Здоровье' })
  }
};

const Role = require('../enums').Role;
const GroupType = require('../enums').GroupType;
const SalaryRuleType = require('../enums').SalaryRuleType;
const B12MigrationUtil = require('../api/utils/B12MigrationUtil');

module.exports.bootstrap = async function() {
  if (await Users.count() == 0) {
    await Users.create({ login: 'admin', password: 'Qa1Ws2Ed3Rf4', role: Role.LocalAdmin })
  }
  if (await Settings.count() == 0) {
    await Settings.create({ name: 'Школа танцев', subtitle: 'Красота Движение Здоровье' })
  }
  if (await Places.count() == 0) {
    await Places.create({ name: 'Стандартный', color: '#00e1ff' })
  }
  if (await SalaryRules.count({ group: null, instructor: null, forGroupType: GroupType.Personal }) == 0) {
    await SalaryRules.create({ value: 50, type: SalaryRuleType.Percentage, forGroupType: GroupType.Personal })
  }
  if (await SalaryRules.count({ group: null, instructor: null, forGroupType: GroupType.General }) == 0) {
    await SalaryRules.create({ value: 50, type: SalaryRuleType.Precentage, forGroupType: GroupType.General })
  }
  //await B12MigrationUtil.MigratePersonsAndGroups();
};

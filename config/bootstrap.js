const Role = require('../enums').Role;
const GroupType = require('../enums').GroupType;
const SalaryRuleType = require('../enums').SalaryRuleType;
const B12MigrationUtil = require('../api/utils/B12MigrationUtil');

module.exports.bootstrap = async function() {
  
  if (await Providers.count() == 0) {
    const provider = await Providers.create({ name: 'main' }).fetch();
    if (await Users.count() == 0) {
      await Users.create({ login: 'admin', password: 'Qa1Ws2Ed3Rf4', role: Role.LocalAdmin, provider: provider.id })
    }
    if (await Settings.count() == 0) {
      await Settings.create({ provider: provider.id })
    }
    if (await SalaryRules.count({ group: null, instructor: null, forGroupType: GroupType.Personal }) == 0) {
      await SalaryRules.create({ 
        value: 50, 
        type: SalaryRuleType.Percentage, 
        forGroupType: GroupType.Personal, 
        provider: provider.id 
      })
    }
    if (await SalaryRules.count({ group: null, instructor: null, forGroupType: GroupType.General }) == 0) {
      await SalaryRules.create({ 
        value: 50, 
        type: SalaryRuleType.Precentage, 
        forGroupType: GroupType.General, 
        provider: provider.id 
      })
    }
  }
  //await B12MigrationUtil.MigratePersonsAndGroups(1);
};

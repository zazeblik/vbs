const { Role, SalaryRuleType, GroupType } = require("../../enums");

module.exports = {
  create: async function (req, res) {
    if (!req.param("name")) return res.status(400).send("name не указан");
    const name = req.param("name");
    const provider = await Providers.create({ name: name }).fetch();
    await Users.create({ login: `admin${provider.id}`, password: `password${provider.id}`, role: Role.LocalAdmin, provider: provider.id })
    await Settings.create({ provider: provider.id })
    await Instructors.create({ name: 'Тренер по-умолчанию', color: '#00e1ff', provider: provider.id })
    await SalaryRules.create({ 
      value: 50, 
      type: SalaryRuleType.Percentage, 
      forGroupType: GroupType.Personal, 
      provider: provider.id 
    })
    await SalaryRules.create({ 
      value: 50, 
      type: SalaryRuleType.Precentage, 
      forGroupType: GroupType.General, 
      provider: provider.id 
    })
    return res.ok({ login: `admin${provider.id}`, password: `password${provider.id}`})
  }
}
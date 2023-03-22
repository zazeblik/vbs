const Role = require('../enums').Role;
const GroupType = require('../enums').GroupType;
const SalaryRuleType = require('../enums').SalaryRuleType;
const GroupMemberActionType = require('../enums').GroupMemberActionType;
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
  const groups = await Groups.find({}).populate('members');
  const actions = await GroupMemberActions.find({type: GroupMemberActionType.Added});
  let actionsToCreate = [];
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const members = group.members;
    for (let j = 0; j < members.length; j++) {
      const member = members[j];
      if (!actions.some(x => x.group == group.id && x.person == member.id && x.type == GroupMemberActionType.Added)){
        actionsToCreate.push({
          group: group.id, 
          person: member.id, 
          type: GroupMemberActionType.Added, 
          createdAt: group.createdAt > member.createdAt ? group.createdAt : member.createdAt
        })
      }
    }
  }
  await GroupMemberActions.createEach(actionsToCreate);
  await B12MigrationUtil.MigratePersonsAndGroups();
};

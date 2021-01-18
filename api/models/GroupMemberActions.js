const GroupMemberActionType = require('../../enums').GroupMemberActionType;

module.exports = {
  attributes: {
    group: {
      model: 'groups'
    },
    person: {
      model: 'persons'
    },
    type: {
      type: 'number',
      isIn: [GroupMemberActionType.Added, GroupMemberActionType.Deleted]
    }
  }
};


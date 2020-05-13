const Role = require('../../enums').Role;

module.exports = {
  attributes: {
    login: {
      type: 'string',
      isNotEmptyString: true,
      required: true
    }, 
    password: {
      type: 'string',
      custom: function(value) {
        return _.isString(value) && value.length >= 8 && value.match(/[a-z]/i) && value.match(/[0-9]/);
      },
      encrypt: true
    },
    role: {
      type: 'number',
      isIn: [Role.User, Role.Coach, Role.LocalAdmin, Role.SystemAdmin],
      defaultsTo: 0
    },
    person: {
      model: 'persons'
    }
  },
  customToJSON: function() {
    return _.omit(this, ['createdAt', 'updatedAt', 'person', 'password'])
  }
};


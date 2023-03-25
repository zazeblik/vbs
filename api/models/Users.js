const Role = require('../../enums').Role;

module.exports = {
  attributes: {
    login: {
      type: 'string',
      isNotEmptyString: true,
      required: true,
      unique: true
    }, 
    password: {
      type: 'string',
      required: true,
      custom: function(value) {
        return _.isString(value) && value.length >= 8 && value.match(/^([A-Za-z0-9_-]+)$/);
      },
      encrypt: true
    },
    role: {
      type: 'number',
      isIn: [Role.Coach, Role.LocalAdmin],
      defaultsTo: 0
    },
    provider: {
      model: 'providers'
    }
  },
  beforeDestroy: async function(value, next){
    try {
      const actualAdminsCount = await Users.count({role: Role.LocalAdmin, provider: value.provider});
      if (value.where && value.where.id && value.where.id.in){
        const usersToDelete = await Users.find({id: value, provider: value.provider});
        const adminsToDeleteCount = usersToDelete.filter(x => x.role == Role.LocalAdmin).length;
        if (adminsToDeleteCount >= actualAdminsCount){
          return next('Должен остаться хотябы 1 администратор');
        }
      }
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  },
  customToJSON: function() {
    return _.omit(this, ['createdAt', 'updatedAt', 'password'])
  }
};


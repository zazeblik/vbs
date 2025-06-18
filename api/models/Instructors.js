module.exports = {
  attributes: {
    name: {
      type: 'string',
      isNotEmptyString: true,
      required: true
    },
    prices: {
      type: 'json',
      custom: function(value) {
        if (!Array.isArray(value)) return false;
        if (value.length == 0) return false;
        if (!value.every(x => x.price > 0)) return false;
        return true;
      }
    },
    color: {
      type: 'string',
      isNotEmptyString: true,
      isHexColor: true,
      defaultsTo: '#00e1ff'
    },
    groups: {
      collection: 'groups',
      via: 'defaultInstructor'
    },
    events: {
      collection: 'events',
      via: 'instructor'
    },
    provider: {
      model: 'providers'
    }
  },
  beforeDestroy: async function(value, next){
    try {
      if (value.where && value.where.and && value.where.and.length){
        const params = value.where.and;
        const ids = params.find(x => x.id)?.id?.in;
        const provider = params.find(x => x.provider)?.provider;
        if (ids && ids.length && provider) {
          const groupsOfInstructors = await Groups.find({defaultInstructor: ids, provider: provider});
          if (groupsOfInstructors.length){
            return next(`Сначала необходимо поменять тренера в группах (${groupsOfInstructors.map(x => x.name)})`);
          }
          const eventsOfInstructors = await Events.find({instructor: ids, provider: provider});
          if (eventsOfInstructors.length){
            return next(`Сначала необходимо удалить занятия, где участник является тренером`);
          }
          const usersOfInstructors = await Users.find({instructor: ids, provider: provider});
          if (usersOfInstructors.length){
            return next(`Сначала необходимо заменить тренера у пользователей`);
          }
        }
      }
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  },
};
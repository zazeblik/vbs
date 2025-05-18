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
      required: true
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
      if (value.where && value.where.id && value.where.id.in){
        const groupsOfInstructors = await Groups.find({defaultInstructor: value.where.id.in, provider: value.provider});
        if (groupsOfInstructors.length){
          return next(`Сначала необходимо поменять тренера в группах (${groupsOfInstructors.map(x => x.name)})`);
        }
        const eventsOfInstructors = await Events.find({instructor: value.where.id.in, provider: value.provider});
        if (eventsOfInstructors.length){
          return next(`Сначала необходимо удалить занятия, где участник является тренером`);
        }
      }
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  },
};
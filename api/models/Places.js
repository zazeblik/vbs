module.exports = {
  attributes: {
    name: {
      type: 'string',
      isNotEmptyString: true,
      required: true
    },
    color: {
      type: 'string',
      isNotEmptyString: true,
      isHexColor: true,
      required: true
    },
    groups: {
      collection: 'groups',
      via: 'defaultPlace'
    },
    events: {
      collection: 'events',
      via: 'place'
    },
    provider: {
      model: 'providers'
    }
  },
  beforeDestroy: async function(value, next){
    try {
      const actualPlacesCount = await Places.count({provider: value.provider});
      if (value.where && value.where.id && value.where.id.in){
        const groupsOfPlaces = await Groups.find({defaultPlace: value.where.id.in, provider: value.provider});
        if (groupsOfPlaces.length){
          return next(`Сначала необходимо поменять зал в группах (${groupsOfPlaces.map(x => x.name)})`);
        }
        const eventsOfPlaces = await Events.find({place: value.where.id.in, provider: value.provider});
        if (eventsOfPlaces.length){
          return next(`Сначала необходимо удалить занятия, где указан выбранный зал`);
        }
        if (value.where.id.in.length >= actualPlacesCount || actualPlacesCount == 1){
          return next(`Хотябы 1 зал должен остаться`);
        }
      }
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  }
};


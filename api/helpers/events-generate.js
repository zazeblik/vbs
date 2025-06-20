module.exports = {
  inputs: {
    time: {
      type: 'number',
      required: true
    },
    provider: {
      type: 'number',
      allowNull: true
    }
  },
  fn: async function (params) {
    if (params.provider != null) {
      await generateForProvider(params);
    } else {
      const providers = await Providers.find();
      for (let i = 0; i < providers.length; i++) {
        const provider = providers[i];
        await generateForProvider({time: params.time, provider: provider.id}) 
      }
    }
    
  }
};

function daysInMonth(month, year) {
  return 32 - new Date(year, month, 32).getDate();
}

async function generateForProvider(params) {
  try {
    let date = new Date(params.time);
    let groups = await Groups.find({ schedule: { '!=': '' }, provider: params.provider });
    groups = groups.filter(x => x.defaultInstructor != null);
    let currentDate = date.getDate();
    let monthsDays = daysInMonth(date.getMonth(), date.getFullYear());
    let timeZoneOffset = sails.config.tz ? -1 * sails.config.tz : 0; 
    let eventsToAdd = [];
    for (let j = currentDate; j <= monthsDays; j++) {
      let currentMonthDate = new Date(date.getFullYear(), date.getMonth(), j);
      let day = currentMonthDate.getDay();
      for (var i = 0; i < groups.length; i++) {
        let group = groups[i];
        let weekDayTimes = group.schedule.split(",");
        let schedule = {};
        weekDayTimes.forEach(weekDayTime => {
          let weekDay = weekDayTime.split(" ")[0];
          let dayTime = weekDayTime.split(" ")[1];
          if (!schedule[weekDay]) schedule[weekDay] = {times: []};
          schedule[weekDay].times.push(dayTime)
        });
        if (schedule[day] && group.defaultDuration) {
          for (let i = 0; i < schedule[day].times.length; i++) {
            const time = schedule[day].times[i];
            let event = {
              group: group.id,
              description: "Создано автоматически", 
              provider: params.provider
            };
            event.instructor = group.defaultInstructor;
            let hours = time.split(":")[0];
            let minutes = time.split(":")[1];
            let startsAt = new Date(
              currentMonthDate.getFullYear(),
              currentMonthDate.getMonth(),
              currentMonthDate.getDate(),
              Number(hours),
              Number(minutes)
            );
            startsAt.setHours(startsAt.getHours() + timeZoneOffset);
            event.startsAt = startsAt.getTime();
            event.duration = group.defaultDuration;
            const isAlreadyExists = await sails.helpers.isAlreadyExistsEvent(
              event.group, 
              event.startsAt,
              event.duration,
              params.provider,
              event.instructor);
            if (!isAlreadyExists) eventsToAdd.push(event); 
          }
        }
      }
    }
    if (eventsToAdd.length) await Events.createEach(eventsToAdd);
  } catch (error) {
    console.log(error)
  }
}
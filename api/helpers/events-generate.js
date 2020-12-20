module.exports = {
  inputs: {
    time: {
      type: 'number',
      required: true
    }
  },
  fn: async function (params) {
    try {
      let date = new Date(params.time);
      let groups = await Groups.find({ schedule: { '!=': '' } });
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
            let place = weekDayTime.split(" ")[2];
            schedule[weekDay] = {
              time: dayTime,
              place: place ? Number(place) : group.defaultPlace
            }
          });
          if (schedule[day] && group.defaultDuration) {
            let event = {
              group: group.id,
              place: schedule[day].place,
              description: "Создано автоматически"
            };
            if (group.defaultInstructor) event.instructor = group.defaultInstructor;
            let hours = schedule[day].time.split(":")[0];
            let minutes = schedule[day].time.split(":")[1];
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
              event.duration);
            if (!isAlreadyExists) eventsToAdd.push(event);
          }
        }
      }
      if (eventsToAdd.length) await Events.createEach(eventsToAdd);
    } catch (error) {
      console.log(error)
    }
  }
};

function daysInMonth(month, year) {
  return 32 - new Date(year, month, 32).getDate();
}
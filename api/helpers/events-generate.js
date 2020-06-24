module.exports = {
  inputs: {
    time: {
      type: 'number',
      required: true
    }
  },
  fn: async function (params) {
    let date = new Date(params.time);
    let groups = await Groups.find({ schedule: { '!=': '' } });
    let currentDate = date.getDate();
    let monthsDays = daysInMonth(date.getMonth(), date.getFullYear());
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
          schedule[weekDay] = dayTime;
        });
        if (schedule[day] && group.defaultDuration) {
          let event = {
            group: group.id,
            description: "Создано автоматически"
          };
          if (group.defaultPlace) event.place = group.defaultPlace;
          if (group.defaultInstructor) event.instructor = group.defaultInstructor;
          let hours = schedule[day].split(":")[0];
          let minutes = schedule[day].split(":")[1];
          let startsAt = new Date(
            currentMonthDate.getFullYear(),
            currentMonthDate.getMonth(),
            currentMonthDate.getDate(),
            Number(hours),
            Number(minutes)
          );
          event.startsAt = startsAt.getTime();
          event.duration = group.defaultDuration;
          try {
            await Events.create(event);
          } catch (error) {
            console.log(error)
          }
        }
      }
    }
  }
};

function daysInMonth(month, year) {
  return 32 - new Date(year, month, 32).getDate();
}
const timeZoneOffset = sails.config.tz ? -1 * sails.config.tz : 0;
module.exports.GetDate = function (year = 0, month = 0, date = 0, hours = 0, minutes = 0, seconds = 0, miliseconds = 0){
  let date = year ? new Date(year, month, date, hours, minutes, seconds, miliseconds) : new Date();
  date.setHours(date.getHours() + timeZoneOffset);
  return date;
}
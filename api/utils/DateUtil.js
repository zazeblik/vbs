module.exports.GetDate = function (year = 0, month = 0, date = 0, hours = 0, minutes = 0, seconds = 0, miliseconds = 0){
  const timeZoneOffset = sails.config.tz ? -1 * sails.config.tz : 0;
  let d = year ? new Date(year, month, date, hours, minutes, seconds, miliseconds) : new Date();
  d.setHours(d.getHours() + timeZoneOffset);
  return d;
}
const moment = require('moment');

module.exports.GetMonthDateRange = function(year, month) {
    const startDate = moment([year, month]);
    const endDate = moment(startDate).endOf('month');
    return { start: startDate, end: endDate };
}

module.exports.GetDateRange = function(date) {
    const startDate = moment(date).startOf('date');
    const endDate = moment(date).endOf('date');
    return { start: startDate, end: endDate };
}
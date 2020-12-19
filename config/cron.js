const GetDate = require('../api/utils/DateUtil').GetDate;
module.exports.cron = {
    Job: {
      schedule: '0 0 0 1 * *',
      onTick: async function () {
        sails.log("Create events");
        await sails.helpers.eventsGenerate(GetDate());
      }
    }
  };
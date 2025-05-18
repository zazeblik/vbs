module.exports.cron = {
    generateEventsTask: {
      schedule: '0 0 0 1 * *',
      onTick: async function () {
        sails.log("Create events");
        await sails.helpers.eventsGenerate(Date.now());
      }
    },
    autoDebitsTask: {
      schedule: '0 0 0 * * *',
      onTick: async function () {
        sails.log("Auto debits");
        await sails.helpers.autoDebit();
      }
    },
  };
const { GroupType } = require("../../enums");
const moment = require('moment');
moment.locale('ru'); 

module.exports = {
  inputs: {
    provider: {
      type: 'number',
      allowNull: true
    },
    group: {
      type: 'number',
      allowNull: true
    },
  },
  fn: async function (params) {
    if (params.group != null) {
      const group = await Groups.findOne({
        select: ["id","name", "provider"], 
        where: {
          id: params.group
        }
      });
      const persons = await Persons
        .find({
          select: ["id", "balance"], 
          where: {
            provider: group.provider 
          }
        })
        .sort('balance DESC');
      const instructors = await Instructors
        .find({
          select: ["id", "prices"], 
          where: {
            provider: group.provider
          }
        });
      await autoDebitForGroup(group, persons, instructors);
    } else if (params.provider != null) {
      await autoDebitForProvider(params.provider);
    } else {
      const settings = await Settings.find({autoDebitPersonalEvents: true});
      const providers = settings.map(x => x.provider);
      for (let i = 0; i < providers.length; i++) {
        const provider = providers[i];
        await autoDebitForProvider(provider.id) 
      }
    }  
  }
};

async function autoDebitForProvider(providerId) {
  const persons = await Persons
    .find({
      select: ["id", "balance"], 
      where: {
        provider: providerId
      }
    })
    .sort('balance DESC');
  const instructors = await Instructors
    .find({
      select: ["id", "prices"], 
      where: {
        provider: providerId
      }
    });
  const groups = await Groups.find({
    select: ["id","name"], 
    where: {
      provider: providerId,
      type: GroupType.Personal
    }
  });
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    await autoDebitForGroup(group, persons, instructors);
  }
}

async function autoDebitForGroup(group, persons, instructors) {
  const groupId = group.id;
  const events = await Events.find({group: groupId})
    .populate("visitors", {select: ["id"]})
    .populate("payments", {select: ["id", "person", "sum"]})
    .sort('startsAt ASC');;
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const eventVisitorIds = event.visitors.map(x => x.id);
    const eventPayerIds = event.payments.map(x => x.person);
    const instructor = instructors.find(i => i.id == event.instructor);
    const prices = instructor.prices;
    const countPrice = prices.find(x => x.count == event.visitors.length) || prices[prices.length - 1];
    const sum = countPrice.price;
    const visiorsToCreatePayments = eventVisitorIds
      .filter(v => !eventPayerIds.includes(v) && persons.find(p => p.id == v).balance >= sum);
    const paymentsToCreate = visiorsToCreatePayments.map(v => {
      return {
        person: v,
        provider: event.provider,
        events: [event.id],
        group: groupId,
        sum: sum,
        description: `Посещение ${group.name} ${moment(event.startsAt).format("DD.MM")}`
      }
    });
    for (let i = 0; i < paymentsToCreate.length; i++) {
      const payment = paymentsToCreate[i];
      await Payments.create(payment).fetch();;
      persons.find(p => p.id == payment.person).balance -= payment.sum;
    }
  }
}
module.exports = {
  inputs: {
    group: {
      type: 'number',
      required: true
    },
    startsAt: {
      type: 'number',
      required: true
    },
    duration: {
      type: 'number',
      required: true
    },
    excludeId: {
      type: 'number',
      allowNull: true
    }
  },
  exits: {
    success: {
      outputFriendlyName: 'Result'
    }
  },
  fn: async function (inputs, exits) {
    let query = {
      group: inputs.group,
      startsAt: { ">=": inputs.startsAt, "<": inputs.startsAt + inputs.duration * 60 * 1000 }
    };
    if (inputs.excludeId) {
      query.id = { "!=": inputs.excludeId };
    }
    const alreadyExistsCount = await Events.count(query);
    return exits.success(!!alreadyExistsCount);
  }
};
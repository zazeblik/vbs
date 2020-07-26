const SiteBlock = require('../../enums').SiteBlock

module.exports = {
  attributes: {
    name: {
      type: 'string',
      isNotEmptyString: true,
      required: true
    },
    image: {
      type: 'string'
    },
    content: {
      type: 'string'
    },
    priority: {
      type: 'number',
      defaultsTo: 1
    },
    public: {
      type: 'boolean', 
      defaultsTo: true
    },
    onMain: {
      type: 'boolean', 
      defaultsTo: false
    },
    block: {
      type: 'number',
      defaultsTo: SiteBlock.Unset,
      isIn: [SiteBlock.Unset, SiteBlock.Articles, SiteBlock.Boss, SiteBlock.Club, SiteBlock.Feedback, SiteBlock.Сourse]
    },
  },
};


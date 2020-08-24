const SiteBlock = require('../../enums').SiteBlock

module.exports = {
  attributes: {
    name: {
      type: 'string',
      isNotEmptyString: true,
      required: true
    },
    image: {
      type: 'string',
      allowNull: true
    },
    content: {
      type: 'string',
      columnType: 'LONGTEXT CHARACTER SET utf8mb4',
      allowNull: true
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
      isIn: [SiteBlock.Unset, SiteBlock.Articles, SiteBlock.Boss, SiteBlock.Club, SiteBlock.Feedback, SiteBlock.Сourse, SiteBlock.Contacts]
    },
  },
  beforeCreate: async function (value, next) {
    if (value.content) {
      value.content = encodeURI(value.content);
    }
    return next();
  },
  beforeUpdate: async function (valueToSet, next) {
    if (valueToSet.content) {
      valueToSet.content = encodeURI(valueToSet.content);
    }
    return next();
  },
  customToJSON: function() {
    this.content = decodeURI(this.content);
    return this;
  }
};


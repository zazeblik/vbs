const fs = require('fs');
const { exec } = require('child_process');

module.exports = {
  attributes: {
    name: {
      type: "string",
      required: true
    },
    logo: {
      type: "string"
    },
    replaceName: {
      type: "boolean",
      defaultsTo: false
    },
    subtitle: {
      type: "string"
    },
    phone: {
      type: "string"
    },
    email: {
      type: "string"
    },
    fullName: {
      type: "string"
    },
    vk: {
      type: "string"
    },
    vkGroupId: {
      type: "number",
      allowNull: true
    },
    fb: {
      type: "string"
    },
    instagram: {
      type: "string"
    },
    marimedia: {
      type: "string"
    },
    marimedia: {
      type: "string"
    },
    sberUsername: {
      type: "string"
    },
    sberPassword: {
      type: "string"
    }
  },
  beforeCreate: async function (value, next) {
    try {
      if (value.name){
        fs.writeFileSync('frontend/portal.config.json', JSON.stringify({title: value.name}, null, 2));
        exec('cd frontend && npm run build');	
      }
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  },
  beforeUpdate: async function (value, next) {
    try {
      if (value.name){
        fs.writeFileSync('frontend/portal.config.json', JSON.stringify({title: value.name}, null, 2));
        exec('cd frontend && npm run build');
      }
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  }
};


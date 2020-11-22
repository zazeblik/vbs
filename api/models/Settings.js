const fs = require('fs');

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
        let htmlString = fs.readFileSync('assets/index.html', 'utf-8');
        htmlString = htmlString.replace(/<title>.+<\/title>/i, `<title>${value.name}</title>`);
        fs.writeFileSync('assets/index.html', htmlString, 'utf-8');
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
        let htmlString = fs.readFileSync('assets/index.html', 'utf-8');
        htmlString = htmlString.replace(/<title>.+<\/title>/i, `<title>${value.name}</title>`);
        fs.writeFileSync('assets/index.html', htmlString, 'utf-8');
      }
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  }
};


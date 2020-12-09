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
    description: {
      type: "string"
    },
    keywords: {
      type: "string"
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
  beforeCreate: updateHandler,
  beforeUpdate: updateHandler
};

async function updateHandler(value, next) {
  try {
    if (value.name || value.keywords || value.description) {
      let portalConfig  = fs.existsSync('frontend/portal.config.json') ? require('../../frontend/portal.config.json') : {};
      let htmlString = fs.readFileSync('assets/index.html', 'utf-8');
      if (value.name){
        portalConfig.title = value.name;
        htmlString = htmlString.replace(/<title>.+<\/title>/i, `<title>${value.name}</title>`);
      }
      if (value.keywords) {
        portalConfig.keywords = value.keywords;
        htmlString = htmlString.replace(/<meta name="keywords" content=".+" \/>/i, `<meta name="keywords" content="${value.keywords}" />`);
      }
      if (value.description) {
        portalConfig.description = value.description;
        htmlString = htmlString.replace(/<meta name="description" content=".+" \/>/i, `<meta name="description" content="${value.description}" />`);
      }
      fs.writeFileSync('frontend/portal.config.json', JSON.stringify(portalConfig, null, 2));
      fs.writeFileSync('assets/index.html', htmlString, 'utf-8');
    }
    return next();
  } catch (error) {
    return next(JSON.stringify([ error ]));
  }
}

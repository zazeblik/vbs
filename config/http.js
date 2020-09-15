module.exports.http = {
  middleware: {
    order: [
      'cookieParser',
      'session',
      'bodyParser',
      'compress',
      'poweredBy',
      'router',
      'www',
      'favicon',
    ],
    bodyParser: require('skipper')({ strict: true, limit: 52428800 })
  }
};

module.exports.session = {

  /***************************************************************************
  *                                                                          *
  * Session secret is automatically generated when your new app is created   *
  * Replace at your own risk in production-- you will invalidate the cookies *
  * of your users, forcing them to log in again.                             *
  *                                                                          *
  ***************************************************************************/
  secret: '3a71674ff0f53e306692a068f717c3ac',
  adapter: 'connect-mysql',
  config: {
    user: 'root', 
    password: 'Qa1Ws2Ed3Rf4', 
    database: 'vbs',
  },
  table: 'sessions',
};

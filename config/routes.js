module.exports.paths = {
  public: __dirname+'/../assets' // or wherever
}
module.exports.routes = {
  '/auth': '/?route=auth',
  '/articles': '/?route=articles',
  '/photo': '/?route=photo',
  '/tournaments': '/?route=tournaments',
  '/boss': '/?route=boss',
  '/places': '/?route=places',
  '/feedback': '/?route=feedback',
  '/contacts': '/?route=contacts',
  '/instructors': '/?route=instructors',
  '/groups': '/?route=groups',
  '/schedule': '/?route=schedule',
  '/persons/edit/:id': 'PersonsController.edit',
  '/archivepersons/edit/:id': 'ArchivePersonsController.edit',
  '/places/edit/:id': 'PlacesController.edit',
  '/groups/edit/:id': 'GroupsController.edit',
  '/groups/delete/:id': 'GroupsController.delete',
  '/groups/sheet/:id': 'GroupsController.sheet',
  '/groups/detail/:id': 'GroupsController.detail',
  '/groups/instructor-detail/:id': 'GroupsController.instructorDetail',
  '/groups/instructor-groups/:id': 'GroupsController.instructorGroups',
  '/groups/instructor-schedule-events/:id': 'GroupsController.instructorScheduleEvents',
  '/groups/add-person/:id': 'GroupsController.addPerson',
  '/groups/remove-person/:id': 'GroupsController.removePerson',
  '/events/edit/:id': 'EventsController.edit',
  '/events/delete/:id': 'EventsController.delete',
  '/events/add-visitor/:id': 'EventsController.addVisitor',
  '/events/remove-visitor/:id': 'EventsController.removeVisitor',
  '/payments/edit/:id': 'PaymentsController.edit',
  '/payments/delete/:id': 'PaymentsController.delete',
  '/payments/create-all': 'PaymentsController.createAll',
  '/payments/group-unpayed-events': 'PaymentsController.groupUnpayedEvents',
  '/incomes/edit/:id': 'IncomesController.edit',
  '/incomes/delete/:id': 'IncomesController.delete',
  '/dashboard/month-info': 'DashboardController.monthInfo',
  '/dashboard/create-month-events': 'DashboardController.createMonthEvents',
  '/cp*': function(req, res) {
    return res.redirect('/?route=' + req.url.substr(1))
  }
};

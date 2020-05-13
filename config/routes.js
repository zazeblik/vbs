module.exports.paths = {
  public: __dirname+'/../assets' // or wherever
}
module.exports.routes = {
  '/auth': '/?route=auth',
  '/persons/edit/:id': 'PersonsController.edit',
  '/places/edit/:id': 'PlacesController.edit',
  '/groups/edit/:id': 'GroupsController.edit',
  '/groups/delete/:id': 'GroupsController.delete',
  '/groups/sheet/:id': 'GroupsController.sheet',
  '/groups/detail/:id': 'GroupsController.detail',
  '/groups/add-person/:id': 'GroupsController.addPerson',
  '/groups/remove-person/:id': 'GroupsController.removePerson',
  '/events/edit/:id': 'EventsController.edit',
  '/events/delete/:id': 'EventsController.delete',
  '/events/add-visitor/:id': 'EventsController.addVisitor',
  '/events/remove-visitor/:id': 'EventsController.removeVisitor',
  '/cp*': function(req, res) {
    return res.redirect('/?route=' + req.url.substr(1))
  }
};

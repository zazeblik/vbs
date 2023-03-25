module.exports.policies = {
  users: {
    '*': ['authenticated', 'isAdmin'],
    authenticated: 'authenticated'
  },
  persons: {
    '*': ['authenticated', 'isControlPanelAvailable'],
  },
  groups: {
    '*': ['authenticated', 'isControlPanelAvailable'],
  },
  places: {
    '*': ['authenticated', 'isControlPanelAvailable'],
  },
  settings: {
    '*': ['authenticated', 'isAdmin'],
    get: 'authenticated'
  },
  providers: {
    '*': 'withApiToken'
  },
  salaryRules: {
    '*': ['authenticated', 'isControlPanelAvailable']
  },
  events: {
    '*': ['authenticated', 'isControlPanelAvailable']
  },
  incomes: {
    '*': ['authenticated', 'isControlPanelAvailable']
  },
  reports: {
    '*': ['authenticated', 'isAdmin']
  },
  payments: {
    '*': ['authenticated', 'isControlPanelAvailable'],
  },
  dashboard: {
    '*': ['authenticated', 'isControlPanelAvailable']
  },
};

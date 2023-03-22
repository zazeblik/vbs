module.exports.policies = {
  users: {
    '*': ['authenticated', 'isAdmin'],
    authenticated: 'authenticated'
  },
  persons: {
    '*': ['authenticated', 'isControlPanelAvailable'],
    fields: true,
    find: true
  },
  groups: {
    '*': ['authenticated', 'isControlPanelAvailable'],
    generalDefaultInstructors: true,
    find: true
  },
  places: {
    '*': ['authenticated', 'isControlPanelAvailable'],
    materials: true,
    find: true
  },
  settings: {
    '*': ['authenticated', 'isAdmin'],
    get: true
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
    selfGroupUnpayedEvents: ['authenticated', 'hasPerson'],
    selfSettings: ['authenticated', 'hasPerson'],
    selfTransactions: ['authenticated', 'hasPerson'],
    selfCreateAll: ['authenticated', 'hasPerson']
  },
  dashboard: {
    '*': ['authenticated', 'isControlPanelAvailable']
  },
};

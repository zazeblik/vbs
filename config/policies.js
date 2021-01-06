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
  archivePersons: {
    '*': ['authenticated', 'isControlPanelAvailable']
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
  orders: {
    '*': false,
    register: ['authenticated', 'hasPerson'],
    confirm: ['authenticated', 'hasPerson']
  },
  materials: {
    '*': ['authenticated', 'isAdmin'],
    find: true,
    findOne: true
  },
  files: {
    '*': ['authenticated', 'isControlPanelAvailable'],
    upload: ['authenticated', 'isAdmin'],
    find: true
  },
  site: {
    '*': ['authenticated', 'isAdmin'],
    profile: 'authenticated',
    profilePerson: ['authenticated', 'hasPerson'],
    selfSchedule: ['authenticated', 'hasPerson'],
    person: ['authenticated', 'hasPerson'],
    uploads: true,
    groups: true,
    publicSchedule: true,
    settings: true
  }
};

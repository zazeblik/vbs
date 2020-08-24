module.exports.policies = {
  users: {
    '*': ['authenticated', 'isControlPanelAvailable'],
    authenticated: 'authenticated'
  },
  persons: {
    '*': ['authenticated', 'isControlPanelAvailable'],
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
  events: {
    '*': ['authenticated', 'isControlPanelAvailable']
  },
  incomes: {
    '*': ['authenticated', 'isControlPanelAvailable']
  },
  payments: {
    '*': ['authenticated', 'isControlPanelAvailable']
  },
  dashboard: {
    '*': ['authenticated', 'isControlPanelAvailable']
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
    uploads: true,
    publicSchedule: true,
    settings: true
  }
};

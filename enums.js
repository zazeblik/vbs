module.exports.Role = {
  Coach: 1,
  LocalAdmin: 2
}

module.exports.GroupType = {
  General: 0,
  Personal: 1
}

module.exports.TransactionType = {
  Payment: 0,
  Income: 1
}

module.exports.GroupMemberActionType = {
  Added: 0,
  Deleted: 1
}

module.exports.SalaryRuleType = {
  Precentage: 0,
  FixPerEvent: 1,
  FixMonthly: 2
}

module.exports.PersonalDebitMode = {
  AlwaysAsk: 0,
  AlwaysDebit: 1, 
  AlwaysNoDebit: 2
}